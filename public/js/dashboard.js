
document.addEventListener('DOMContentLoaded', () => {
    // Redirect if not logged in
    if (!localStorage.getItem('token')) {
        window.location.href = '/';
        return;
    }

    const linksTableBody = document.getElementById('links-table-body');
    const totalLinksEl = document.getElementById('total-links');
    const totalClicksEl = document.getElementById('total-clicks');
    const activeLinksEl = document.getElementById('active-links');
    
    // Analytics Modal Elements
    const analyticsModal = document.getElementById('analytics-modal');
    const closeAnalyticsBtn = document.getElementById('close-analytics-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    let dailyClicksChart, countryChart, deviceBrowserChart;
    let currentAnalyticsData = {}; // Store data for CSV export


    // Theme setup for dashboard
    const themeToggle = document.getElementById('theme-toggle'); // Assuming header is present
    const applyTheme = (theme) => {
         if (theme === 'dark') document.documentElement.classList.add('dark');
         else document.documentElement.classList.remove('dark');
    };
    const currentTheme = localStorage.getItem('theme') || 'light';
    applyTheme(currentTheme);
    if(themeToggle) themeToggle.addEventListener('click', () => { /* Logic from app.js */ });


    window.updateUIForAuthState = (isLoggedIn) => {
        // Similar to app.js, manage header links
        const loginLink = document.getElementById('login-link');
        const logoutLink = document.getElementById('logout-link');
        const dashboardLink = document.getElementById('dashboard-link');

        if (isLoggedIn) {
            loginLink.classList.add('hidden');
            logoutLink.classList.remove('hidden');
            dashboardLink.classList.remove('hidden');
        } else {
            // This case should ideally redirect to home
             window.location.href = '/';
        }
    };

    async function fetchDashboardData() {
        try {
            const res = await fetch('/api/links', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.status === 401) { // Token expired or invalid
                localStorage.clear();
                window.location.href = '/';
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch data');

            const links = await res.json();
            renderLinks(links);
            updateSummaryCards(links);

        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    function renderLinks(links) {
        linksTableBody.innerHTML = '';
        if (links.length === 0) {
            linksTableBody.innerHTML = '<tr><td colspan="5" class="text-center p-4">No links created yet.</td></tr>';
            return;
        }
        links.forEach(link => {
            const row = document.createElement('tr');
            row.className = 'border-b dark:border-gray-700';
            const shortUrl = `${window.location.origin}/${link.shortId}`;
            row.innerHTML = `
                <td class="p-2"><a href="${shortUrl}" target="_blank" class="text-blue-500 hover:underline">${shortUrl}</a></td>
                <td class="p-2 truncate max-w-xs">${link.originalUrl}</td>
                <td class="p-2">${link.clickCount}</td>
                <td class="p-2"><span class="px-2 py-1 text-xs rounded-full ${link.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">${link.enabled ? 'Active' : 'Disabled'}</span></td>
                <td class="p-2">
                    <button data-id="${link.shortId}" class="view-stats-btn text-sm text-blue-500">Stats</button>
                    <button data-id="${link._id}" class="edit-btn text-sm text-yellow-500 ml-2">Edit</button>
                    <button data-id="${link._id}" class="delete-btn text-sm text-red-500 ml-2">Delete</button>
                </td>
            `;
            linksTableBody.appendChild(row);
        });
    }

    function updateSummaryCards(links) {
        const totalClicks = links.reduce((acc, link) => acc + link.clickCount, 0);
        const activeLinks = links.filter(link => link.enabled).length;
        totalLinksEl.textContent = links.length;
        totalClicksEl.textContent = totalClicks;
        activeLinksEl.textContent = activeLinks;
    }

    // Event Delegation for action buttons
    linksTableBody.addEventListener('click', e => {
        if (e.target.classList.contains('view-stats-btn')) {
            const shortId = e.target.dataset.id;
            openAnalyticsModal(shortId);
        }
        // Add logic for edit/delete buttons here...
    });
    
    closeAnalyticsBtn.addEventListener('click', () => analyticsModal.classList.add('hidden'));

    async function openAnalyticsModal(shortId) {
        try {
            const res = await fetch(`/api/links/${shortId}/stats`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) throw new Error('Could not fetch stats');
            const stats = await res.json();
            currentAnalyticsData = stats; // Save for CSV export
            renderCharts(stats);
            analyticsModal.classList.remove('hidden');
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
    
    function renderCharts(stats) {
        // Daily Clicks Chart (Line)
        const dailyCtx = document.getElementById('daily-clicks-chart').getContext('2d');
        const labels = Object.keys(stats.dailyClicks).sort();
        const data = labels.map(label => stats.dailyClicks[label]);

        if (dailyClicksChart) dailyClicksChart.destroy();
        dailyClicksChart = new Chart(dailyCtx, {
            type: 'line',
            data: { labels, datasets: [{ label: 'Clicks', data, borderColor: 'rgb(75, 192, 192)', tension: 0.1 }] },
        });

        // Country Chart (Doughnut)
        const countryCtx = document.getElementById('country-chart').getContext('2d');
        if (countryChart) countryChart.destroy();
        countryChart = new Chart(countryCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(stats.countryCounts),
                datasets: [{ data: Object.values(stats.countryCounts) }]
            },
        });
        
        // Device/Browser Chart (Bar)
        const deviceBrowserCtx = document.getElementById('device-browser-chart').getContext('2d');
        if (deviceBrowserChart) deviceBrowserChart.destroy();
        deviceBrowserChart = new Chart(deviceBrowserCtx, {
            type: 'bar',
            data: {
                labels: ['Devices', 'Browsers'],
                datasets: [
                    ...Object.entries(stats.deviceCounts).map(([label, value]) => ({ label, data: [value, 0] })),
                    ...Object.entries(stats.browserCounts).map(([label, value]) => ({ label, data: [0, value] }))
                ]
            },
            options: { scales: { x: { stacked: true }, y: { stacked: true } } }
        });
        
        // Referrers List
        const referrersList = document.getElementById('referrers-list');
        referrersList.innerHTML = Object.entries(stats.referrerCounts)
            .sort(([,a],[,b]) => b-a)
            .map(([ref, count]) => `<div class="flex justify-between"><span>${ref}</span><span>${count}</span></div>`)
            .join('');
    }

    exportCsvBtn.addEventListener('click', () => {
        if (!currentAnalyticsData) return;
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Category,Item,Count\n";
        
        Object.entries(currentAnalyticsData.dailyClicks).forEach(([day, count]) => {
            csvContent += `Daily Clicks,${day},${count}\n`;
        });
        Object.entries(currentAnalyticsData.countryCounts).forEach(([country, count]) => {
            csvContent += `Countries,${country},${count}\n`;
        });
        // Add other stats...
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "analytics_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Initial data fetch
    fetchDashboardData();
});

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    // If not logged in, redirect to home page
    if (!token) {
        window.location.href = '/';
        return;
    }

    // Page Elements
    const logoutLink = document.getElementById('logout-link');
    const linksTableBody = document.getElementById('links-table-body');
    const shortenForm = document.getElementById('shorten-form');
    const originalUrlInput = document.getElementById('originalUrl');
    const resultArea = document.getElementById('result-area');
    const shortUrlLink = document.getElementById('short-url');
    const copyBtn = document.getElementById('copy-btn');
    
    // Summary Card Elements
    const totalLinksEl = document.getElementById('total-links');
    const totalClicksEl = document.getElementById('total-clicks');
    const activeLinksEl = document.getElementById('active-links');

    // Logout functionality
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('userEmail');
            showToast('Logged out successfully!');
            setTimeout(() => window.location.href = '/', 1500);
        });
    }
    
    // Shorten form functionality
    if (shortenForm) {
        shortenForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const originalUrl = originalUrlInput.value;
            try {
                const res = await fetch('/api/shorten', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ originalUrl }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to shorten link');
                
                shortUrlLink.href = data.shortUrl;
                shortUrlLink.textContent = data.shortUrl;
                resultArea.style.display = 'block';
                originalUrlInput.value = ''; // Clear input
                showToast('Link shortened successfully!');
                fetchLinks(); // Refresh the links list
            } catch (error) {
                showToast(error.message, true);
            }
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(shortUrlLink.textContent).then(() => {
                showToast('Copied to clipboard!');
            });
        });
    }

    // Fetch and display user's links
    async function fetchLinks() {
        try {
            const res = await fetch('/api/links', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Could not fetch links.');
            const links = await res.json();
            renderLinks(links);
            updateSummaryCards(links);
        } catch (error) {
            linksTableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-400">${error.message}</td></tr>`;
        }
    }

    function renderLinks(links) {
        if (links.length === 0) {
            linksTableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center">You have not created any links yet.</td></tr>';
            return;
        }
        linksTableBody.innerHTML = links.map(link => `
            <tr class="border-b border-gray-700">
                <td class="p-2">
                    <a href="${link.shortUrl}" target="_blank" class="text-blue-400 hover:underline">${link.shortUrl.replace(/^https?:\/\//, '')}</a>
                    <button data-copy="${link.shortUrl}" class="copy-link-btn ml-2 text-gray-400 hover:text-white">📋</button>
                </td>
                <td class="p-2 text-gray-400 truncate max-w-xs">${link.originalUrl}</td>
                <td class="p-2">${link.clickCount}</td>
                <td class="p-2">
                    <span class="px-2 py-1 text-xs rounded-full ${link.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">${link.enabled ? 'Active' : 'Disabled'}</span>
                </td>
                <td class="p-2 space-x-2">
                    <button data-id="${link._id}" class="delete-btn text-red-500 hover:text-red-400">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    function updateSummaryCards(links) {
        totalLinksEl.textContent = links.length;
        totalClicksEl.textContent = links.reduce((sum, link) => sum + link.clickCount, 0);
        activeLinksEl.textContent = links.filter(link => link.enabled).length;
    }

    // Event delegation for copy and delete buttons in the table
    linksTableBody.addEventListener('click', async (e) => {
        // Handle copy button
        if (e.target.classList.contains('copy-link-btn')) {
            const urlToCopy = e.target.dataset.copy;
            navigator.clipboard.writeText(urlToCopy).then(() => showToast('Copied to clipboard!'));
        }
        
        // Handle delete button
        if (e.target.classList.contains('delete-btn')) {
            const linkId = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this link?')) {
                try {
                    const res = await fetch(`/api/links/${linkId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!res.ok) throw new Error('Failed to delete link.');
                    showToast('Link deleted successfully!');
                    fetchLinks(); // Refresh list after deleting
                } catch (error) {
                    showToast(error.message, true);
                }
            }
        }
    });

    // Initial fetch of links when the page loads
    fetchLinks();
});

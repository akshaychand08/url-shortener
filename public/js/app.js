
// File: public/js/app.js
```javascript
// Main application logic for index.html

document.addEventListener('DOMContentLoaded', () => {
    // Shared elements
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconLight = document.getElementById('theme-icon-light');
    const themeIconDark = document.getElementById('theme-icon-dark');
    
    // Form elements
    const shortenForm = document.getElementById('shorten-form');
    const originalUrlInput = document.getElementById('originalUrl');
    const aliasInput = document.getElementById('alias');
    const passwordInput = document.getElementById('password');
    const expiresAtInput = document.getElementById('expiresAt');
    
    // Result elements
    const resultArea = document.getElementById('result-area');
    const shortUrlLink = document.getElementById('short-url');
    const copyBtn = document.getElementById('copy-btn');
    const qrBtn = document.getElementById('qr-btn');
    const qrCodeContainer = document.getElementById('qr-code-container');

    // Advanced options
    const optionsToggle = document.getElementById('options-toggle');
    const advancedOptions = document.getElementById('advanced-options');

    // User-specific elements
    const userLinksSection = document.getElementById('user-links-section');
    const userLinksList = document.getElementById('user-links-list');


    // --- THEME TOGGLE ---
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            themeIconLight.classList.remove('hidden');
            themeIconDark.classList.add('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            themeIconLight.classList.add('hidden');
            themeIconDark.classList.remove('hidden');
        }
    };

    const currentTheme = localStorage.getItem('theme') || 'light';
    applyTheme(currentTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
    
    
    // --- AUTH STATE ---
    // This function will be called from auth.js when the auth state is known
    window.updateUIForAuthState = (isLoggedIn) => {
        const loginLink = document.getElementById('login-link');
        const logoutLink = document.getElementById('logout-link');
        const dashboardLink = document.getElementById('dashboard-link');

        if (isLoggedIn) {
            loginLink.classList.add('hidden');
            logoutLink.classList.remove('hidden');
            dashboardLink.classList.remove('hidden');
            userLinksSection.classList.remove('hidden');
            fetchUserLinks();
        } else {
            loginLink.classList.remove('hidden');
            logoutLink.classList.add('hidden');
            dashboardLink.classList.add('hidden');
            userLinksSection.classList.add('hidden');
        }
    };


    // --- SHORTEN FORM LOGIC ---
    optionsToggle.addEventListener('click', (e) => {
        e.preventDefault();
        advancedOptions.classList.toggle('hidden');
        optionsToggle.innerHTML = advancedOptions.classList.contains('hidden') ? 'Advanced Options &darr;' : 'Advanced Options &uarr;';
    });

    shortenForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const originalUrl = originalUrlInput.value;
        const alias = aliasInput.value;
        const password = passwordInput.value;
        const expiresAt = expiresAtInput.value;
        
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const res = await fetch('/api/shorten', {
                method: 'POST',
                headers,
                body: JSON.stringify({ originalUrl, alias, password, expiresAt }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            shortUrlLink.href = data.shortUrl;
            shortUrlLink.textContent = data.shortUrl;
            resultArea.classList.remove('hidden');
            qrCodeContainer.innerHTML = ''; // Clear previous QR
            
            if (window.isUserLoggedIn()) {
                fetchUserLinks(); // Refresh user links
            }

        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(shortUrlLink.href).then(() => {
            showToast('Copied to clipboard!');
        });
    });
    
    qrBtn.addEventListener('click', async () => {
        // This is a simple client-side QR generation.
        // A more robust solution might fetch it from a dedicated API endpoint.
        if (qrCodeContainer.innerHTML !== '') {
            qrCodeContainer.innerHTML = ''; // Toggle off
            return;
        }
        try {
            const QRCode = await import('https://cdn.skypack.dev/qrcode');
            const dataUrl = await QRCode.toDataURL(shortUrlLink.href, { width: 150 });
            qrCodeContainer.innerHTML = `<img src="${dataUrl}" alt="QR Code">`;
        } catch (err) {
            showToast('Failed to generate QR code.', 'error');
        }
    });

    async function fetchUserLinks() {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('/api/links', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Could not fetch links');
            
            const links = await res.json();
            userLinksList.innerHTML = ''; // Clear list

            links.slice(0, 5).forEach(link => {
                const linkEl = document.createElement('div');
                linkEl.className = 'p-2 bg-white dark:bg-gray-700 rounded shadow-sm flex justify-between items-center';
                linkEl.innerHTML = `
                    <div>
                        <a href="/${link.shortId}" target="_blank" class="font-bold text-blue-500">${process.env.BASE_URL || window.location.origin}/${link.shortId}</a>
                        <p class="text-sm text-gray-500 dark:text-gray-400 truncate">${link.originalUrl}</p>
                    </div>
                    <div class="text-sm">${link.clickCount} clicks</div>
                `;
                userLinksList.appendChild(linkEl);
            });
        } catch (error) {
            console.error(error);
        }
    }
});

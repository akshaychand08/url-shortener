// File: public/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    const shortenForm = document.getElementById('shorten-form');
    const originalUrlInput = document.getElementById('originalUrl');
    const resultArea = document.getElementById('result-area');
    const shortUrlLink = document.getElementById('short-url');
    const copyBtn = document.getElementById('copy-btn');
    
    // Auth related elements
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const dashboardLink = document.getElementById('dashboard-link');

    // Update UI based on login status
    if (localStorage.getItem('token')) {
        loginLink.style.display = 'none';
        logoutLink.style.display = 'block';
        dashboardLink.style.display = 'block';
    } else {
        loginLink.style.display = 'block';
        logoutLink.style.display = 'none';
        dashboardLink.style.display = 'none';
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.reload();
        });
    }

    if (shortenForm) {
        shortenForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const originalUrl = originalUrlInput.value;
            
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            try {
                // FIX: Use the public '/api/shorten' endpoint instead of the protected '/api/links'
                const res = await fetch('/api/shorten', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ originalUrl }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Something went wrong');
                }

                shortUrlLink.href = data.shortUrl;
                shortUrlLink.textContent = data.shortUrl;
                resultArea.style.display = 'block';

            } catch (error) {
                alert(error.message);
            }
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(shortUrlLink.href).then(() => {
                alert('Copied to clipboard!');
            });
        });
    }
});

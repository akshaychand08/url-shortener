// File: public/js/app.js
document.addEventListener('DOMContentLoaded', () => {
    const shortenForm = document.getElementById('shorten-form');
    const originalUrlInput = document.getElementById('originalUrl');
    const resultArea = document.getElementById('result-area');
    const shortUrlLink = document.getElementById('short-url');
    const copyBtn = document.getElementById('copy-btn');

    if (shortenForm) {
        shortenForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const originalUrl = originalUrlInput.value;
            
            try {
                const res = await fetch('/api/shorten', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ originalUrl }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Something went wrong');
                }

                // FIX: This will now find and display the result
                if (resultArea && shortUrlLink) {
                    shortUrlLink.href = data.shortUrl;
                    shortUrlLink.textContent = data.shortUrl;
                    resultArea.style.display = 'block';
                }

            } catch (error) {
                alert(error.message);
            }
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (shortUrlLink.href) {
                navigator.clipboard.writeText(shortUrlLink.href).then(() => {
                    alert('Copied to clipboard!');
                });
            }
        });
    }
});

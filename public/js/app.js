document.addEventListener('DOMContentLoaded', () => {
    const shortenForm = document.getElementById('shorten-form');
    const originalUrlInput = document.getElementById('originalUrl');
    const resultArea = document.getElementById('result-area');
    const shortUrlLink = document.getElementById('short-url');
    const copyBtn = document.getElementById('copy-btn');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    function showToast(message, isError = false) {
        toastMessage.textContent = message;
        toast.className = 'fixed bottom-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg'; // Reset
        toast.classList.add(isError ? 'bg-red-500' : 'bg-green-500');
        toast.classList.remove('hidden');
        setTimeout(() => { toast.classList.add('hidden'); }, 3000);
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
                const res = await fetch('/api/links', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ originalUrl }),
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Failed to shorten URL');
                }

                shortUrlLink.href = data.shortUrl;
                shortUrlLink.textContent = data.shortUrl.replace(/^https?:\/\//, '');
                resultArea.classList.remove('hidden');
                showToast('URL shortened successfully!');
            } catch (error) {
                showToast(error.message, true);
            }
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(shortUrlLink.href).then(() => {
                showToast('Copied to clipboard!');
            });
        });
    }

    // Call checkAuthState from auth.js to update UI
    if (window.checkAuthState) {
        window.checkAuthState();
    }
});

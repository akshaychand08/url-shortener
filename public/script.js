const form = document.getElementById('shorten-form');
const originalUrlInput = document.getElementById('original-url');
const resultDiv = document.getElementById('result');
const shortUrlLink = document.getElementById('short-url');
const copyBtn = document.getElementById('copy-btn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const originalUrl = originalUrlInput.value;

    try {
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ originalUrl }),
        });

        const data = await response.json();

        if (response.ok) {
            shortUrlLink.href = data.shortUrl;
            shortUrlLink.textContent = data.shortUrl;
            resultDiv.classList.remove('hidden');
        } else {
            alert(data.error);
        }
    } catch (err) {
        console.error(err);
        alert('An error occurred.');
    }
});

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(shortUrlLink.href).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
        }, 2000);
    });
});

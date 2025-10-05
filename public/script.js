const form = document.getElementById('shorten-form');
const fullUrlInput = document.getElementById('fullUrl');
const resultDiv = document.getElementById('result');
const shortUrlLink = document.getElementById('shortUrlLink');
const copyBtn = document.getElementById('copy-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fullUrl = fullUrlInput.value;

  try {
    const response = await fetch('/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullUrl }),
    });

    if (!response.ok) {
        throw new Error('Failed to shorten URL');
    }

    const data = await response.json();
    const shortUrl = `${window.location.origin}/${data.shortUrl}`;
    
    shortUrlLink.href = shortUrl;
    shortUrlLink.textContent = shortUrl;
    resultDiv.classList.remove('hidden');

  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong. Please try again.');
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

const form = document.getElementById('shorten-form');
const fullUrlInput = document.getElementById('fullUrl');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error-message');
const shortUrlLink = document.getElementById('shortUrlLink');
const copyBtn = document.getElementById('copy-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fullUrl = fullUrlInput.value;

  // Hide previous results and errors
  resultDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');

  try {
    const response = await fetch('/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullUrl }),
    });

    if (!response.ok) {
      throw new Error('Response was not ok.');
    }

    const data = await response.json();
    const shortUrl = `${window.location.origin}/${data.shortUrl}`;
    
    // Set the link and text for the shortened URL
    shortUrlLink.href = shortUrl;
    shortUrlLink.textContent = shortUrl;
    
    // Show the result div
    resultDiv.classList.remove('hidden');
    
    // Reset copy button text
    copyBtn.textContent = 'Copy';
    copyBtn.classList.remove('copied');

  } catch (error) {
    console.error('Error:', error);
    // Show the error message div
    errorDiv.classList.remove('hidden');
  }
});

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(shortUrlLink.href).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
});

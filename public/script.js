const form = document.getElementById('shorten-form');
const fullUrlInput = document.getElementById('fullUrl');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error-message');
const shortUrlLink = document.getElementById('shortUrlLink');
const copyBtn = document.getElementById('copy-btn');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const loading = document.getElementById('loading');
const linksShortened = document.getElementById('links-shortened');
const clicksTotal = document.getElementById('clicks-total');

// Initialize stats from localStorage
let stats = JSON.parse(localStorage.getItem('swiftlyStats')) || {
  linksShortened: 0,
  clicksTotal: 0
};

linksShortened.textContent = stats.linksShortened;
clicksTotal.textContent = stats.clicksTotal;

// URL validation function
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// Generate a random short code
function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Show loading state
function showLoading() {
  btnText.style.display = 'none';
  loading.style.display = 'block';
  submitBtn.disabled = true;
}

// Hide loading state
function hideLoading() {
  btnText.style.display = 'block';
  loading.style.display = 'none';
  submitBtn.disabled = false;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fullUrl = fullUrlInput.value.trim();

  // Show loading state
  showLoading();

  // Hide previous results and errors
  resultDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');

  // Validate URL
  if (!isValidUrl(fullUrl)) {
    errorDiv.classList.remove('hidden');
    hideLoading();
    return;
  }

  // Simulate API delay
  setTimeout(() => {
    try {
      // In a real application, this would be a server call
      // For demo purposes, we'll simulate the API response
      const shortCode = generateShortCode();
      const shortUrl = `${window.location.origin}/s/${shortCode}`;
      
      // Set the link and text for the shortened URL
      shortUrlLink.href = shortUrl;
      shortUrlLink.textContent = shortUrl;
      
      // Show the result div
      resultDiv.classList.remove('hidden');
      
      // Reset copy button text
      copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
      copyBtn.classList.remove('copied');

      // Update stats
      stats.linksShortened++;
      linksShortened.textContent = stats.linksShortened;
      localStorage.setItem('swiftlyStats', JSON.stringify(stats));

    } catch (error) {
      console.error('Error:', error);
      // Show the error message div
      errorDiv.classList.remove('hidden');
    } finally {
      hideLoading();
    }
  }, 800);
});

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(shortUrlLink.href).then(() => {
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            copyBtn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
});

// Add click tracking for demo purposes
shortUrlLink.addEventListener('click', () => {
  stats.clicksTotal++;
  clicksTotal.textContent = stats.clicksTotal;
  localStorage.setItem('swiftlyStats', JSON.stringify(stats));
});

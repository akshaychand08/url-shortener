
// File: public/js/ui.js
```javascript
// --- TOAST NOTIFICATION ---
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    
    // Reset classes
    toast.className = 'fixed bottom-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg';

    if (type === 'error') {
        toast.classList.add('bg-red-500');
    } else {
        toast.classList.add('bg-green-500');
    }

    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// --- MODAL HANDLING ---
const authModal = document.getElementById('auth-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const loginLink = document.getElementById('login-link');

if (loginLink) {
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        authModal.classList.remove('hidden');
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        authModal.classList.add('hidden');
    });
}

// Close modal if clicking outside the content
if (authModal) {
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.add('hidden');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const dashboardLink = document.getElementById('dashboard-link');
    const authModal = document.getElementById('auth-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const authForm = document.getElementById('auth-form');
    const modalTitle = document.getElementById('modal-title');
    const nameInput = document.getElementById('auth-name');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const loginText = document.getElementById('login-text');
    const signupText = document.getElementById('signup-text');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    let isLoginMode = true;

    function showToast(message, isError = false) {
        toastMessage.textContent = message;
        toast.className = 'fixed bottom-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg'; // Reset
        toast.classList.add(isError ? 'bg-red-500' : 'bg-green-500');
        toast.classList.remove('hidden');
        setTimeout(() => { toast.classList.add('hidden'); }, 3000);
    }
    
    function updateUIVisibility(isLoggedIn) {
        loginLink.classList.toggle('hidden', isLoggedIn);
        logoutLink.classList.toggle('hidden', !isLoggedIn);
        dashboardLink.classList.toggle('hidden', !isLoggedIn);
    }

    function checkAuthState() {
        const token = localStorage.getItem('token');
        updateUIVisibility(!!token);
    }
    window.checkAuthState = checkAuthState; // Make it globally accessible for app.js

    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            authModal.classList.remove('hidden');
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => { authModal.classList.add('hidden'); });
    }
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) { authModal.classList.add('hidden'); }
        });
    }
    
    function toggleMode(isLogin) {
        isLoginMode = isLogin;
        modalTitle.textContent = isLogin ? 'Login' : 'Sign Up';
        nameInput.classList.toggle('hidden', isLogin); // 'name' input is not used in this simplified version
        loginText.classList.toggle('hidden', !isLogin);
        signupText.classList.toggle('hidden', isLogin);
    }

    if(showSignup) showSignup.addEventListener('click', (e) => { e.preventDefault(); toggleMode(false); });
    if(showLogin) showLogin.addEventListener('click', (e) => { e.preventDefault(); toggleMode(true); });

    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;
            const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/signup';
            
            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                const data = await res.json();
                if (!res.ok) { throw new Error(data.error || 'Authentication failed'); }

                localStorage.setItem('token', data.token);
                showToast(isLoginMode ? 'Logged in successfully!' : 'Signed up successfully!');
                authModal.classList.add('hidden');
                checkAuthState();
            } catch (error) {
                showToast(error.message, true);
            }
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            showToast('Logged out.');
            checkAuthState();
            if (window.location.pathname.includes('dashboard')) {
                window.location.href = '/';
            }
        });
    }

    checkAuthState(); // Initial check on page load
});


document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('auth-modal');
    const authForm = document.getElementById('auth-form');
    const modalTitle = document.getElementById('modal-title');
    const nameInput = document.getElementById('auth-name');
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const loginText = document.getElementById('login-text');
    const signupText = document.getElementById('signup-text');
    const logoutLink = document.getElementById('logout-link');

    let isLoginMode = true;

    function toggleMode(isLogin) {
        isLoginMode = isLogin;
        modalTitle.textContent = isLogin ? 'Login' : 'Sign Up';
        nameInput.classList.toggle('hidden', isLogin);
        loginText.classList.toggle('hidden', !isLogin);
        signupText.classList.toggle('hidden', isLogin);
        authForm.querySelector('button[type="submit"]').textContent = isLogin ? 'Login' : 'Sign Up';
    }

    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMode(false);
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMode(true);
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;
        const name = nameInput.value;
        const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/signup';
        
        const body = isLoginMode ? { email, password } : { name, email, password };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            authModal.classList.add('hidden');
            showToast(isLoginMode ? 'Logged in successfully!' : 'Signed up successfully!');
            checkAuthState(); // Update UI immediately
            
            // If on dashboard, reload to fetch data. Otherwise, let app.js handle it.
            if (window.location.pathname.includes('dashboard')) {
                window.location.reload();
            }

        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showToast('Logged out.');
        checkAuthState();
        // Redirect to home if on a protected page
        if (window.location.pathname.includes('dashboard')) {
             window.location.href = '/';
        }
    });

    function checkAuthState() {
        const token = localStorage.getItem('token');
        const isLoggedIn = !!token;
        
        // Make login status globally available
        window.isUserLoggedIn = () => isLoggedIn;

        // updateUIForAuthState is defined in app.js and dashboard.js
        if (typeof window.updateUIForAuthState === 'function') {
            window.updateUIForAuthState(isLoggedIn);
        }
    }
    
    // Initial check on page load
    checkAuthState();
});

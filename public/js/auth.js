document.addEventListener('DOMContentLoaded', () => {
    // Redirect to dashboard if already logged in
    if (localStorage.getItem('token') && window.location.pathname === '/') {
        window.location.href = '/dashboard.html';
        return;
    }

    const authForm = document.getElementById('auth-form');
    const modalTitle = document.getElementById('modal-title');
    const nameInput = document.getElementById('auth-name');
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const loginText = document.getElementById('login-text');
    const signupText = document.getElementById('signup-text');
    const submitButton = authForm.querySelector('button[type="submit"]');

    let isLoginMode = true;

    function toggleMode(isLogin) {
        isLoginMode = isLogin;
        modalTitle.textContent = isLogin ? 'Login' : 'Sign Up';
        nameInput.style.display = isLogin ? 'none' : 'block';
        loginText.style.display = isLogin ? 'block' : 'none';
        signupText.style.display = isLogin ? 'none' : 'block';
        submitButton.textContent = isLogin ? 'Login' : 'Sign Up';
    }

    if(showSignup) showSignup.addEventListener('click', (e) => { e.preventDefault(); toggleMode(false); });
    if(showLogin) showLogin.addEventListener('click', (e) => { e.preventDefault(); toggleMode(true); });

    if(authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value;
            const password = passwordInput.value;
            const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/signup';
            
            const body = { email, password };
            if (!isLoginMode) {
                body.name = nameInput.value; // Add name for signup
            }

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Authentication failed');

                localStorage.setItem('token', data.token);
                localStorage.setItem('userEmail', data.email);
                
                showToast(isLoginMode ? 'Logged in successfully! Redirecting...' : 'Signed up successfully! Redirecting...');
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1500);

            } catch (error) {
                showToast(error.message, true);
            }
        });
    }
});

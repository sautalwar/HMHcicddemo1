// Authentication handling
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleLogin();
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleRegister();
    });
  }
});

async function handleLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('error-message');

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = '/products';
    } else {
      errorDiv.textContent = data.error || 'Login failed';
      errorDiv.classList.remove('d-none');
    }
  } catch (error) {
    errorDiv.textContent = 'An error occurred. Please try again.';
    errorDiv.classList.remove('d-none');
  }
}

async function handleRegister() {
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('error-message');

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = '/products';
    } else {
      errorDiv.textContent = data.error || 'Registration failed';
      errorDiv.classList.remove('d-none');
    }
  } catch (error) {
    errorDiv.textContent = 'An error occurred. Please try again.';
    errorDiv.classList.remove('d-none');
  }
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

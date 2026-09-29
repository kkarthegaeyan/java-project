(() => {
  const form = document.getElementById('loginForm');
  const notice = document.getElementById('loginNotice');
  const submitButton = document.getElementById('signInButton');
  let csrfDetails = null;

  function showNotice(message, kind = 'error') {
    notice.textContent = message;
    notice.className = `login-notice visible ${kind}`;
  }

  async function loadCsrfToken() {
    const response = await fetch('/api/auth/csrf', { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Could not prepare secure sign-in. Refresh the page and try again.');
    csrfDetails = await response.json();
    return csrfDetails;
  }

  const query = new URLSearchParams(window.location.search);
  if (query.has('error')) showNotice('Those sign-in details did not match. Please try again.');
  else if (query.has('logout')) showNotice('You have signed out. See you next time!', 'success');
  else if (query.has('expired')) showNotice('Your session ended. Sign in again to continue.');

  document.getElementById('showPassword').addEventListener('click', (event) => {
    const password = document.getElementById('password');
    const isVisible = password.type === 'text';
    password.type = isVisible ? 'password' : 'text';
    event.currentTarget.textContent = isVisible ? 'Show' : 'Hide';
    event.currentTarget.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
  });

  loadCsrfToken().catch((error) => showNotice(error.message));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    submitButton.querySelector('span:first-child').textContent = 'Signing in…';
    try {
      csrfDetails ||= await loadCsrfToken();
      let hidden = form.querySelector('input[name="' + CSS.escape(csrfDetails.parameterName) + '"]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = csrfDetails.parameterName;
        form.appendChild(hidden);
      }
      hidden.value = csrfDetails.token;
      form.submit();
    } catch (error) {
      showNotice(error.message);
      submitButton.disabled = false;
      submitButton.querySelector('span:first-child').textContent = 'Sign in';
    }
  });
})();

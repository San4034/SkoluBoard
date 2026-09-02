let isSetup = false;

const token = localStorage.getItem('skoluboard_token');
if (token) {
  fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
    .then(r => { if (r.ok) location.href = '/admin.html'; })
    .catch(() => {});
}

fetch('/api/setup/status')
  .then(r => r.json())
  .then(({ needsSetup }) => {
    if (!needsSetup) return;
    isSetup = true;
    document.getElementById('card-title').textContent = 'First run';
    document.getElementById('card-sub').textContent   = 'Create an administrator account';
    document.getElementById('submit-btn').textContent = 'Create & sign in';
    document.getElementById('password2-group').style.display = '';
    showInfo('This is the first launch. Create an administrator account. Your password will be stored encrypted.');
  });

async function handleLogin(e) {
  e.preventDefault();
  hideError();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const btn      = document.getElementById('submit-btn');

  if (isSetup) {
    const password2 = document.getElementById('password2').value;
    if (password !== password2) { showError('Passwords do not match'); return; }
    if (password.length < 8)    { showError('Password must be at least 8 characters'); return; }
  }

  btn.disabled = true;
  btn.textContent = 'Please wait…';

  try {
    if (isSetup) {
      const r = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
    }

    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);

    localStorage.setItem('skoluboard_token', data.token);
    localStorage.setItem('skoluboard_user',  data.username);
    location.href = '/admin.html';
  } catch (err) {
    showError(err.message || 'Server error');
    btn.disabled    = false;
    btn.textContent = isSetup ? 'Create & sign in' : 'Sign in';
  }
}

function showError(msg) {
  const el = document.getElementById('error-box');
  el.textContent = msg;
  el.classList.add('show');
}

function showInfo(msg) {
  const el = document.getElementById('info-box');
  el.textContent = msg;
  el.classList.add('show');
}

function hideError() {
  document.getElementById('error-box').classList.remove('show');
}

// Car Rental System - web frontend (vanilla JS).
// Served from the same folder as the PHP API (e.g. /car_rental_system),
// so the API base is this folder + "/api".

const APP_DIR = (() => {
  let dir = location.pathname;
  if (!dir.endsWith('/')) dir = dir.replace(/[^/]*$/, '');
  return dir.replace(/\/$/, ''); // e.g. "/car_rental_system" (or "" at web root)
})();
const API_BASE = APP_DIR + '/api';

const state = {
  user: JSON.parse(localStorage.getItem('cr_user') || 'null'),
  pendingEmail: null, // email awaiting OTP verification
};

// ---------- helpers ----------
function toast(msg, kind = 'ok') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast ' + kind;
  setTimeout(() => el.classList.add('hidden'), 3500);
}

async function api(path, { method = 'GET', body } = {}) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(API_BASE + path, opts);
  let data = {};
  try { data = await res.json(); } catch (_) {}
  return { ok: res.ok, status: res.status, data };
}

function tmpl(id) {
  return document.getElementById(id).content.cloneNode(true);
}

function setUser(user) {
  state.user = user;
  if (user) localStorage.setItem('cr_user', JSON.stringify(user));
  else localStorage.removeItem('cr_user');
  renderNav();
}

function renderNav() {
  const signedIn = !!state.user;
  document.getElementById('navSignin').classList.toggle('hidden', signedIn);
  document.getElementById('navSignup').classList.toggle('hidden', signedIn);
  document.getElementById('navSignout').classList.toggle('hidden', !signedIn);
  const chip = document.getElementById('userChip');
  chip.classList.toggle('hidden', !signedIn);
  if (signedIn) chip.textContent = '👤 ' + (state.user.full_name || state.user.email);
}

// ---------- views ----------
async function viewCars(root) {
  root.appendChild(tmpl('view-cars'));
  const form = root.querySelector('#carFilters');
  const grid = root.querySelector('#carGrid');
  const countEl = root.querySelector('#carCount');

  async function load() {
    const fd = new FormData(form);
    const params = new URLSearchParams();
    for (const [k, v] of fd.entries()) if (v) params.append(k, v);
    countEl.textContent = 'Loading…';
    grid.innerHTML = '';
    const { ok, data } = await api('/cars' + (params.toString() ? '?' + params : ''));
    if (!ok || !data.success) { countEl.textContent = 'Failed to load cars.'; return; }
    countEl.textContent = data.count + ' car' + (data.count === 1 ? '' : 's') + ' found';
    if (data.count === 0) { grid.innerHTML = '<p class="empty">No cars match your search.</p>'; return; }
    for (const c of data.data) grid.appendChild(carCard(c));
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); load(); });
  load();
}

const CAR_ICONS = { SUV: '🚙', Sedan: '🚗', Sports: '🏎️', Hatchback: '🚘' };
function carCard(c) {
  const el = document.createElement('div');
  el.className = 'car-card';
  el.innerHTML = `
    <div class="car-thumb">${CAR_ICONS[c.type] || '🚗'}</div>
    <div class="car-body">
      <div class="car-name">${esc(c.name)}</div>
      <div class="car-meta">${esc(c.brand)} · ${esc(c.location || '')}</div>
      <div class="car-tags">
        <span class="tag">${esc(c.type || '')}</span>
        <span class="tag">${esc(c.transmission)}</span>
        <span class="tag">${esc(c.fuel_type)}</span>
        <span class="tag">${c.seats} seats</span>
      </div>
      <div class="car-foot">
        <span class="price">$${c.price_per_day}<small>/day</small></span>
        <span class="rating">★ ${c.rating}</span>
      </div>
    </div>`;
  return el;
}

function viewSignin(root) {
  root.appendChild(tmpl('view-signin'));
  root.querySelector('#signinForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const { ok, data } = await api('/auth/login', {
      method: 'POST',
      body: { email: f.email.value.trim(), password: f.password.value },
    });
    if (ok && data.success) {
      setUser(data.user);
      toast('Welcome back, ' + (data.user.full_name || data.user.email) + '!');
      go('#/cars');
    } else if (data.code === 'not_verified' || /verif/i.test(data.message || '')) {
      state.pendingEmail = f.email.value.trim();
      toast(data.message || 'Please verify your account first.', 'err');
      go('#/otp');
    } else {
      toast(data.message || 'Sign in failed.', 'err');
    }
  });
}

function viewSignup(root) {
  root.appendChild(tmpl('view-signup'));
  root.querySelector('#signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const { ok, data } = await api('/auth/register', {
      method: 'POST',
      body: {
        full_name: f.full_name.value.trim(),
        email: f.email.value.trim(),
        phone: f.phone.value.trim() || null,
        country: f.country.value.trim() || null,
        password: f.password.value,
      },
    });
    if (ok && data.success) {
      state.pendingEmail = data.user.email;
      state.lastOtp = data.otp || null; // dev-mode code from API
      toast('Account created! Enter the code to verify.');
      go('#/otp');
    } else {
      toast(data.message || 'Sign up failed.', 'err');
    }
  });
}

function viewOtp(root) {
  if (!state.pendingEmail) { go('#/signup'); return; }
  root.appendChild(tmpl('view-otp'));
  root.querySelector('#otpEmail').textContent = state.pendingEmail;
  const form = root.querySelector('#otpForm');
  if (state.lastOtp) form.code.value = state.lastOtp; // auto-fill in dev mode
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { ok, data } = await api('/auth/verify-otp', {
      method: 'POST',
      body: { email: state.pendingEmail, code: e.target.code.value.trim() },
    });
    if (ok && data.success) {
      toast('Account verified! You can sign in now.');
      state.pendingEmail = null; state.lastOtp = null;
      go('#/signin');
    } else {
      toast(data.message || 'Verification failed.', 'err');
    }
  });
}

function viewReset(root) {
  root.appendChild(tmpl('view-reset'));
  const step2 = root.querySelector('#resetStep2');
  let email = '';
  root.querySelector('#resetRequestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    email = e.target.email.value.trim();
    const { ok, data } = await api('/auth/request-reset', { method: 'POST', body: { email } });
    if (ok && data.success) {
      step2.classList.remove('hidden');
      const msg = data.otp ? ('Reset code (dev): ' + data.otp) : 'If that email exists, a reset code was sent.';
      toast(msg);
      if (data.otp) root.querySelector('#resetConfirmForm').code.value = data.otp;
    } else {
      toast(data.message || 'Could not start reset.', 'err');
    }
  });
  root.querySelector('#resetConfirmForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const { ok, data } = await api('/auth/reset-password', {
      method: 'POST',
      body: { email, code: f.code.value.trim(), password: f.password.value },
    });
    if (ok && data.success) {
      toast('Password updated! Sign in with your new password.');
      go('#/signin');
    } else {
      toast(data.message || 'Reset failed.', 'err');
    }
  });
}

// ---------- router ----------
const routes = {
  '#/cars': viewCars,
  '#/signin': viewSignin,
  '#/signup': viewSignup,
  '#/otp': viewOtp,
  '#/reset': viewReset,
};

function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }

async function render() {
  const root = document.getElementById('app');
  root.innerHTML = '';
  const view = routes[location.hash] || viewCars;
  await view(root);
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- boot ----------
document.getElementById('navHome').addEventListener('click', () => go('#/cars'));
document.getElementById('navSignout').addEventListener('click', () => {
  setUser(null); toast('Signed out.'); go('#/cars');
});
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]');
  if (a) { /* default hash navigation handles it */ }
});
window.addEventListener('hashchange', render);
renderNav();
if (!location.hash) location.hash = '#/cars'; else render();

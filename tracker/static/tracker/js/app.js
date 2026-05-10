const API_BASE = '/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('grind_token');
const getUser  = () => localStorage.getItem('grind_user');

// Update navbar based on auth state
function updateNav() {
    const nav = document.getElementById('nav-auth');
    if (getToken()) {
        nav.innerHTML = `
            <span style="color:var(--muted);font-size:0.8rem">
                $ ${getUser()}
            </span>
            <button onclick="logout()" class="btn btn-sm" 
                style="border:1px solid var(--red);color:var(--red);
                font-family:'JetBrains Mono',monospace">
                logout
            </button>
        `;
    }
}

// Logout
function logout() {
    localStorage.removeItem('grind_token');
    localStorage.removeItem('grind_user');
    window.location.href = '/';
}

// Router — load page based on URL
function router() {
    const path = window.location.pathname;
    const app  = document.getElementById('app-content');
    updateNav();
    if (path === '/' || path === '')        renderHome(app);
    else if (path === '/register')          renderRegister(app);
    else if (path === '/login')             renderLogin(app);
    else if (path === '/dashboard')         renderDashboard(app);
    else app.innerHTML = '<p style="color:var(--muted)">404 — page not found</p>';
}

// Home page
function renderHome(app) {
    if (getToken()) { window.location.href = '/dashboard'; return; }
    app.innerHTML = `
        <div style="max-width:600px;margin:80px auto;text-align:center">
            <div style="font-family:'JetBrains Mono',monospace;
                color:var(--green);font-size:0.8rem;margin-bottom:16px">
                // daily.grind
            </div>
            <h1 style="font-size:2.5rem;font-weight:800;margin-bottom:16px">
                Track Your Grind
            </h1>
            <p style="color:var(--muted);margin-bottom:32px;font-size:0.95rem">
                Log your daily coding hours, job applications and reflections.
                Built for developers who code after their day job.
            </p>
            <div class="d-flex gap-3 justify-content-center">
                <a href="/register" class="btn btn-success px-4">
                    get started →
                </a>
                <a href="/login" class="btn btn-primary px-4">
                    login
                </a>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', router);

// Register page
function renderRegister(app) {
    if (getToken()) { window.location.href = '/dashboard'; return; }
    app.innerHTML = `
        <div style="max-width:480px;margin:60px auto">
            <div class="section-title">// register</div>
            <div class="card p-4">
                <div id="reg-error"></div>
                <div class="mb-3">
                    <label class="form-label">$ username</label>
                    <input type="text" id="reg-username" class="form-control" placeholder="your_username">
                </div>
                <div class="mb-3">
                    <label class="form-label">$ email</label>
                    <input type="email" id="reg-email" class="form-control" placeholder="you@example.com">
                </div>
                <div class="mb-3">
                    <label class="form-label">$ password</label>
                    <input type="password" id="reg-password" class="form-control" placeholder="••••••••">
                </div>
                <button onclick="submitRegister()" class="btn btn-success w-100">
                    run register.py →
                </button>
                <p style="color:var(--muted);font-size:0.78rem;margin-top:12px;text-align:center">
                    Already have an account? <a href="/login" style="color:var(--blue)">login</a>
                </p>
            </div>
        </div>
    `;
}

async function submitRegister() {
    const username = document.getElementById('reg-username').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const errDiv   = document.getElementById('reg-error');

    if (!username || !password) {
        errDiv.innerHTML = '<div class="alert-error">Username and password required.</div>';
        return;
    }

    const res  = await fetch(`${API_BASE}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();

    if (res.ok) {
        localStorage.setItem('grind_token', data.token);
        localStorage.setItem('grind_user',  data.username);
        window.location.href = '/dashboard';
    } else {
        errDiv.innerHTML = `<div class="alert-error">${data.error || 'Registration failed.'}</div>`;
    }
}
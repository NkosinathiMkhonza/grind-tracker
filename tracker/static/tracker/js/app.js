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
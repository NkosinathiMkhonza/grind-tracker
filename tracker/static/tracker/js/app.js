function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
}

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
        headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookie('csrftoken')
},
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

// Login page
function renderLogin(app) {
    if (getToken()) { window.location.href = '/dashboard'; return; }
    app.innerHTML = `
        <div style="max-width:480px;margin:60px auto">
            <div class="section-title">// login</div>
            <div class="card p-4">
                <div id="login-error"></div>
                <div class="mb-3">
                    <label class="form-label">$ username</label>
                    <input type="text" id="login-username" class="form-control" placeholder="your_username">
                </div>
                <div class="mb-3">
                    <label class="form-label">$ password</label>
                    <input type="password" id="login-password" class="form-control" placeholder="••••••••">
                </div>
                <button onclick="submitLogin()" class="btn btn-primary w-100">
                    run login.py →
                </button>
                <p style="color:var(--muted);font-size:0.78rem;margin-top:12px;text-align:center">
                    No account? <a href="/register" style="color:var(--green)">register</a>
                </p>
            </div>
        </div>
    `;
}

async function submitLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errDiv   = document.getElementById('login-error');

    if (!username || !password) {
        errDiv.innerHTML = '<div class="alert-error">Username and password required.</div>';
        return;
    }

    const res  = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookie('csrftoken')
},
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (res.ok) {
        localStorage.setItem('grind_token', data.token);
        localStorage.setItem('grind_user',  username);
        window.location.href = '/dashboard';
    } else {
        errDiv.innerHTML = '<div class="alert-error">Invalid username or password.</div>';
    }
}

// Dashboard
async function renderDashboard(app) {
    if (!getToken()) { window.location.href = '/login'; return; }

    app.innerHTML = `
        <div class="section-title">// dashboard — ${getUser()}</div>
        <div class="row g-3 mb-4" id="stats-row">
            <div class="col-md-4">
                <div class="stat-card">
                    <div class="stat-value" id="stat-hours">—</div>
                    <div class="stat-label">hours coded</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card green">
                    <div class="stat-value" id="stat-streak">—</div>
                    <div class="stat-label">day streak 🔥</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card yellow">
                    <div class="stat-value" id="stat-apps">—</div>
                    <div class="stat-label">applications sent</div>
                </div>
            </div>
        </div>
        <div class="row g-3 mb-4">
    <div class="col-12">
        <div class="section-title">// hours.chart</div>
        <div class="card p-3">
            <canvas id="grind-chart" height="80"></canvas>
        </div>
    </div>
</div>
        <div class="row g-3">
            <div class="col-md-7">
                <div class="section-title">// recent entries</div>
                <div id="entries-list">
                    <p style="color:var(--muted);font-size:0.82rem">Loading...</p>
                </div>
            </div>
            <div class="col-md-5">
                <div class="section-title">// log today</div>
                <div class="card p-3">
                    <div id="entry-error"></div>
                    <div class="mb-3">
                        <label class="form-label">$ date</label>
                        <input type="date" id="entry-date" class="form-control"
                            value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">$ hours_coded</label>
                        <input type="number" id="entry-hours" class="form-control"
                            placeholder="2.5" step="0.5" min="0" max="24">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">$ applications_sent</label>
                        <input type="number" id="entry-apps" class="form-control"
                            placeholder="5" min="0">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">$ notes</label>
                        <textarea id="entry-notes" class="form-control" rows="3"
                            placeholder="What did you work on today?"></textarea>
                    </div>
                    <button onclick="submitEntry()" class="btn btn-success w-100">
                        run log_entry.py →
                    </button>
                </div>
            </div>
        </div>
    `;

    loadStats();
    loadEntries();
    loadChart();
}

async function loadStats() {
    const res  = await fetch(`${API_BASE}/stats/`, {
        headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookie('csrftoken')
},
    });
    const data = await res.json();
    document.getElementById('stat-hours').textContent  = data.total_hours || 0;
    document.getElementById('stat-streak').textContent = data.streak || 0;
    document.getElementById('stat-apps').textContent   = data.total_applications || 0;
}

async function loadEntries() {
    const res     = await fetch(`${API_BASE}/entries/`, {
       headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookie('csrftoken')
},
    });
    const entries = await res.json();
    const list    = document.getElementById('entries-list');

    if (!entries.length) {
        list.innerHTML = '<p style="color:var(--muted);font-size:0.82rem">No entries yet. Log your first day!</p>';
        return;
    }

    list.innerHTML = entries.map(e => `
    <div class="entry-row">
        <div class="d-flex justify-content-between align-items-center">
            <span style="color:var(--blue);font-size:0.85rem">${e.date}</span>
            <div class="d-flex align-items-center gap-2">
                <span style="color:var(--muted);font-size:0.75rem">
                    ${e.hours_coded}h · ${e.applications_sent} apps
                </span>
                <button onclick="deleteEntry(${e.id})"
                    style="background:transparent;border:1px solid var(--red);
                    color:var(--red);font-family:'JetBrains Mono',monospace;
                    font-size:0.68rem;padding:2px 8px;border-radius:4px;cursor:pointer">
                    delete
                </button>
            </div>
        </div>
        ${e.notes ? `<p style="color:var(--muted);font-size:0.78rem;margin-top:6px;margin-bottom:0">${e.notes}</p>` : ''}
    </div>
`).join('');
}

async function submitEntry() {
    const errDiv = document.getElementById('entry-error');
    const body   = {
        date:              document.getElementById('entry-date').value,
        hours_coded:       document.getElementById('entry-hours').value,
        applications_sent: document.getElementById('entry-apps').value || 0,
        notes:             document.getElementById('entry-notes').value,
    };

    if (!body.date || !body.hours_coded) {
        errDiv.innerHTML = '<div class="alert-error">Date and hours are required.</div>';
        return;
    }

    const res = await fetch(`${API_BASE}/entries/`, {
        method:  'POST',
        headers: {
            'Content-Type':  'application/json',
            'Authorization': `Token ${getToken()}`
        },
        body: JSON.stringify(body)
    });

    if (res.ok) {
        errDiv.innerHTML = '<div class="alert-success">✓ Entry logged successfully.</div>';
        document.getElementById('entry-hours').value = '';
        document.getElementById('entry-apps').value  = '';
        document.getElementById('entry-notes').value = '';
        loadStats();
        loadEntries();
        setTimeout(() => errDiv.innerHTML = '', 3000);
    } else {
        const data = await res.json();
        errDiv.innerHTML = `<div class="alert-error">${JSON.stringify(data)}</div>`;
    }
}

// Add chart after loadEntries() call in renderDashboard
async function loadChart() {
    const res     = await fetch(`${API_BASE}/entries/`, {
        headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookie('csrftoken')
},
    });
    const entries = await res.json();
    if (!entries.length) return;

    const labels = entries.slice(0,7).reverse().map(e => e.date);
    const hours  = entries.slice(0,7).reverse().map(e => parseFloat(e.hours_coded));

    const existing = document.getElementById('grind-chart');
    if (!existing) return;

    new Chart(existing, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label:           'Hours Coded',
                data:            hours,
                borderColor:     '#3fb950',
                backgroundColor: 'rgba(63,185,80,0.1)',
                borderWidth:     2,
                tension:         0.4,
                fill:            true,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#8b949e', font: { family: 'JetBrains Mono' } } } },
            scales: {
                x: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } },
                y: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } }
            }
        }
    });
}
async function deleteEntry(id) {
    if (!confirm('Delete this entry?')) return;
    await fetch(`${API_BASE}/entries/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${getToken()}` }
    });
    loadStats();
    loadEntries();
    loadChart();
}

function showEditModal(entry) {
    const existing = document.getElementById('edit-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'edit-modal';
    modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.7);
        display:flex;align-items:center;justify-content:center;z-index:1000;`;
    modal.innerHTML = `
        <div style="background:var(--surface);border:1px solid var(--border);
            border-radius:8px;padding:24px;width:90%;max-width:480px;">
            <div class="section-title">// edit entry — ${entry.date}</div>
            <div id="edit-error"></div>
            <div class="mb-3">
                <label class="form-label">$ hours_coded</label>
                <input type="number" id="edit-hours" class="form-control"
                    value="${entry.hours_coded}" step="0.5" min="0" max="24">
            </div>
            <div class="mb-3">
                <label class="form-label">$ applications_sent</label>
                <input type="number" id="edit-apps" class="form-control"
                    value="${entry.applications_sent}" min="0">
            </div>
            <div class="mb-3">
                <label class="form-label">$ notes</label>
                <textarea id="edit-notes" class="form-control" rows="3">${entry.notes || ''}</textarea>
            </div>
            <div class="d-flex gap-2">
                <button onclick="submitEdit(${entry.id})" class="btn btn-success flex-fill">
                    save changes →
                </button>
                <button onclick="document.getElementById('edit-modal').remove()"
                    class="btn btn-primary">cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function submitEdit(id) {
    const body = {
        hours_coded:       document.getElementById('edit-hours').value,
        applications_sent: document.getElementById('edit-apps').value,
        notes:             document.getElementById('edit-notes').value,
    };
    const res = await fetch(`${API_BASE}/entries/${id}/`, {
        method:  'PATCH',
        headers: {
            'Content-Type':  'application/json',
            'Authorization': `Token ${getToken()}`
        },
        body: JSON.stringify(body)
    });
    if (res.ok) {
        document.getElementById('edit-modal').remove();
        loadStats(); loadEntries(); loadChart();
    }
}
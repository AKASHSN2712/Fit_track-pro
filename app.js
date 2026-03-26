// FitTrack Pro - Core Global Application Logic
// Included on every single HTML file

const AppState = {
    user: null, 
    workouts: [], 
    calorieLogs: [], 
    theme: 'dark'
};

const quotes = [
    "The only bad workout is the one that didn't happen.",
    "Don't stop when you're tired. Stop when you're done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones."
];

function initApp() {
    loadData();
    applyTheme();
    
    // Inject components if in the app shell
    if(document.getElementById('app-shell')) {
        renderSidebar();
        renderHeader();
        setupMobileMenu();
    }
}

function loadData() {
    const savedUser = localStorage.getItem('fitTrackUser');
    if (savedUser) AppState.user = JSON.parse(savedUser);
    
    const savedWorkouts = localStorage.getItem('fitTrackWorkouts');
    if (savedWorkouts) AppState.workouts = JSON.parse(savedWorkouts);
    
    const savedCalories = localStorage.getItem('fitTrackCalories');
    if (savedCalories) AppState.calorieLogs = JSON.parse(savedCalories);
    
    const savedTheme = localStorage.getItem('fitTrackTheme');
    if (savedTheme) AppState.theme = savedTheme;
}

function saveData() {
    localStorage.setItem('fitTrackUser', JSON.stringify(AppState.user));
    localStorage.setItem('fitTrackWorkouts', JSON.stringify(AppState.workouts));
    localStorage.setItem('fitTrackCalories', JSON.stringify(AppState.calorieLogs));
    localStorage.setItem('fitTrackTheme', AppState.theme);
}

// Authentication Guards
function requireAuth() {
    if (!AppState.user) {
        window.location.href = 'login.html';
    }
}

function requireNoAuth() {
    if (AppState.user) {
        window.location.href = 'dashboard.html';
    }
}

function handleLogout() {
    AppState.user = null;
    saveData();
    window.location.href = '../index.html';
}

// Theme
function applyTheme() {
    document.body.setAttribute('data-theme', AppState.theme);
    const themeIcon = document.getElementById('theme-icon');
    if(themeIcon) {
        themeIcon.className = AppState.theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
}

function toggleTheme() {
    AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
    saveData();
    applyTheme();
    // Re-render charts if they exist on the page
    if(typeof window.renderCharts === 'function') {
        window.renderCharts();
    }
}

// Sidebar Component
function renderSidebar() {
    const sidebarHTML = `
        <aside class="sidebar" id="sidebar">
            <a href="dashboard.html" class="sidebar-header">
                <i class="fa-solid fa-dumbbell logo-icon"></i>
                <h2>FitTrack <span class="accent-text">Pro</span></h2>
            </a>
            <nav class="sidebar-nav">
                <a href="dashboard.html" class="nav-item ${location.pathname.includes('dashboard') ? 'active' : ''}">
                    <i class="fa-solid fa-house"></i> Dashboard
                </a>
                <a href="workout.html" class="nav-item ${location.pathname.includes('workout') ? 'active' : ''}">
                    <i class="fa-solid fa-person-running"></i> Workouts
                </a>
                <a href="calories.html" class="nav-item ${location.pathname.includes('calories') ? 'active' : ''}">
                    <i class="fa-solid fa-fire"></i> Calories
                </a>
                <a href="bmi.html" class="nav-item ${location.pathname.includes('bmi') ? 'active' : ''}">
                    <i class="fa-solid fa-weight-scale"></i> BMI Calc
                </a>
                <a href="progress.html" class="nav-item ${location.pathname.includes('progress') ? 'active' : ''}">
                    <i class="fa-solid fa-chart-line"></i> Progress
                </a>
            </nav>
            <div class="sidebar-footer">
                <a href="settings.html" class="nav-item ${location.pathname.includes('settings') ? 'active' : ''}">
                    <i class="fa-solid fa-gear"></i> Settings
                </a>
                <a href="#" class="nav-item text-danger" onclick="handleLogout()">
                    <i class="fa-solid fa-right-from-bracket"></i> Logout
                </a>
            </div>
        </aside>
    `;
    const sidebarOverlayHtml = `<div id="sidebar-overlay" class="overlay"></div>`;
    document.getElementById('app-shell').insertAdjacentHTML('afterbegin', sidebarOverlayHtml + sidebarHTML);
}

function renderHeader() {
    const nameParts = AppState.user ? AppState.user.name.split(' ') : ['User'];
    const initials = nameParts.length > 0 ? nameParts.map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'US';
    
    const headerHTML = `
        <header class="top-header">
            <div class="header-left" style="display:flex; align-items:center; gap: 1rem;">
                <button id="mobile-menu-btn" class="mobile-only btn icon-btn">
                    <i class="fa-solid fa-bars"></i>
                </button>
                <h3 class="fw-normal" id="top-title">Good to see you, ${nameParts[0]}!</h3>
            </div>
            <div class="header-right" style="display:flex; align-items:center; gap: 1.5rem;">
                <button class="btn icon-btn" title="Toggle Theme" onclick="toggleTheme()">
                    <i class="fa-solid fa-sun" id="theme-icon"></i>
                </button>
                <div class="user-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-color), #0ea5e9); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                    ${initials}
                </div>
            </div>
        </header>
    `;
    
    const mainContent = document.getElementById('main-container');
    mainContent.insertAdjacentHTML('afterbegin', headerHTML);
    applyTheme(); // setup correct icon initially
}

function setupMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if(btn) {
        btn.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        });
    }
    if(overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
}

// Math Utility
function calculateBMIValue(h, w) {
    if (!h || !w) return null;
    const hM = h / 100;
    return (w / (hM * hM)).toFixed(1);
}

function getBMICategoryInfo(bmi) {
    if (!bmi) return { text: 'Unknown', class: 'bg-secondary' };
    if (bmi < 18.5) return { text: 'Underweight', class: 'bg-warning' };
    if (bmi >= 18.5 && bmi <= 24.9) return { text: 'Normal', class: 'bg-success' };
    if (bmi >= 25 && bmi <= 29.9) return { text: 'Overweight', class: 'bg-warning' };
    return { text: 'Obese', class: 'bg-danger' };
}

// Init on load
document.addEventListener('DOMContentLoaded', initApp);

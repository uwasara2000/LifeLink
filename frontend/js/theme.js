// LifeLink Global Universal Theme Management
(function() {
    // 1. Immediate Theme Application to prevent UI flash
    const savedTheme = localStorage.getItem('lifelink_theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
})();

function applySiteTheme(theme) {
    const toggleBtn = document.getElementById('themeToggleBtn');
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (toggleBtn) toggleBtn.innerHTML = '<i class="fa-regular fa-sun"></i>';
        localStorage.setItem('lifelink_theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        if (toggleBtn) toggleBtn.innerHTML = '<i class="fa-regular fa-moon"></i>';
        localStorage.setItem('lifelink_theme', 'light');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const activeTheme = localStorage.getItem('lifelink_theme') || 'light';
    applySiteTheme(activeTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            applySiteTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }
});

// Sync across multiple open browser tabs/windows
window.addEventListener('storage', (event) => {
    if (event.key === 'lifelink_theme') {
        applySiteTheme(event.newValue);
    }
});

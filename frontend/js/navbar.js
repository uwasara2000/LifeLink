/**
 * LifeLink - Shared Navbar Component
 * Injects the unified navbar into every page, sets active links automatically,
 * and displays the user profile avatar icon with the 1st letter of the user's name
 * when registered/signed in.
 */
(function () {
    const NAV_LINKS = [
        { href: 'index.html',           label: 'Home' },
        { href: 'Donor.html',           label: 'Find Donor' },
        { href: 'find-donors-map.html', label: 'Donor Map', badge: 'LIVE' },
        { href: 'request-blood.html',   label: 'Request Blood' },
        { href: 'requests.html',        label: 'All Requests' },
        { href: 'hospitals.html',       label: 'Hospitals' },
        { href: 'about.html',           label: 'About Us' },
        { href: 'contact.html',         label: 'Contact' },
    ];

    // Determine which page we're on (case-insensitive)
    const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

    function getStoredUser() {
        try {
            if (window.LifeLinkUser) return window.LifeLinkUser;
            const raw = localStorage.getItem('lifelink_session');
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    }

    function getFirstLetter(user) {
        if (!user) return 'U';
        const name = (user.name || user.fullName || user.displayName || user.email || 'User').trim();
        return name ? name.charAt(0).toUpperCase() : 'U';
    }

    function buildNavLinks() {
        return NAV_LINKS.map(link => {
            const isActive = link.href.toLowerCase() === currentPage;
            const badge = link.badge
                ? '<span style="font-size:10px;background:#cc1111;color:white;padding:2px 7px;border-radius:10px;margin-left:4px;font-weight:700;">' + link.badge + '</span>'
                : '';
            return '<li><a href="' + link.href + '"' + (isActive ? ' class="active"' : '') + '>' + link.label + badge + '</a></li>';
        }).join('\n                ');
    }

    function buildNavActionsHTML(user) {
        const themeBtnHTML = '<button class="theme-toggle" id="themeToggleBtn" title="Toggle Theme" aria-label="Toggle Theme"><i class="fa-regular fa-moon"></i></button>';

        if (!user) {
            return themeBtnHTML +
                '<a href="login.html" class="btn btn-outline">Login</a>' +
                '<a href="signup.html" class="btn btn-primary">Register</a>';
        }

        const letter = getFirstLetter(user);
        const fullName = user.name || user.fullName || user.displayName || 'LifeLink Member';
        const firstName = fullName.split(' ')[0];
        const email = user.email || '';
        const blood = user.bloodGroup ? '<span class="badge-blood">' + user.bloodGroup + '</span>' : '';
        const role = (user.role || 'donor').toUpperCase();

        return themeBtnHTML + `
            <div class="nav-user-profile" id="navUserProfile" title="Logged in as ${fullName}">
                <div class="user-avatar-badge" id="navUserAvatar">${letter}</div>
                <span class="user-display-name">${firstName}</span>
                <i class="fa-solid fa-chevron-down nav-dropdown-arrow"></i>
                
                <div class="user-dropdown-menu" id="userDropdownMenu">
                    <div class="dropdown-header">
                        <div class="dropdown-avatar">${letter}</div>
                        <div class="dropdown-user-info">
                            <div class="dropdown-user-name">${fullName}</div>
                            ${email ? `<div class="dropdown-user-email">${email}</div>` : ''}
                            <div class="dropdown-badges">
                                <span class="badge-role">${role}</span>
                                ${blood}
                            </div>
                        </div>
                    </div>
                    <ul class="dropdown-list">
                        <li><a href="Donor.html"><i class="fa-solid fa-id-card"></i> My Donor Card</a></li>
                        <li><a href="Donor.html"><i class="fa-solid fa-users"></i> Find Donors</a></li>
                        <li><a href="find-donors-map.html"><i class="fa-solid fa-map-location-dot"></i> Live Donor Map</a></li>
                        <li><a href="request-blood.html"><i class="fa-solid fa-droplet"></i> Request Blood</a></li>
                        <li><a href="requests.html"><i class="fa-solid fa-list-check"></i> All Blood Requests</a></li>
                    </ul>
                    <div class="dropdown-footer">
                        <button type="button" class="btn-signout" onclick="window.lifeLinkSignOut()">
                            <i class="fa-solid fa-right-from-bracket"></i> Sign Out
                        </button>
                    </div>
                </div>
            </div>`;
    }

    function getNavbarHTML() {
        const user = getStoredUser();
        return '\
        <nav class="navbar" id="lifelink-navbar">\
            <a href="index.html" class="logo-container">\
                <img src="images/blood.png" alt="LifeLink Logo" class="nav-logo" onerror="this.style.display=\'none\'">\
                <div class="logo">\
                    LifeLink\
                    <span>Save a life, Be a hero</span>\
                </div>\
            </a>\
            <button class="navbar-hamburger" id="navHamburger" aria-label="Open navigation menu" aria-expanded="false">\
                <span></span><span></span><span></span>\
            </button>\
            <ul class="nav-links" id="navLinksList">\
                ' + buildNavLinks() + '\
            </ul>\
            <div class="nav-actions" id="navActions">\
                ' + buildNavActionsHTML(user) + '\
            </div>\
        </nav>';
    }

    const navbarCSS = `
#lifelink-navbar {
    position: sticky;
    top: 10px;
    z-index: 999;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--card-bg, #ffffff);
    padding: 12px 28px;
    border-radius: 14px;
    box-shadow: var(--shadow, 0 4px 15px rgba(0,0,0,0.07));
    margin-bottom: 24px;
    gap: 20px;
    transition: background-color 0.3s ease, border-color 0.3s ease;
}
#lifelink-navbar .logo-container {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: var(--primary-color, #cc1111);
    font-weight: 700;
    font-size: 24px;
    flex-shrink: 0;
}
#lifelink-navbar .logo {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    color: var(--primary-color, #cc1111);
    font-weight: 700;
    font-size: 22px;
    line-height: 1.1;
}
#lifelink-navbar .logo span {
    font-size: 11px;
    color: var(--text-muted, #666);
    display: block;
    font-weight: 400;
    margin-top: 2px;
}
#lifelink-navbar .nav-logo {
    height: 40px;
    width: auto;
    object-fit: contain;
}
#lifelink-navbar .nav-links {
    display: flex;
    gap: 20px;
    list-style: none;
    margin: 0;
    padding: 0;
    flex-wrap: wrap;
}
#lifelink-navbar .nav-links a {
    text-decoration: none;
    color: var(--text-main, #333);
    font-weight: 500;
    font-size: 14px;
    transition: color 0.3s ease;
    white-space: nowrap;
}
#lifelink-navbar .nav-links a:hover,
#lifelink-navbar .nav-links a.active {
    color: var(--primary-color, #cc1111);
}
#lifelink-navbar .nav-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
}
#lifelink-navbar .theme-toggle {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: var(--text-main, #333);
    padding: 6px;
    display: flex;
    align-items: center;
    border-radius: 50%;
    transition: background 0.2s ease, transform 0.2s ease;
}
#lifelink-navbar .theme-toggle:hover {
    background: rgba(0, 0, 0, 0.05);
    transform: scale(1.05);
}
[data-theme="dark"] #lifelink-navbar .theme-toggle:hover {
    background: rgba(255, 255, 255, 0.1);
}
#lifelink-navbar .btn {
    padding: 8px 18px;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
    text-decoration: none;
    font-size: 13.5px;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
#lifelink-navbar .btn-outline {
    background: transparent;
    border: 1px solid var(--border-color, #e0e0e0);
    color: var(--text-main, #333);
}
#lifelink-navbar .btn-outline:hover {
    background: rgba(0, 0, 0, 0.04);
    border-color: var(--primary-color, #cc1111);
    color: var(--primary-color, #cc1111);
}
#lifelink-navbar .btn-primary {
    background: var(--primary-color, #cc1111);
    color: white;
    box-shadow: 0 2px 8px rgba(204, 17, 17, 0.25);
}
#lifelink-navbar .btn-primary:hover {
    background: var(--primary-hover, #aa0e0e);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(204, 17, 17, 0.35);
}

/* ── User Avatar Badge with 1st Letter ───────────────────────── */
#lifelink-navbar .nav-user-profile {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    cursor: pointer;
    position: relative;
    padding: 4px 12px 4px 5px;
    border-radius: 28px;
    background: rgba(211, 47, 47, 0.06);
    border: 1.5px solid rgba(211, 47, 47, 0.22);
    transition: all 0.25s ease;
    user-select: none;
}
#lifelink-navbar .nav-user-profile:hover,
#lifelink-navbar .nav-user-profile.open {
    background: rgba(211, 47, 47, 0.12);
    border-color: rgba(211, 47, 47, 0.45);
    box-shadow: 0 2px 10px rgba(211, 47, 47, 0.15);
}
#lifelink-navbar .user-avatar-badge {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #d32f2f, #990000);
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    box-shadow: 0 2px 8px rgba(211, 47, 47, 0.4);
    border: 2px solid #ffffff;
    flex-shrink: 0;
    transition: transform 0.2s ease;
}
[data-theme="dark"] #lifelink-navbar .user-avatar-badge {
    background: linear-gradient(135deg, #ff5252, #d32f2f);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 2px 8px rgba(255, 82, 82, 0.4);
}
#lifelink-navbar .nav-user-profile:hover .user-avatar-badge {
    transform: scale(1.06);
}
#lifelink-navbar .user-display-name {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--text-main, #333333);
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#lifelink-navbar .nav-dropdown-arrow {
    font-size: 10px;
    color: var(--text-muted, #777777);
    transition: transform 0.25s ease;
}
#lifelink-navbar .nav-user-profile.open .nav-dropdown-arrow {
    transform: rotate(180deg);
    color: var(--primary-color, #cc1111);
}

/* ── User Dropdown Menu ──────────────────────────────────────── */
#lifelink-navbar .user-dropdown-menu {
    display: none;
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 14px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
    min-width: 250px;
    z-index: 10000;
    overflow: hidden;
    animation: navDropdownFade 0.2s ease forwards;
}
#lifelink-navbar .user-dropdown-menu.show {
    display: block;
}
@keyframes navDropdownFade {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
}
#lifelink-navbar .dropdown-header {
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--border-color, #eee);
    background: rgba(211, 47, 47, 0.04);
}
#lifelink-navbar .dropdown-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #d32f2f, #990000);
    color: white;
    font-size: 19px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(211, 47, 47, 0.3);
}
#lifelink-navbar .dropdown-user-info {
    overflow: hidden;
}
#lifelink-navbar .dropdown-user-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-main, #222);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
#lifelink-navbar .dropdown-user-email {
    font-size: 11px;
    color: var(--text-muted, #777);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
}
#lifelink-navbar .dropdown-badges {
    display: flex;
    gap: 6px;
    margin-top: 6px;
    align-items: center;
}
#lifelink-navbar .badge-role {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 8px;
    background: rgba(211, 47, 47, 0.12);
    color: var(--primary-color, #d32f2f);
}
#lifelink-navbar .badge-blood {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 8px;
    background: var(--primary-color, #d32f2f);
    color: #ffffff;
}
#lifelink-navbar .dropdown-list {
    list-style: none;
    padding: 8px;
    margin: 0;
}
#lifelink-navbar .dropdown-list li a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-main, #333);
    text-decoration: none;
    border-radius: 8px;
    transition: background 0.2s ease, color 0.2s ease;
}
#lifelink-navbar .dropdown-list li a i {
    width: 16px;
    color: var(--primary-color, #d32f2f);
    text-align: center;
}
#lifelink-navbar .dropdown-list li a:hover {
    background: rgba(211, 47, 47, 0.08);
    color: var(--primary-color, #d32f2f);
}
#lifelink-navbar .dropdown-footer {
    padding: 8px;
    border-top: 1px solid var(--border-color, #eee);
}
#lifelink-navbar .btn-signout {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--primary-color, #d32f2f);
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 8px;
    font-family: inherit;
    transition: background 0.2s ease;
}
#lifelink-navbar .btn-signout:hover {
    background: rgba(211, 47, 47, 0.1);
}

/* ── Mobile Responsive Hamburger ─────────────────────────────── */
#lifelink-navbar .navbar-hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    margin-left: auto;
}
#lifelink-navbar .navbar-hamburger span {
    display: block;
    width: 24px;
    height: 2px;
    background: var(--text-main, #333);
    border-radius: 2px;
    transition: all 0.3s ease;
}
@media (max-width: 900px) {
    #lifelink-navbar {
        flex-wrap: wrap;
        padding: 12px 18px;
    }
    #lifelink-navbar .navbar-hamburger {
        display: flex;
    }
    #lifelink-navbar .nav-links {
        display: none;
        flex-direction: column;
        width: 100%;
        gap: 10px;
        padding: 12px 0 6px;
        border-top: 1px solid var(--border-color, #eee);
    }
    #lifelink-navbar .nav-links.nav-open {
        display: flex;
    }
    #lifelink-navbar .nav-actions {
        display: none;
        width: 100%;
        padding: 10px 0 6px;
        border-top: 1px solid var(--border-color, #eee);
        justify-content: flex-start;
    }
    #lifelink-navbar .nav-actions.nav-open {
        display: flex;
    }
}
`;

    // Inject CSS into <head>
    const styleEl = document.createElement('style');
    styleEl.id = 'lifelink-navbar-styles';
    styleEl.textContent = navbarCSS;
    document.head.appendChild(styleEl);

    function bindNavActionsEvents() {
        // Theme toggle
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            updateThemeIcon(themeBtn);
            themeBtn.onclick = function () {
                const html = document.documentElement;
                const isDark = html.getAttribute('data-theme') === 'dark';
                const next = isDark ? 'light' : 'dark';
                html.setAttribute('data-theme', next);
                try { localStorage.setItem('theme', next); } catch (_) {}
                updateThemeIcon(themeBtn);
            };
        }

        // User dropdown menu
        const profileWidget = document.getElementById('navUserProfile');
        const dropdownMenu  = document.getElementById('userDropdownMenu');
        if (profileWidget && dropdownMenu) {
            profileWidget.onclick = function (e) {
                e.stopPropagation();
                const isShowing = dropdownMenu.classList.toggle('show');
                profileWidget.classList.toggle('open', isShowing);
            };
            document.addEventListener('click', function () {
                dropdownMenu.classList.remove('show');
                profileWidget.classList.remove('open');
            });
        }
    }

    function injectNavbar() {
        // Remove any pre-existing hardcoded navbars
        const existing = document.querySelectorAll('nav.navbar:not(#lifelink-navbar)');
        existing.forEach(function (n) { n.remove(); });

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = getNavbarHTML().trim();
        const navEl = tempDiv.firstElementChild;

        const wrapper = document.querySelector('.app-container') ||
                        document.querySelector('.app') ||
                        document.body;

        if (wrapper === document.body) {
            document.body.insertBefore(navEl, document.body.firstChild);
        } else {
            wrapper.insertBefore(navEl, wrapper.firstChild);
        }

        bindNavActionsEvents();

        // Hamburger menu
        const hamburger = document.getElementById('navHamburger');
        const navList   = document.getElementById('navLinksList');
        const navActs   = document.getElementById('navActions');
        if (hamburger && navList) {
            hamburger.onclick = function () {
                const isOpen = navList.classList.toggle('nav-open');
                if (navActs) navActs.classList.toggle('nav-open', isOpen);
                hamburger.setAttribute('aria-expanded', String(isOpen));
            };
        }
    }

    function updateThemeIcon(btn) {
        const icon = btn.querySelector('i');
        if (!icon) return;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        icon.className = isDark ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
    }

    // ── Global Navbar Updater ───────────────────────────────────────────
    window.updateLifeLinkNavbar = function (user) {
        const actionsEl = document.getElementById('navActions');
        if (!actionsEl) return;
        actionsEl.innerHTML = buildNavActionsHTML(user);
        bindNavActionsEvents();
    };

    // ── Global Sign-Out Helper ──────────────────────────────────────────
    window.lifeLinkSignOut = async function () {
        try { localStorage.removeItem('lifelink_session'); } catch (_) {}
        window.LifeLinkUser = null;
        if (window.LifeLinkAuth && typeof window.LifeLinkAuth.logoutUser === 'function') {
            await window.LifeLinkAuth.logoutUser().catch(() => {});
        } else if (window.LifeLinkFirebase && window.LifeLinkFirebase.auth) {
            try { await window.LifeLinkFirebase.auth.signOut(); } catch (_) {}
        }
        window.updateLifeLinkNavbar(null);
        window.location.href = 'index.html';
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectNavbar);
    } else {
        injectNavbar();
    }
})();

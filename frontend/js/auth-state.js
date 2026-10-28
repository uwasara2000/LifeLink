/**
 * LifeLink - Shared Authentication State Manager (auth-state.js)
 *
 * Responsibilities:
 *  1. Watches Firebase onAuthStateChanged and stores the current user globally.
 *  2. Updates the shared navbar to show user avatar badge with 1st letter of name.
 *  3. Exposes window.LifeLinkUser (current user profile) for all pages.
 *  4. Dispatches custom DOM events so any page can react to sign-in / sign-out.
 *  5. Gracefully preserves locally registered sessions even during offline/fallback modes.
 */

import { auth, db, onAuthStateChanged, doc, getDoc }
    from './firebase-config.js';
import { syncAllDataToFirebase }
    from './firebase-rtdb-sync.js';

// ─── Globals ────────────────────────────────────────────────────────────────
window.LifeLinkUser = null;          // null = guest, object = signed-in user
const AUTH_READY_EVENT   = 'lifelink:auth-ready';
const SIGN_IN_EVENT      = 'lifelink:signed-in';
const SIGN_OUT_EVENT     = 'lifelink:signed-out';

// ─── Helpers ────────────────────────────────────────────────────────────────
function dispatch(name, detail) {
    try {
        window.dispatchEvent(new CustomEvent(name, { detail }));
    } catch (_) {}
}

function updateNavbarForUser(user) {
    if (typeof window.updateLifeLinkNavbar === 'function') {
        window.updateLifeLinkNavbar(user);
    }
}

// ─── Core auth state watcher ────────────────────────────────────────────────
onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
        // Build profile — try Firestore first, fallback to localStorage session
        let profile = {
            uid:         firebaseUser.uid,
            email:       firebaseUser.email,
            name:        firebaseUser.displayName || firebaseUser.email.split('@')[0],
            photoURL:    firebaseUser.photoURL || null,
            role:        'donor'
        };

        // Merge localStorage session (fast)
        try {
            const session = JSON.parse(localStorage.getItem('lifelink_session') || 'null');
            if (session) {
                profile = { ...profile, ...session };
            }
        } catch (_) {}

        // Merge Firestore profile (authoritative)
        try {
            const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (snap.exists()) {
                profile = { ...profile, ...snap.data() };
                try { localStorage.setItem('lifelink_session', JSON.stringify(profile)); } catch (_) {}
            }
        } catch (_) {}

        window.LifeLinkUser = profile;
        updateNavbarForUser(profile);
        dispatch(AUTH_READY_EVENT, { user: profile, signedIn: true });
        dispatch(SIGN_IN_EVENT,    { user: profile });

        // Connect all data to Firebase Realtime Database & Firestore after sign-in
        syncAllDataToFirebase(profile).catch(err => {
            console.warn("LifeLink RTDB sync notice:", err);
        });

    } else {
        // Check if there is an active local session (e.g. from registration or offline fallback)
        let localUser = null;
        try {
            localUser = JSON.parse(localStorage.getItem('lifelink_session') || 'null');
        } catch (_) {}

        if (localUser && (localUser.name || localUser.email)) {
            // Keep the user registered & logged in!
            window.LifeLinkUser = localUser;
            updateNavbarForUser(localUser);
            dispatch(AUTH_READY_EVENT, { user: localUser, signedIn: true });
            dispatch(SIGN_IN_EVENT,    { user: localUser });
        } else {
            // Truly guest
            window.LifeLinkUser = null;
            updateNavbarForUser(null);
            dispatch(AUTH_READY_EVENT, { user: null, signedIn: false });
            dispatch(SIGN_OUT_EVENT,   {});
        }
    }
});

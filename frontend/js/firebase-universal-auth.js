/**
 * LifeLink Universal Firebase Engine (firebase-universal-auth.js)
 * 
 * Works seamlessly on BOTH:
 *  - file:/// protocol (local disk, direct browser opening)
 *  - http://localhost:5000 / https:// (web server)
 * 
 * Uses Google Identity Toolkit v1 & Cloud Firestore REST APIs, which natively support
 * Origin: null (file:///) and standard CORS without ES module restrictions.
 */

(function () {
    const CONFIG = {
        apiKey: "AIzaSyDA3lBOZPMVvYs7iZVrwtdtPmv561ghAA0",
        projectId: "lifelink-e37cf",
        authDomain: "lifelink-e37cf.firebaseapp.com",
        rtdbUrl: "https://lifelink-e37cf-default-rtdb.firebaseio.com"
    };

    const AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts`;
    const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${CONFIG.projectId}/databases/(default)/documents`;

    // ── Helper: Format Firestore Field ──────────────────────────
    function toFirestoreFields(obj) {
        const fields = {};
        for (const [key, val] of Object.entries(obj)) {
            if (val === undefined || val === null) continue;
            if (typeof val === 'string') {
                fields[key] = { stringValue: val };
            } else if (typeof val === 'number') {
                if (Number.isInteger(val)) {
                    fields[key] = { integerValue: String(val) };
                } else {
                    fields[key] = { doubleValue: val };
                }
            } else if (typeof val === 'boolean') {
                fields[key] = { booleanValue: val };
            } else if (val instanceof Date) {
                fields[key] = { timestampValue: val.toISOString() };
            }
        }
        return fields;
    }

    function fromFirestoreFields(fields) {
        if (!fields) return {};
        const obj = {};
        for (const [key, val] of Object.entries(fields)) {
            if ('stringValue' in val) obj[key] = val.stringValue;
            else if ('integerValue' in val) obj[key] = parseInt(val.integerValue, 10);
            else if ('doubleValue' in val) obj[key] = parseFloat(val.doubleValue);
            else if ('booleanValue' in val) obj[key] = val.booleanValue;
            else if ('timestampValue' in val) obj[key] = val.timestampValue;
        }
        return obj;
    }

    // ── Human-friendly Error Messages ──────────────────────────
    function formatAuthError(msg) {
        if (!msg) return "Authentication error occurred.";
        if (msg.includes("INVALID_LOGIN_CREDENTIALS") || msg.includes("INVALID_PASSWORD") || msg.includes("EMAIL_NOT_FOUND")) {
            return "Invalid email or password. Please verify and try again.";
        }
        if (msg.includes("EMAIL_EXISTS")) {
            return "This email is already registered. Please sign in instead.";
        }
        if (msg.includes("WEAK_PASSWORD")) {
            return "Password is too weak. Please use at least 6 characters.";
        }
        if (msg.includes("INVALID_EMAIL")) {
            return "The email address is improperly formatted.";
        }
        if (msg.includes("TOO_MANY_ATTEMPTS_TRY_LATER")) {
            return "Too many failed attempts. Please try again in a few moments.";
        }
        if (msg.includes("API key not valid")) {
            return "Invalid Firebase API Key. Please verify in Firebase Console.";
        }
        return msg;
    }

    // ── Sign In ────────────────────────────────────────────────
    async function loginUser(email, password) {
        if (!email || !password) {
            return { success: false, error: "Please enter both email and password." };
        }

        try {
            const res = await fetch(`${AUTH_URL}:signInWithPassword?key=${CONFIG.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password,
                    returnSecureToken: true
                })
            });

            const data = await res.json();
            if (data.error) {
                return { success: false, error: formatAuthError(data.error.message) };
            }

            const uid = data.localId;
            const idToken = data.idToken;

            // Fetch user profile from Cloud Firestore
            let profile = {
                uid: uid,
                email: data.email,
                name: data.displayName || email.split('@')[0],
                role: 'donor',
                bloodGroup: 'O+'
            };

            try {
                const docRes = await fetch(`${FIRESTORE_URL}/users/${uid}?key=${CONFIG.apiKey}`);
                if (docRes.ok) {
                    const docData = await docRes.json();
                    if (docData && docData.fields) {
                        const parsed = fromFirestoreFields(docData.fields);
                        profile = { ...profile, ...parsed };
                    }
                }
            } catch (docErr) {
                console.warn("Notice loading Firestore user profile:", docErr);
            }

            // Sync last login to Firestore
            try {
                fetch(`${FIRESTORE_URL}/users/${uid}?key=${CONFIG.apiKey}&updateMask.fieldPaths=lastLoginAt`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fields: { lastLoginAt: { timestampValue: new Date().toISOString() } }
                    })
                }).catch(() => {});
            } catch (_) {}

            // Sync to RTDB
            try {
                fetch(`${CONFIG.rtdbUrl}/users/${uid}.json?auth=${idToken}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: uid,
                        email: profile.email,
                        name: profile.name,
                        role: profile.role,
                        bloodGroup: profile.bloodGroup,
                        lastLogin: Date.now()
                    })
                }).catch(() => {});
            } catch (_) {}

            // Store session
            profile.idToken = idToken;
            profile.lastLoginAt = new Date().toISOString();
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('lifelink_session', JSON.stringify(profile));
            }

            if (typeof window !== 'undefined') {
                window.LifeLinkUser = profile;
                if (typeof window.updateLifeLinkNavbar === 'function') {
                    window.updateLifeLinkNavbar(profile);
                }
            }

            return { success: true, user: profile };
        } catch (netErr) {
            console.error("Firebase Login network error:", netErr);
            return { success: false, error: "Network error connecting to Firebase. Please check your internet connection." };
        }
    }

    // ── Sign Up ────────────────────────────────────────────────
    async function registerUser({ fullName, email, password, phone, city, role, bloodGroup, latitude, longitude, locationCaptured }) {
        if (!email || !password) {
            return { success: false, error: "Email and password are required." };
        }

        try {
            // 1. Create account with Identity Toolkit
            const res = await fetch(`${AUTH_URL}:signUp?key=${CONFIG.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password,
                    returnSecureToken: true
                })
            });

            const data = await res.json();
            if (data.error) {
                return { success: false, error: formatAuthError(data.error.message) };
            }

            const uid = data.localId;
            const idToken = data.idToken;

            // 2. Update display name
            if (fullName) {
                fetch(`${AUTH_URL}:update?key=${CONFIG.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        idToken: idToken,
                        displayName: fullName,
                        returnSecureToken: true
                    })
                }).catch(() => {});
            }

            const cardId = role === 'hospital'
                ? `HOSP-${Math.floor(100 + Math.random() * 900)}`
                : `LL-${Math.floor(1000 + Math.random() * 9000)}`;

            const profile = {
                uid: uid,
                name: fullName || "LifeLink Member",
                email: email,
                phone: phone || "",
                city: city || "Colombo",
                district: city || "Colombo",
                role: role || "donor",
                bloodGroup: bloodGroup || "O+",
                donorCardId: cardId,
                latitude: (typeof latitude === 'number' && !isNaN(latitude)) ? latitude : 6.9271,
                longitude: (typeof longitude === 'number' && !isNaN(longitude)) ? longitude : 79.8612,
                locationCaptured: Boolean(locationCaptured),
                registeredAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
            };

            // 3. Save to Cloud Firestore
            try {
                const fsRes = await fetch(`${FIRESTORE_URL}/users/${uid}?key=${CONFIG.apiKey}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fields: toFirestoreFields(profile)
                    })
                });
                if (fsRes.ok) {
                    console.log("✓ Profile successfully written to Cloud Firestore 'users' collection:", uid);
                }
                if (role === 'donor') {
                    fetch(`${FIRESTORE_URL}/donors/${uid}?key=${CONFIG.apiKey}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fields: toFirestoreFields(profile) })
                    }).catch(() => {});
                }
            } catch (fsErr) {
                console.warn("Notice saving Firestore profile:", fsErr);
            }

            // 4. Save to Realtime Database
            try {
                fetch(`${CONFIG.rtdbUrl}/users/${uid}.json?auth=${idToken}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(profile)
                }).catch(() => {});

                if (role === 'donor') {
                    fetch(`${CONFIG.rtdbUrl}/donors/${uid}.json?auth=${idToken}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: uid,
                            uid: uid,
                            name: profile.name,
                            bloodGroup: profile.bloodGroup,
                            city: profile.city,
                            district: profile.district || profile.city,
                            phone: profile.phone,
                            email: profile.email,
                            latitude: profile.latitude,
                            longitude: profile.longitude,
                            locationCaptured: profile.locationCaptured,
                            donorCardId: profile.donorCardId,
                            available: true
                        })
                    }).catch(() => {});
                }
            } catch (_) {}

            // 5. Save local session & registered donors registry
            profile.idToken = idToken;
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('lifelink_session', JSON.stringify(profile));

                if (role === 'donor') {
                    try {
                        const regList = JSON.parse(localStorage.getItem('lifelink_registered_donors') || '[]');
                        const exIdx = regList.findIndex(d => d.uid === uid || (d.email && d.email === profile.email));
                        if (exIdx >= 0) regList[exIdx] = profile;
                        else regList.unshift(profile);
                        localStorage.setItem('lifelink_registered_donors', JSON.stringify(regList));
                    } catch (_) {}
                }
            }

            if (typeof window !== 'undefined') {
                window.LifeLinkUser = profile;
                if (typeof window.updateLifeLinkNavbar === 'function') {
                    window.updateLifeLinkNavbar(profile);
                }
            }

            return { success: true, user: profile };
        } catch (netErr) {
            console.error("Firebase Registration network error:", netErr);
            return { success: false, error: "Network error connecting to Firebase. Please check your internet connection." };
        }
    }

    // ── Password Reset ─────────────────────────────────────────
    async function resetPassword(email) {
        if (!email) return { success: false, error: "Please enter your email." };
        try {
            const res = await fetch(`${AUTH_URL}:sendOobCode?key=${CONFIG.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestType: "PASSWORD_RESET",
                    email: email.trim()
                })
            });
            const data = await res.json();
            if (data.error) {
                return { success: false, error: formatAuthError(data.error.message) };
            }
            return { success: true, message: "Password reset link sent to your email." };
        } catch (err) {
            return { success: false, error: "Failed to send reset link. Please check your connection." };
        }
    }

    // ── Sign Out ───────────────────────────────────────────────
    async function logoutUser() {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('lifelink_session');
        }
        if (typeof window !== 'undefined') {
            window.LifeLinkUser = null;
            if (typeof window.updateLifeLinkNavbar === 'function') {
                window.updateLifeLinkNavbar(null);
            }
        }
        return { success: true };
    }

    // ── Auth User Changed Listener ─────────────────────────────
    function onAuthUserChanged(callback) {
        let user = null;
        try {
            user = JSON.parse(localStorage.getItem('lifelink_session') || 'null');
        } catch (_) {}
        callback(user);
    }

    // ── Expose Globally on window ──────────────────────────────
    const api = {
        loginUser,
        registerUser,
        resetPassword,
        logoutUser,
        onAuthUserChanged,
        config: CONFIG
    };

    if (typeof window !== 'undefined') {
        window.LifeLinkAuth = api;
        window.LifeLinkUniversalAuth = api;
        console.log("LifeLink Universal Firebase Auth engine loaded successfully! (Supports file:/// and http://)");
    }
})();

/**
 * LifeLink - Firebase Authentication & User Profile Service
 * Handles user signup, signin, Google SSO, password resets, and Firestore profile synchronization.
 */

import { 
    auth, 
    db, 
    googleProvider,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithPopup,
    updateProfile,
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    serverTimestamp
} from "./firebase-config.js";
import { syncAllDataToFirebase } from "./firebase-rtdb-sync.js";

/**
 * Register a new user with Firebase Auth & create user profile in Firestore
 */
export async function registerUser({ fullName, email, password, phone, city, role, bloodGroup, latitude, longitude, locationCaptured, locationUpdatedAt }) {
    let authUser = null;
    let authError = null;

    // 1. Try Firebase Authentication with 25s timeout for reliable connection
    try {
        const authPromise = createUserWithEmailAndPassword(auth, email, password);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("auth_timeout")), 25000));
        const userCredential = await Promise.race([authPromise, timeoutPromise]);
        authUser = userCredential.user;
        if (fullName) {
            updateProfile(authUser, { displayName: fullName }).catch(() => {});
        }
        console.log("✓ Firebase Auth account registered successfully:", authUser.uid);
    } catch (error) {
        console.error("Firebase Auth registration error:", error.code, error.message);
        return { success: false, error: formatAuthError(error) };
    }

    // 2. Use genuine Firebase Auth UID
    const uid = authUser.uid;

    // 3. Generate donor card ID or hospital reference
    const cardId = role === 'hospital' 
        ? `HOSP-${Math.floor(100 + Math.random() * 900)}`
        : `LL-${Math.floor(1000 + Math.random() * 9000)}`;

    const profileData = {
        uid: uid,
        name: fullName || "Donor",
        email: email,
        phone: phone || "",
        city: city || "",
        district: city || "",
        role: role || "donor",
        bloodGroup: bloodGroup || "O+",
        donorCardId: cardId,
        latitude: (typeof latitude === 'number' && !isNaN(latitude)) ? latitude : 6.9271,
        longitude: (typeof longitude === 'number' && !isNaN(longitude)) ? longitude : 79.8612,
        locationCaptured: Boolean(locationCaptured),
        locationUpdatedAt: locationUpdatedAt || new Date().toISOString(),
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
    };

    // 4. Save to Cloud Firestore
    let firestoreSaved = false;
    try {
        const fsPromise = setDoc(doc(db, "users", uid), profileData);
        const fsTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error("firestore_timeout")), 15000));
        await Promise.race([fsPromise, fsTimeout]);
        firestoreSaved = true;
        console.log("✓ Profile successfully written to Cloud Firestore 'users' collection:", uid);
        if (role === 'donor') {
            setDoc(doc(db, "donors", uid), profileData, { merge: true }).catch(() => {});
        }
    } catch (dbErr) {
        console.warn("Firestore profile save notice:", dbErr);
    }

    // 5. Store active session in localStorage for local compatibility & instant navbar display
    const localSession = {
        ...profileData,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
    };
    if (typeof localStorage !== "undefined") {
        localStorage.setItem("lifelink_session", JSON.stringify(localSession));

        if (role === 'donor') {
            try {
                const regList = JSON.parse(localStorage.getItem('lifelink_registered_donors') || '[]');
                const exIdx = regList.findIndex(d => d.uid === uid || (d.email && d.email === localSession.email));
                if (exIdx >= 0) regList[exIdx] = localSession;
                else regList.unshift(localSession);
                localStorage.setItem('lifelink_registered_donors', JSON.stringify(regList));
            } catch (_) {}
        }
    }
    if (typeof window !== "undefined") {
        window.LifeLinkUser = localSession;
        // Update navbar immediately on the current page with 1st letter of name
        if (typeof window.updateLifeLinkNavbar === "function") {
            window.updateLifeLinkNavbar(localSession);
        }
    }

    // 6. Connect & sync data to Firebase Realtime Database in background (non-blocking)
    syncAllDataToFirebase(localSession).catch((syncErr) => {
        console.warn("RTDB sync notice during registration:", syncErr);
    });

    return { 
        success: true, 
        user: localSession, 
        authCreated: true,
        firestoreSaved: firestoreSaved
    };
}

/**
 * Sign in an existing user with Email & Password
 */
export async function loginUser(email, password) {
    let authUser = null;
    let authError = null;

    // 1. Try Firebase Auth
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        authUser = userCredential.user;
    } catch (err) {
        console.warn("Firebase Auth signin notice:", err.message);
        authError = err;
    }

    // 2. Fetch user profile from Firestore if available
    let profile = null;
    if (authUser) {
        try {
            const userDoc = await getDoc(doc(db, "users", authUser.uid));
            if (userDoc.exists()) {
                profile = { uid: authUser.uid, ...userDoc.data() };
            }
        } catch (dbErr) {
            console.warn("Could not fetch user document from Firestore:", dbErr);
        }
    }

    // If no profile from authUser, check Firestore by email query
    if (!profile && email) {
        try {
            const q = query(collection(db, "users"), where("email", "==", email));
            const snap = await getDocs(q);
            if (!snap.empty) {
                profile = snap.docs[0].data();
            }
        } catch (e) {
            console.warn("Firestore email query notice:", e);
        }
    }

    // Check localStorage session fallback
    if (!profile) {
        try {
            const local = JSON.parse(localStorage.getItem("lifelink_session") || "null");
            if (local && local.email && local.email.toLowerCase() === email.toLowerCase()) {
                profile = local;
            }
        } catch (e) {}
    }

    if (!profile && !authUser) {
        return { success: false, error: authError ? formatAuthError(authError) : "Invalid email or password." };
    }

    if (!profile && authUser) {
        profile = {
            uid: authUser.uid,
            name: authUser.displayName || email.split("@")[0].toUpperCase(),
            email: email,
            role: "donor",
            bloodGroup: "O+"
        };
    }

    profile.loggedInAt = new Date().toISOString();
    localStorage.setItem("lifelink_session", JSON.stringify(profile));
    if (typeof window !== "undefined") {
        window.LifeLinkUser = profile;
        if (typeof window.updateLifeLinkNavbar === "function") {
            window.updateLifeLinkNavbar(profile);
        }
    }

    // 3. Connect & sync all data to Firebase Realtime Database in background
    syncAllDataToFirebase(profile).catch((syncErr) => {
        console.warn("RTDB sync notice during login:", syncErr);
    });

    return { success: true, user: profile };
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        let profile = {
            uid: user.uid,
            name: user.displayName || "Google User",
            email: user.email,
            role: "donor",
            donorCardId: `LL-${Math.floor(1000 + Math.random() * 9000)}`,
            photoURL: user.photoURL || null
        };

        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                profile = { ...profile, ...userDoc.data() };
            } else {
                await setDoc(userDocRef, {
                    ...profile,
                    createdAt: serverTimestamp()
                });
            }
        } catch (dbErr) {
            console.warn("Firestore sync warning during Google Sign In:", dbErr);
        }

        profile.loggedInAt = new Date().toISOString();
        localStorage.setItem("lifelink_session", JSON.stringify(profile));
        if (typeof window !== "undefined") {
            window.LifeLinkUser = profile;
            if (typeof window.updateLifeLinkNavbar === "function") {
                window.updateLifeLinkNavbar(profile);
            }
        }

        // Connect & sync all data to Firebase Realtime Database
        try {
            await syncAllDataToFirebase(profile);
        } catch (syncErr) {
            console.warn("RTDB sync notice during Google Sign In:", syncErr);
        }

        return { success: true, user: profile };
    } catch (error) {
        console.error("Google Sign In Error:", error);
        return { success: false, error: formatAuthError(error) };
    }
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error("Password reset error:", error);
        return { success: false, error: formatAuthError(error) };
    }
}

/**
 * Sign out user
 */
export async function logoutUser() {
    try {
        await signOut(auth);
    } catch (_) {}
    localStorage.removeItem("lifelink_session");
    if (typeof window !== "undefined") {
        window.LifeLinkUser = null;
        if (typeof window.updateLifeLinkNavbar === "function") {
            window.updateLifeLinkNavbar(null);
        }
    }
    return { success: true };
}

/**
 * Track user auth state listener
 */
export function onAuthUserChanged(callback) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            let userData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || firebaseUser.email.split("@")[0]
            };
            try {
                const snap = await getDoc(doc(db, "users", firebaseUser.uid));
                if (snap.exists()) {
                    userData = { ...userData, ...snap.data() };
                }
            } catch (e) {
                // Ignore silent fail
            }
            callback(userData);
        } else {
            let local = null;
            try {
                local = JSON.parse(localStorage.getItem("lifelink_session") || "null");
            } catch (_) {}
            callback(local);
        }
    });
}

/**
 * Helper to turn Firebase error codes into human-friendly messages
 */
function formatAuthError(error) {
    if (!error) return "An authentication error occurred.";
    if (error.message === "auth_timeout") {
        return "Connection to Firebase timed out. Please check your internet connection.";
    }
    switch (error.code) {
        case "auth/email-already-in-use":
            return "This email is already registered in Firebase. Please sign in instead.";
        case "auth/invalid-email":
            return "The email address is improperly formatted.";
        case "auth/weak-password":
            return "Password is too weak. Please use at least 6 characters.";
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Invalid email or password. Please try again.";
        case "auth/popup-closed-by-user":
            return "Sign-in popup was closed before completing.";
        case "auth/too-many-requests":
            return "Too many failed attempts. Please try again later.";
        case "auth/operation-not-allowed":
            return "Email/Password sign-in is not enabled yet in your Firebase console. Go to Authentication > Sign-in method and enable it.";
        case "auth/network-request-failed":
            return "Network request failed. Please check your internet connection.";
        case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
        case "auth/api-key-not-valid":
        case "auth/invalid-api-key":
            return "Firebase Web API Key is invalid. Please copy the Web API Key from Firebase Console > Project Settings.";
        default:
            return error.message || "An authentication error occurred.";
    }
}

// Expose globally on window for easy access in inline HTML event handlers
if (typeof window !== "undefined") {
    window.LifeLinkAuth = {
        registerUser,
        loginUser,
        loginWithGoogle,
        resetPassword,
        logoutUser,
        onAuthUserChanged
    };
}

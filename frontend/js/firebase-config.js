/**
 * LifeLink Blood Donation Network - Firebase Configuration & Initialization
 * 
 * Uses Firebase Modular Web SDK (v11 CDN) for vanilla JavaScript / multi-page apps.
 * Works seamlessly in HTML without requiring a bundler, while matching standard npm modular syntax.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    setDoc,
    getDoc,
    getDocs, 
    doc, 
    query, 
    where, 
    orderBy, 
    onSnapshot,
    serverTimestamp,
    deleteDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    child, 
    push, 
    onValue, 
    update, 
    remove, 
    serverTimestamp as rtdbServerTimestamp 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";

// ==========================================
// 1. FIREBASE PROJECT CONFIGURATION
// ==========================================
export const firebaseConfig = {
    apiKey: "AIzaSyDA3lBOZPMVvYs7iZVrwtdtPmv561ghAA0",
    authDomain: "lifelink-e37cf.firebaseapp.com",
    databaseURL: "https://lifelink-e37cf-default-rtdb.firebaseio.com",
    projectId: "lifelink-e37cf",
    storageBucket: "lifelink-e37cf.firebasestorage.app",
    messagingSenderId: "184737275775",
    appId: "1:184737275775:web:1af4e05c367aa0d537844a",
    measurementId: "G-6TW4TCM66C"
};

// ==========================================
// 2. INITIALIZE CORE SERVICES
// ==========================================
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics is optional and only initializable in browser environments with window
let analytics = null;
try {
    if (typeof window !== "undefined") {
        analytics = getAnalytics(app);
    }
} catch (err) {
    console.info("Firebase Analytics not initialized (optional):", err.message);
}
export { analytics };

// ==========================================
// 3. EXPOSE GLOBALLY FOR REGULAR SCRIPTS
// ==========================================
// Allows non-module scripts on any page to access Firebase via window.LifeLinkFirebase
if (typeof window !== "undefined") {
    window.LifeLinkFirebase = {
        app,
        auth,
        db,
        rtdb,
        analytics,
        googleProvider,
        // Auth functions
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        signOut,
        onAuthStateChanged,
        sendPasswordResetEmail,
        signInWithPopup,
        updateProfile,
        // Firestore functions
        collection,
        addDoc,
        setDoc,
        getDoc,
        getDocs,
        doc,
        query,
        where,
        orderBy,
        onSnapshot,
        serverTimestamp,
        deleteDoc,
        updateDoc,
        // Realtime Database functions
        ref,
        set,
        get,
        child,
        push,
        onValue,
        update,
        remove,
        rtdbServerTimestamp
    };
    console.log("LifeLink: Firebase connected successfully! (Project: lifelink-e37cf | RTDB: lifelink-e37cf-default-rtdb)");

    // Notify listeners that Firebase is initialized and ready
    try {
        window.dispatchEvent(new CustomEvent('lifelink:firebase-ready', {
            detail: window.LifeLinkFirebase
        }));
    } catch (e) {
        // Fallback for older environments
    }
}

// ==========================================
// 4. EXPORT UTILITY / SERVICE METHODS
// ==========================================
export {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    collection,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    deleteDoc,
    updateDoc,
    // Realtime Database
    ref,
    set,
    get,
    child,
    push,
    onValue,
    update,
    remove,
    rtdbServerTimestamp
};

/**
 * LifeLink - Emergency Blood Requests Data Manager
 * Real-time synchronization with Firebase Cloud Firestore database + local offline cache.
 */

const STORAGE_KEY_REQUESTS = 'lifelink_blood_requests';
const FIRESTORE_COLLECTION = 'blood_requests';

// Default initial Sri Lankan emergency blood requests (offline seed & fallback)
const INITIAL_BLOOD_REQUESTS = [
    {
        id: "REQ-101",
        patientName: "Kasun Bandara",
        bloodGroup: "O+",
        unitsNeeded: 2,
        urgency: "Emergency",
        urgencyLabel: "Emergency (Immediate - Within 2 Hours)",
        hospital: "National Hospital of Sri Lanka",
        city: "Colombo 08",
        district: "Colombo",
        contactName: "Dr. N. Fernando",
        contactPhone: "077 123 4567",
        medicalNotes: "Emergency open-heart surgical bypass scheduled. Requires fresh matching units immediately.",
        postedAt: "10m ago",
        timestamp: Date.now() - 10 * 60 * 1000,
        status: "Active"
    },
    {
        id: "REQ-102",
        patientName: "Ayesha Dilhani",
        bloodGroup: "A-",
        unitsNeeded: 1,
        urgency: "Urgent",
        urgencyLabel: "Urgent (Within 6 Hours)",
        hospital: "Teaching Hospital, Kandy",
        city: "Peradeniya",
        district: "Kandy",
        contactName: "Sunil Wickramasinghe",
        contactPhone: "071 987 6543",
        medicalNotes: "Thalassemia patient regular monthly transfusion. Current hospital blood bank stock depleted.",
        postedAt: "25m ago",
        timestamp: Date.now() - 25 * 60 * 1000,
        status: "Active"
    },
    {
        id: "REQ-103",
        patientName: "Mahesh Jayatissa",
        bloodGroup: "B+",
        unitsNeeded: 3,
        urgency: "Emergency",
        urgencyLabel: "Emergency (Immediate - Within 2 Hours)",
        hospital: "Karapitiya Teaching Hospital",
        city: "Karapitiya",
        district: "Galle",
        contactName: "Priyani Jayatissa",
        contactPhone: "075 555 1234",
        medicalNotes: "Severe vehicular road accident admission in Trauma ICU Counter 2.",
        postedAt: "1h ago",
        timestamp: Date.now() - 60 * 60 * 1000,
        status: "Active"
    },
    {
        id: "REQ-104",
        patientName: "S. Thivakaran",
        bloodGroup: "AB-",
        unitsNeeded: 1,
        urgency: "Urgent",
        urgencyLabel: "Urgent (Within 6 Hours)",
        hospital: "Teaching Hospital, Jaffna",
        city: "Jaffna",
        district: "Jaffna",
        contactName: "Dr. K. Ravindran",
        contactPhone: "076 444 8899",
        medicalNotes: "Obstetric emergency post-delivery hemorrhage care. Critical platelet & whole blood need.",
        postedAt: "2h ago",
        timestamp: Date.now() - 120 * 60 * 1000,
        status: "Active"
    },
    {
        id: "REQ-105",
        patientName: "Nimali Rathnayake",
        bloodGroup: "O-",
        unitsNeeded: 2,
        urgency: "Emergency",
        urgencyLabel: "Emergency (Immediate - Within 2 Hours)",
        hospital: "Kurunegala Teaching Hospital",
        city: "Kurunegala",
        district: "Kurunegala",
        contactName: "Saman Rathnayake",
        contactPhone: "078 222 3344",
        medicalNotes: "Rare negative universal donor required for emergency caesarean section delivery.",
        postedAt: "3h ago",
        timestamp: Date.now() - 180 * 60 * 1000,
        status: "Active"
    },
    {
        id: "REQ-106",
        patientName: "Mohamed Rameez",
        bloodGroup: "A+",
        unitsNeeded: 2,
        urgency: "Standard",
        urgencyLabel: "Standard (Within 24 Hours)",
        hospital: "Batticaloa Teaching Hospital",
        city: "Batticaloa",
        district: "Batticaloa",
        contactName: "Farzana Rameez",
        contactPhone: "077 888 9900",
        medicalNotes: "Orthopedic surgery reconstruction scheduled tomorrow morning.",
        postedAt: "4h ago",
        timestamp: Date.now() - 240 * 60 * 1000,
        status: "Active"
    },
    {
        id: "REQ-107",
        patientName: "Chaminda Senanayake",
        bloodGroup: "B-",
        unitsNeeded: 1,
        urgency: "Urgent",
        urgencyLabel: "Urgent (Within 6 Hours)",
        hospital: "Anuradhapura Teaching Hospital",
        city: "Anuradhapura",
        district: "Anuradhapura",
        contactName: "Malith Senanayake",
        contactPhone: "070 333 4455",
        medicalNotes: "Chronic kidney disease dialysis patient with low hemoglobin level.",
        postedAt: "6h ago",
        timestamp: Date.now() - 360 * 60 * 1000,
        status: "Active"
    },
    {
        id: "REQ-108",
        patientName: "Kavindu Alwis",
        bloodGroup: "AB+",
        unitsNeeded: 2,
        urgency: "Standard",
        urgencyLabel: "Standard (Within 24 Hours)",
        hospital: "Badulla Provincial General Hospital",
        city: "Badulla",
        district: "Badulla",
        contactName: "Chandana Alwis",
        contactPhone: "072 111 2233",
        medicalNotes: "General surgery admission Ward 4. Pre-operative cross matching required.",
        postedAt: "8h ago",
        timestamp: Date.now() - 480 * 60 * 1000,
        status: "Active"
    }
];

// In-memory cache & listeners
let cachedBloodRequests = null;
const subscribers = new Set();
let isFirestoreListenerAttached = false;
let firestoreUnsubscribe = null;
let currentSyncStatus = {
    connected: false,
    provider: 'local',
    lastSync: null,
    error: null
};

/**
 * Normalize timestamp from Firestore or localStorage object
 */
function normalizeTimestamp(val, createdAt) {
    if (typeof val === 'number' && !isNaN(val) && val > 0) {
        return val;
    }
    if (createdAt) {
        if (typeof createdAt.toMillis === 'function') {
            return createdAt.toMillis();
        }
        if (typeof createdAt.seconds === 'number') {
            return createdAt.seconds * 1000;
        }
        if (typeof createdAt === 'number') {
            return createdAt;
        }
        if (createdAt instanceof Date) {
            return createdAt.getTime();
        }
    }
    return Date.now();
}

/**
 * Standardize a blood request object from Firestore or local storage
 */
function normalizeRequestItem(raw, fallbackId = null) {
    const rawData = raw || {};
    const ts = normalizeTimestamp(rawData.timestamp, rawData.createdAt);
    const id = rawData.id || fallbackId || `REQ-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
        id: String(id),
        docId: rawData.docId || fallbackId || String(id),
        patientName: rawData.patientName || "Anonymous Patient",
        bloodGroup: (rawData.bloodGroup || "O+").toUpperCase(),
        unitsNeeded: parseInt(rawData.unitsNeeded, 10) || 1,
        urgency: rawData.urgency || "Emergency",
        urgencyLabel: rawData.urgencyLabel || `${rawData.urgency || "Emergency"} Need`,
        hospital: rawData.hospital || "General Hospital",
        city: rawData.city || "",
        district: rawData.district || rawData.city || "",
        contactName: rawData.contactName || "Coordinator",
        contactPhone: rawData.contactPhone || "",
        medicalNotes: rawData.medicalNotes || "Emergency blood request broadcast via LifeLink portal.",
        postedAt: rawData.postedAt || formatRelativeTime(ts),
        timestamp: ts,
        status: rawData.status || "Active",
        isUserSubmitted: Boolean(rawData.isUserSubmitted),
        fromFirebase: Boolean(rawData.fromFirebase)
    };
}

/**
 * Synchronous accessor for blood requests.
 * Always returns immediately with the latest in-memory / cached data.
 */
function getStoredBloodRequests() {
    if (Array.isArray(cachedBloodRequests) && cachedBloodRequests.length > 0) {
        return [...cachedBloodRequests];
    }

    try {
        if (typeof localStorage !== 'undefined') {
            const data = localStorage.getItem(STORAGE_KEY_REQUESTS);
            if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    cachedBloodRequests = parsed.map(item => normalizeRequestItem(item));
                    return [...cachedBloodRequests];
                }
            }
        }
    } catch (e) {
        console.warn('Could not read blood requests from localStorage:', e.message);
    }

    // Default fallback
    cachedBloodRequests = INITIAL_BLOOD_REQUESTS.map(item => normalizeRequestItem(item));
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(cachedBloodRequests));
        }
    } catch (e) {}

    return [...cachedBloodRequests];
}

/**
 * Broadcast updated blood requests to subscribers and window event listeners
 */
function broadcastUpdates(source = 'firebase') {
    const list = getStoredBloodRequests();

    // Call subscriber functions
    subscribers.forEach(callback => {
        try {
            callback(list, { source, status: currentSyncStatus });
        } catch (err) {
            console.error('Error in blood requests subscriber:', err);
        }
    });

    // Dispatch DOM event for decoupled components
    if (typeof window !== 'undefined') {
        try {
            window.dispatchEvent(new CustomEvent('lifelink:requests-updated', {
                detail: {
                    requests: list,
                    count: list.length,
                    source,
                    status: currentSyncStatus,
                    timestamp: Date.now()
                }
            }));
        } catch (e) {}
    }
}

/**
 * Update internal sync status and notify UI
 */
function setSyncStatus(connected, provider, error = null) {
    currentSyncStatus = {
        connected,
        provider,
        lastSync: connected ? new Date() : currentSyncStatus.lastSync,
        error: error ? String(error) : null
    };

    if (typeof window !== 'undefined') {
        window.LifeLinkFirebaseSyncStatus = currentSyncStatus;
        try {
            window.dispatchEvent(new CustomEvent('lifelink:requests-sync-status', {
                detail: currentSyncStatus
            }));
        } catch (e) {}
    }
}

/**
 * Attach real-time Firestore onSnapshot listener to auto-update data
 */
function initFirebaseRequestsSync() {
    if (typeof window === 'undefined') return;
    if (isFirestoreListenerAttached) return;

    const tryAttach = () => {
        if (isFirestoreListenerAttached) return true;

        const fb = window.LifeLinkFirebase;
        if (!fb || !fb.db || !fb.collection || !fb.onSnapshot) {
            return false;
        }

        try {
            const { db, collection, onSnapshot } = fb;
            const requestsCol = collection(db, FIRESTORE_COLLECTION);

            console.log("LifeLink: Attaching real-time Firestore auto-update listener on 'blood_requests'...");

            // 1. Attach Realtime Database listener (Primary real-time data sync)
            if (fb.rtdb && fb.ref && fb.onValue) {
                try {
                    const { rtdb, ref, onValue } = fb;
                    const rtdbRef = ref(rtdb, 'blood_requests');
                    onValue(rtdbRef, (snapshot) => {
                        const val = snapshot.val();
                        if (val && typeof val === 'object') {
                            const rtdbList = Object.keys(val).map(k => normalizeRequestItem(val[k], k));
                            if (rtdbList.length > 0) {
                                const map = new Map();
                                rtdbList.forEach(item => map.set(item.id, item));
                                INITIAL_BLOOD_REQUESTS.forEach(seed => {
                                    if (!map.has(seed.id)) map.set(seed.id, normalizeRequestItem(seed));
                                });
                                const merged = Array.from(map.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                                cachedBloodRequests = merged;
                                try { localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(merged)); } catch (_) {}
                                setSyncStatus(true, 'firebase', null);
                                broadcastUpdates('firebase-rtdb');
                            }
                        }
                    }, (err) => {
                        console.warn("LifeLink RTDB requests sync notice:", err.message);
                    });
                } catch (rtdbErr) {
                    console.warn("Could not bind RTDB onValue listener:", rtdbErr);
                }
            }

            // 2. Attach Cloud Firestore listener (Secondary / Dual-Cloud sync)
            firestoreUnsubscribe = onSnapshot(requestsCol, (snapshot) => {
                const firestoreDocs = [];
                snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    firestoreDocs.push(normalizeRequestItem({
                        ...data,
                        docId: docSnap.id,
                        fromFirebase: true
                    }, docSnap.id));
                });

                console.log(`LifeLink: Firestore real-time update received (${firestoreDocs.length} requests in cloud database).`);

                // Merge with initial requests to ensure offline/demo coverage if Firestore has limited entries
                const combinedMap = new Map();

                // Firestore documents take highest priority
                firestoreDocs.forEach(item => {
                    combinedMap.set(item.id, item);
                });

                // Add any initial seed requests not yet overwritten in Firestore
                INITIAL_BLOOD_REQUESTS.forEach(initItem => {
                    if (!combinedMap.has(initItem.id)) {
                        combinedMap.set(initItem.id, normalizeRequestItem(initItem));
                    }
                });

                // Convert to array and sort newest first
                const mergedList = Array.from(combinedMap.values()).sort((a, b) => {
                    return (b.timestamp || 0) - (a.timestamp || 0);
                });

                cachedBloodRequests = mergedList;

                // Persist to localStorage for instant offline access
                try {
                    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(mergedList));
                } catch (saveErr) {}

                setSyncStatus(true, 'firebase', null);
                broadcastUpdates('firebase');
            }, (error) => {
                console.warn("LifeLink: Firestore live sync notice (operating in local fallback mode):", error.message);
                setSyncStatus(false, 'local', error.message);
            });

            isFirestoreListenerAttached = true;
            return true;
        } catch (err) {
            console.warn("LifeLink: Could not initialize Firestore listener:", err);
            setSyncStatus(false, 'local', err.message);
            return false;
        }
    };

    // Attempt immediate attach
    if (tryAttach()) return;

    // Listen for custom ready event from firebase-config.js
    window.addEventListener('lifelink:firebase-ready', () => {
        tryAttach();
    }, { once: true });

    // Fallback polling (checks every 300ms for up to 10 seconds)
    let attempts = 0;
    const interval = setInterval(() => {
        attempts++;
        if (tryAttach() || attempts > 30) {
            clearInterval(interval);
        }
    }, 300);
}

/**
 * Save a new blood request with optimistic local update + Firebase Firestore sync
 */
function saveBloodRequest(requestData) {
    const list = getStoredBloodRequests();
    const newReqId = requestData.id || `REQ-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest = normalizeRequestItem({
        id: newReqId,
        patientName: requestData.patientName,
        bloodGroup: requestData.bloodGroup,
        unitsNeeded: parseInt(requestData.unitsNeeded, 10) || 1,
        urgency: requestData.urgency || "Emergency",
        urgencyLabel: requestData.urgencyLabel || `${requestData.urgency || "Emergency"} (Immediate)`,
        hospital: requestData.hospital,
        city: requestData.city,
        district: requestData.district || requestData.city,
        contactName: requestData.contactName,
        contactPhone: requestData.contactPhone,
        medicalNotes: requestData.medicalNotes || "Emergency broadcast submitted via LifeLink portal.",
        postedAt: "Just now",
        timestamp: Date.now(),
        status: "Active",
        isUserSubmitted: true
    }, newReqId);

    // Optimistic local update (prepend to top)
    const updatedList = [newRequest, ...list.filter(item => item.id !== newRequest.id)];
    cachedBloodRequests = updatedList;

    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updatedList));
        }
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }

    // Immediately inform UI
    broadcastUpdates('local-optimistic');

    // Asynchronously push to Realtime Database
    if (typeof window !== 'undefined' && window.LifeLinkFirebase && window.LifeLinkFirebase.rtdb) {
        try {
            const { rtdb, ref, set } = window.LifeLinkFirebase;
            set(ref(rtdb, `blood_requests/${newReqId}`), {
                ...newRequest,
                syncedToRTDB: true
            }).then(() => {
                console.log("LifeLink: Emergency request synced to RTDB with ID:", newReqId);
            }).catch(e => {
                console.warn("RTDB request push notice:", e.message);
            });
        } catch (rtdbErr) {
            console.warn("Could not push request to RTDB:", rtdbErr);
        }
    }

    // Asynchronously push to Cloud Firestore
    let firebasePromise = null;
    if (typeof window !== 'undefined' && window.LifeLinkFirebase && window.LifeLinkFirebase.db) {
        try {
            const { db, collection, addDoc, serverTimestamp } = window.LifeLinkFirebase;
            firebasePromise = addDoc(collection(db, FIRESTORE_COLLECTION), {
                ...newRequest,
                createdAt: serverTimestamp()
            }).then(docRef => {
                console.log("LifeLink: Emergency request synced to Cloud Firestore with ID:", docRef.id);
                newRequest.docId = docRef.id;
                newRequest.fromFirebase = true;
                return newRequest;
            }).catch(err => {
                console.warn("Firestore sync notice (verify Firestore security rules):", err.message);
                return newRequest;
            });
        } catch (fbErr) {
            console.warn("Could not push to Firestore:", fbErr);
            firebasePromise = Promise.resolve(newRequest);
        }
    } else {
        firebasePromise = Promise.resolve(newRequest);
    }

    newRequest.firebasePromise = firebasePromise;
    return newRequest;
}

/**
 * Async version of saveBloodRequest that awaits Firestore confirmation or safety timeout
 */
async function saveBloodRequestAsync(requestData, timeoutMs = 2500) {
    const req = saveBloodRequest(requestData);
    if (!req.firebasePromise) return req;

    try {
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(req), timeoutMs));
        return await Promise.race([req.firebasePromise, timeoutPromise]);
    } catch (e) {
        return req;
    }
}

/**
 * Subscribe to blood requests updates in real-time.
 * Automatically triggers immediately with current data, then on any Firebase / local change.
 * @returns {Function} Unsubscribe function
 */
function subscribeToBloodRequests(callback) {
    if (typeof callback !== 'function') return () => {};

    subscribers.add(callback);

    // Initial immediate invocation
    const current = getStoredBloodRequests();
    try {
        callback(current, { source: 'initial', status: currentSyncStatus });
    } catch (e) {
        console.error('Error during initial subscribe callback:', e);
    }

    // Ensure Firestore listener is running
    initFirebaseRequestsSync();

    return () => {
        subscribers.delete(callback);
    };
}

/**
 * Format relative human-readable timestamp (e.g., '5m ago', '2h ago')
 */
function formatRelativeTime(timestamp) {
    if (!timestamp) return 'Recently';
    const numTs = typeof timestamp === 'number' ? timestamp : Number(timestamp);
    if (isNaN(numTs)) return 'Recently';

    const diffSec = Math.floor((Date.now() - numTs) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

/**
 * Optional helper to seed all initial Sri Lankan requests into Cloud Firestore
 */
async function seedInitialBloodRequestsToFirebase() {
    if (typeof window === 'undefined' || !window.LifeLinkFirebase || !window.LifeLinkFirebase.db) {
        throw new Error("Firebase is not initialized yet.");
    }
    const { db, collection, addDoc, serverTimestamp } = window.LifeLinkFirebase;
    const results = [];
    for (const item of INITIAL_BLOOD_REQUESTS) {
        const docRef = await addDoc(collection(db, FIRESTORE_COLLECTION), {
            ...item,
            createdAt: serverTimestamp()
        });
        results.push({ id: item.id, docId: docRef.id });
    }
    return results;
}

/**
 * Get current sync status
 */
function getFirebaseSyncStatus() {
    return { ...currentSyncStatus };
}

// Automatically start Firestore sync when script loads in browser
if (typeof window !== 'undefined') {
    window.getStoredBloodRequests = getStoredBloodRequests;
    window.saveBloodRequest = saveBloodRequest;
    window.saveBloodRequestAsync = saveBloodRequestAsync;
    window.subscribeToBloodRequests = subscribeToBloodRequests;
    window.onBloodRequestsChange = subscribeToBloodRequests;
    window.formatRelativeTime = formatRelativeTime;
    window.initFirebaseRequestsSync = initFirebaseRequestsSync;
    window.seedInitialBloodRequestsToFirebase = seedInitialBloodRequestsToFirebase;
    window.getFirebaseSyncStatus = getFirebaseSyncStatus;

    // Start auto sync
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFirebaseRequestsSync);
    } else {
        initFirebaseRequestsSync();
    }
}

// Node.js module support
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getStoredBloodRequests,
        saveBloodRequest,
        saveBloodRequestAsync,
        subscribeToBloodRequests,
        onBloodRequestsChange: subscribeToBloodRequests,
        formatRelativeTime,
        initFirebaseRequestsSync,
        seedInitialBloodRequestsToFirebase,
        getFirebaseSyncStatus,
        INITIAL_BLOOD_REQUESTS
    };
}

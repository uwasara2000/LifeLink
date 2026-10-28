/**
 * LifeLink Blood Donation Network - Realtime Database Sync Engine (firebase-rtdb-sync.js)
 * 
 * Synchronizes all application data with Firebase Realtime Database:
 *  - /users          : Registered user profiles, contact info, donor card IDs, login times
 *  - /donors         : Live verified donor pool with GPS coordinates, blood groups, availability
 *  - /blood_requests : Emergency blood requisitions across Sri Lanka
 *  - /hospitals      : Partner hospital blood banks and inventory units
 *  - /system         : System status and connection health
 * 
 * Triggers automatically after user sign-in to populate and connect all data to Firebase.
 */

import {
    app,
    auth,
    db,
    rtdb,
    ref,
    set,
    get,
    child,
    push,
    onValue,
    update,
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs
} from "./firebase-config.js";

// ============================================================================
// 1. DEFAULT SEED DATA (SRI LANKA BLOOD NETWORK)
// ============================================================================

export const SEED_BLOOD_REQUESTS = {
    "REQ-101": {
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
    "REQ-102": {
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
    "REQ-103": {
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
    "REQ-104": {
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
    "REQ-105": {
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
    "REQ-106": {
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
    "REQ-107": {
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
    "REQ-108": {
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
};

export const SEED_DONORS = {
    "D101": {
        id: "D101",
        uid: "D101",
        name: "John Perera",
        bloodGroup: "A+",
        district: "Colombo",
        city: "Colombo 03",
        latitude: 6.9064,
        longitude: 79.8528,
        distance: 2.4,
        lastDonationMonths: 4,
        totalDonations: 8,
        available: true,
        gender: "Male",
        age: 28,
        phone: "+94 77 123 4567",
        email: "john.perera@email.com",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        donorCardId: "LL-8492",
        verified: true,
        locationCaptured: true,
        updatedAt: Date.now()
    },
    "D102": {
        id: "D102",
        uid: "D102",
        name: "Nimal Silva",
        bloodGroup: "O-",
        district: "Gampaha",
        city: "Gampaha",
        latitude: 7.0917,
        longitude: 79.9990,
        distance: 4.8,
        lastDonationMonths: 5,
        totalDonations: 12,
        available: true,
        gender: "Male",
        age: 34,
        phone: "+94 71 987 6543",
        email: "nimal.silva@email.com",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
        donorCardId: "LL-3104",
        verified: true,
        locationCaptured: true,
        updatedAt: Date.now()
    },
    "D103": {
        id: "D103",
        uid: "D103",
        name: "Tharushi Fernando",
        bloodGroup: "B+",
        district: "Kandy",
        city: "Kandy",
        latitude: 7.2906,
        longitude: 80.6337,
        distance: 8.6,
        lastDonationMonths: 3,
        totalDonations: 5,
        available: true,
        gender: "Female",
        age: 24,
        phone: "+94 76 555 1234",
        email: "tharushi.f@email.com",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
        donorCardId: "LL-9145",
        verified: true,
        locationCaptured: true,
        updatedAt: Date.now()
    },
    "D104": {
        id: "D104",
        uid: "D104",
        name: "Sameera De Silva",
        bloodGroup: "AB-",
        district: "Colombo",
        city: "Mount Lavinia",
        latitude: 6.8344,
        longitude: 79.8667,
        distance: 9.1,
        lastDonationMonths: 2,
        totalDonations: 3,
        available: false,
        gender: "Male",
        age: 29,
        phone: "+94 70 333 9988",
        email: "sameera.desilva@email.com",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
        donorCardId: "LL-7721",
        verified: true,
        locationCaptured: true,
        updatedAt: Date.now()
    },
    "D105": {
        id: "D105",
        uid: "D105",
        name: "Dr. Anoma Wickramasinghe",
        bloodGroup: "O+",
        district: "Colombo",
        city: "Nugegoda",
        latitude: 6.8649,
        longitude: 79.8997,
        distance: 3.2,
        lastDonationMonths: 6,
        totalDonations: 15,
        available: true,
        gender: "Female",
        age: 38,
        phone: "+94 77 444 8822",
        email: "anoma.w@health.lk",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
        donorCardId: "LL-5561",
        verified: true,
        locationCaptured: true,
        updatedAt: Date.now()
    },
    "D106": {
        id: "D106",
        uid: "D106",
        name: "Kavinda Rathnayake",
        bloodGroup: "A-",
        district: "Gampaha",
        city: "Negombo",
        latitude: 7.2088,
        longitude: 79.8358,
        distance: 12.0,
        lastDonationMonths: 7,
        totalDonations: 6,
        available: true,
        gender: "Male",
        age: 22,
        phone: "+94 78 222 1199",
        email: "kavinda.r@email.com",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
        donorCardId: "LL-1934",
        verified: true,
        locationCaptured: true,
        updatedAt: Date.now()
    }
};

export const SEED_HOSPITALS = {
    "HOSP-01": {
        id: "HOSP-01",
        name: "National Hospital of Sri Lanka",
        city: "Colombo 08",
        district: "Colombo",
        type: "National Apex Hospital & Central Blood Bank",
        phone: "+94 11 269 1111",
        emergencyHotline: "1990",
        latitude: 6.9186,
        longitude: 79.8687,
        inventory: {
            "A+": 24, "A-": 8, "B+": 30, "B-": 5, "O+": 42, "O-": 12, "AB+": 14, "AB-": 4
        },
        verified: true
    },
    "HOSP-02": {
        id: "HOSP-02",
        name: "Teaching Hospital, Kandy",
        city: "Peradeniya / Kandy",
        district: "Kandy",
        type: "Provincial Teaching Hospital",
        phone: "+94 81 222 2261",
        emergencyHotline: "1990",
        latitude: 7.2847,
        longitude: 80.6276,
        inventory: {
            "A+": 16, "A-": 4, "B+": 18, "B-": 3, "O+": 28, "O-": 7, "AB+": 9, "AB-": 2
        },
        verified: true
    },
    "HOSP-03": {
        id: "HOSP-03",
        name: "Karapitiya Teaching Hospital",
        city: "Galle",
        district: "Galle",
        type: "Southern Provincial Tertiary Care Center",
        phone: "+94 91 223 2250",
        emergencyHotline: "1990",
        latitude: 6.0642,
        longitude: 80.2308,
        inventory: {
            "A+": 12, "A-": 3, "B+": 15, "B-": 2, "O+": 22, "O-": 5, "AB+": 7, "AB-": 1
        },
        verified: true
    },
    "HOSP-04": {
        id: "HOSP-04",
        name: "Teaching Hospital, Jaffna",
        city: "Jaffna",
        district: "Jaffna",
        type: "Northern Provincial Center",
        phone: "+94 21 222 2261",
        emergencyHotline: "1990",
        latitude: 9.6631,
        longitude: 80.0153,
        inventory: {
            "A+": 10, "A-": 2, "B+": 14, "B-": 2, "O+": 19, "O-": 4, "AB+": 5, "AB-": 1
        },
        verified: true
    }
};

// ============================================================================
// 2. MAIN SYNC CONTROLLER: CONNECT ALL DATA TO FIREBASE AFTER SIGN-IN
// ============================================================================

let isSyncInProgress = false;
let hasSyncedInSession = false;

/**
 * Connects all user and application data to Firebase Realtime Database
 * Runs automatically upon user sign-in or can be called explicitly.
 * 
 * @param {Object} currentUser Profile of the signed in user
 * @returns {Promise<Object>} Results of the synchronization
 */
export async function syncAllDataToFirebase(currentUser = null) {
    if (isSyncInProgress) {
        console.log("LifeLink: Data sync already in progress, waiting...");
        return { success: true, message: "Sync already in progress" };
    }

    isSyncInProgress = true;
    console.log("LifeLink: Starting complete Firebase Realtime Database connection & sync...");

    const results = {
        userSynced: false,
        donorsSynced: false,
        requestsSynced: false,
        hospitalsSynced: false,
        systemSynced: false,
        errors: []
    };

    // 1. Resolve user profile
    let user = currentUser || window.LifeLinkUser;
    if (!user && auth && auth.currentUser) {
        user = {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            name: auth.currentUser.displayName || auth.currentUser.email.split("@")[0],
            role: "donor"
        };
    }
    if (!user) {
        try {
            user = JSON.parse(localStorage.getItem("lifelink_session") || "null");
        } catch (_) {}
    }

    try {
        // Ensure Realtime Database is accessible
        if (!rtdb) {
            throw new Error("Firebase Realtime Database instance (rtdb) not initialized.");
        }

        // ==========================================================
        // A. SYNC USER PROFILE
        // ==========================================================
        if (user && user.uid) {
            const userRef = ref(rtdb, `users/${user.uid}`);
            const userPayload = {
                uid: user.uid,
                email: user.email || "",
                name: user.name || user.displayName || "LifeLink User",
                role: user.role || "donor",
                bloodGroup: user.bloodGroup || "O+",
                phone: user.phone || "",
                city: user.city || "Colombo",
                district: user.district || user.city || "Colombo",
                donorCardId: user.donorCardId || `LL-${Math.floor(1000 + Math.random() * 9000)}`,
                latitude: (typeof user.latitude === 'number' && !isNaN(user.latitude)) ? user.latitude : 6.9271,
                longitude: (typeof user.longitude === 'number' && !isNaN(user.longitude)) ? user.longitude : 79.8612,
                locationCaptured: Boolean(user.locationCaptured),
                status: "active",
                registeredAt: new Date().toISOString(),
                lastLoginAt: Date.now(),
                lastSeen: Date.now()
            };

            await set(userRef, userPayload);
            results.userSynced = true;
            console.log(`LifeLink: User profile [${user.email || user.uid}] saved to RTDB /users/${user.uid}`);

            // If user is a donor, also register them under /donors/${user.uid}
            if (user.role === "donor" || user.bloodGroup) {
                const donorPayload = {
                    id: user.uid,
                    uid: user.uid,
                    name: userPayload.name,
                    bloodGroup: userPayload.bloodGroup || "O+",
                    city: userPayload.city,
                    district: userPayload.district,
                    latitude: userPayload.latitude,
                    longitude: userPayload.longitude,
                    phone: userPayload.phone,
                    email: userPayload.email,
                    available: true,
                    gender: user.gender || "Male",
                    age: user.age || 26,
                    donorCardId: userPayload.donorCardId,
                    verified: true,
                    locationCaptured: userPayload.locationCaptured,
                    updatedAt: Date.now()
                };
                await set(ref(rtdb, `donors/${user.uid}`), donorPayload);
                console.log(`LifeLink: User donor profile registered in RTDB /donors/${user.uid}`);
            }

            // Also keep Firestore in sync if available
            try {
                if (db) {
                    await setDoc(doc(db, "users", user.uid), userPayload, { merge: true });
                }
            } catch (fsErr) {
                console.info("Firestore secondary sync notice:", fsErr.message);
            }
        }

        // ==========================================================
        // B. SYNC & SEED BLOOD REQUESTS
        // ==========================================================
        try {
            const requestsRef = ref(rtdb, "blood_requests");
            const reqSnap = await get(requestsRef);
            const existingRequests = reqSnap.exists() ? reqSnap.val() : null;

            if (!existingRequests || Object.keys(existingRequests).length === 0) {
                console.log("LifeLink: RTDB /blood_requests is empty. Seeding initial Sri Lankan blood requests...");
                await set(requestsRef, SEED_BLOOD_REQUESTS);
                results.requestsSynced = true;
            } else {
                console.log(`LifeLink: RTDB /blood_requests already has ${Object.keys(existingRequests).length} requests.`);
                results.requestsSynced = true;
            }

            // Sync any local offline user-submitted requests to RTDB
            try {
                const localList = JSON.parse(localStorage.getItem("lifelink_blood_requests") || "[]");
                if (Array.isArray(localList)) {
                    for (const req of localList) {
                        if (req.isUserSubmitted && req.id) {
                            await set(ref(rtdb, `blood_requests/${req.id}`), {
                                ...req,
                                syncedAt: Date.now()
                            });
                        }
                    }
                }
            } catch (_) {}

        } catch (reqErr) {
            console.warn("Blood requests RTDB sync notice:", reqErr.message);
            results.errors.push(`Requests: ${reqErr.message}`);
        }

        // ==========================================================
        // C. SYNC & SEED VERIFIED DONORS
        // ==========================================================
        try {
            const donorsRef = ref(rtdb, "donors");
            const donorsSnap = await get(donorsRef);
            const existingDonors = donorsSnap.exists() ? donorsSnap.val() : null;

            if (!existingDonors || Object.keys(existingDonors).length <= 1) {
                console.log("LifeLink: RTDB /donors is empty or minimal. Seeding verified Sri Lankan donors...");
                // Write seed donors without overwriting the current user if already written
                const mergedDonors = { ...SEED_DONORS };
                if (user && user.uid && user.bloodGroup) {
                    mergedDonors[user.uid] = {
                        id: user.uid,
                        uid: user.uid,
                        name: user.name || "Active Donor",
                        bloodGroup: user.bloodGroup,
                        city: user.city || "Colombo",
                        district: user.district || user.city || "Colombo",
                        latitude: user.latitude || 6.9271,
                        longitude: user.longitude || 79.8612,
                        phone: user.phone || "",
                        email: user.email || "",
                        available: true,
                        donorCardId: user.donorCardId || "LL-1000",
                        verified: true,
                        updatedAt: Date.now()
                    };
                }
                await update(donorsRef, mergedDonors);
                results.donorsSynced = true;
            } else {
                console.log(`LifeLink: RTDB /donors currently contains ${Object.keys(existingDonors).length} active donors.`);
                results.donorsSynced = true;
            }
        } catch (donErr) {
            console.warn("Donors RTDB sync notice:", donErr.message);
            results.errors.push(`Donors: ${donErr.message}`);
        }

        // ==========================================================
        // D. SYNC & SEED HOSPITALS
        // ==========================================================
        try {
            const hospRef = ref(rtdb, "hospitals");
            const hospSnap = await get(hospRef);
            if (!hospSnap.exists() || Object.keys(hospSnap.val() || {}).length === 0) {
                await set(hospRef, SEED_HOSPITALS);
                results.hospitalsSynced = true;
                console.log("LifeLink: Seeded partner hospital blood banks into RTDB /hospitals");
            } else {
                results.hospitalsSynced = true;
            }
        } catch (hospErr) {
            console.warn("Hospitals RTDB sync notice:", hospErr.message);
            results.errors.push(`Hospitals: ${hospErr.message}`);
        }

        // ==========================================================
        // E. SYSTEM HEARTBEAT & SYNC METADATA
        // ==========================================================
        try {
            await set(ref(rtdb, "system"), {
                appName: "LifeLink Blood Donation Network",
                databaseUrl: "https://lifelink-e37cf-default-rtdb.firebaseio.com",
                lastSyncAt: new Date().toISOString(),
                syncedBy: user ? (user.email || user.uid) : "Guest",
                version: "2.1.0",
                status: "Operational - Live Connected"
            });
            results.systemSynced = true;
        } catch (sysErr) {
            console.warn("System status write notice:", sysErr.message);
        }

        hasSyncedInSession = true;
        console.log("LifeLink: All data connected & synced to Firebase Realtime Database successfully!");

        // Dispatch notification event across the page
        try {
            window.dispatchEvent(new CustomEvent("lifelink:firebase-synced", {
                detail: {
                    user,
                    results,
                    timestamp: Date.now()
                }
            }));
        } catch (_) {}

        return { success: true, results };
    } catch (error) {
        console.error("LifeLink: Critical error connecting to Firebase Realtime Database:", error);
        return { success: false, error: error.message, results };
    } finally {
        isSyncInProgress = false;
    }
}

// ============================================================================
// 3. REALTIME DATABASE LISTENERS & HELPERS
// ============================================================================

/**
 * Listen to real-time blood requests updates from RTDB
 */
export function listenToRequestsRTDB(callback) {
    if (!rtdb) return () => {};
    try {
        const requestsRef = ref(rtdb, "blood_requests");
        return onValue(requestsRef, (snapshot) => {
            const data = snapshot.val();
            const list = [];
            if (data && typeof data === "object") {
                Object.keys(data).forEach(k => {
                    if (data[k]) {
                        list.push({ ...data[k], id: data[k].id || k });
                    }
                });
            }
            // Sort newest first
            list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            callback(list);
        }, (err) => {
            console.warn("RTDB blood_requests listener notice:", err.message);
        });
    } catch (e) {
        console.warn("Could not attach RTDB blood requests listener:", e);
        return () => {};
    }
}

/**
 * Listen to real-time donors updates from RTDB
 */
export function listenToDonorsRTDB(callback) {
    if (!rtdb) return () => {};
    try {
        const donorsRef = ref(rtdb, "donors");
        return onValue(donorsRef, (snapshot) => {
            const data = snapshot.val();
            const list = [];
            if (data && typeof data === "object") {
                Object.keys(data).forEach(k => {
                    if (data[k]) {
                        list.push({ ...data[k], id: data[k].id || k });
                    }
                });
            }
            callback(list);
        }, (err) => {
            console.warn("RTDB donors listener notice:", err.message);
        });
    } catch (e) {
        console.warn("Could not attach RTDB donors listener:", e);
        return () => {};
    }
}

/**
 * Save a new blood request directly to Realtime Database
 */
export async function saveBloodRequestToRTDB(requestData) {
    if (!rtdb) return null;
    const reqId = requestData.id || `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const payload = {
        ...requestData,
        id: reqId,
        timestamp: requestData.timestamp || Date.now(),
        status: requestData.status || "Active",
        syncedToRTDB: true
    };

    try {
        await set(ref(rtdb, `blood_requests/${reqId}`), payload);
        console.log(`LifeLink: Blood request ${reqId} written to RTDB /blood_requests/${reqId}`);
        return payload;
    } catch (e) {
        console.warn("Failed to write request to RTDB:", e);
        return payload;
    }
}

/**
 * Save a donor directly to Realtime Database
 */
export async function saveDonorToRTDB(donorData) {
    if (!rtdb) return null;
    const donorId = donorData.id || donorData.uid || `D-${Math.floor(1000 + Math.random() * 9000)}`;
    const payload = {
        ...donorData,
        id: donorId,
        uid: donorId,
        updatedAt: Date.now()
    };

    try {
        await set(ref(rtdb, `donors/${donorId}`), payload);
        console.log(`LifeLink: Donor ${donorId} written to RTDB /donors/${donorId}`);
        return payload;
    } catch (e) {
        console.warn("Failed to write donor to RTDB:", e);
        return payload;
    }
}

// ============================================================================
// 4. AUTO-ATTACH TO SIGN-IN EVENTS
// ============================================================================

// A. React immediately when auth-state.js detects user sign-in
if (typeof window !== "undefined") {
    window.addEventListener("lifelink:signed-in", (event) => {
        const user = event.detail?.user;
        console.log("LifeLink: Sign-in event detected, triggering full Firebase connection...", user?.email);
        syncAllDataToFirebase(user);
    });

    // B. React when Firebase SDK is initialized and user is already cached
    window.addEventListener("lifelink:firebase-ready", () => {
        const cached = localStorage.getItem("lifelink_session");
        if (cached) {
            try {
                const user = JSON.parse(cached);
                syncAllDataToFirebase(user);
            } catch (_) {}
        }
    });

    // C. Expose globally for vanilla HTML scripts and buttons
    window.LifeLinkSync = {
        syncAllDataToFirebase,
        listenToRequestsRTDB,
        listenToDonorsRTDB,
        saveBloodRequestToRTDB,
        saveDonorToRTDB,
        SEED_DONORS,
        SEED_BLOOD_REQUESTS,
        SEED_HOSPITALS
    };
}

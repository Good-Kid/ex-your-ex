// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { getDatabase, ref, get } from "firebase/database";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyARD6QXTiiulw9QFMKlHWdVnwVj66J7BOs",
    authDomain: "ex-your-ex.firebaseapp.com",
    projectId: "ex-your-ex",
    storageBucket: "ex-your-ex.firebasestorage.app",
    messagingSenderId: "775180189478",
    appId: "1:775180189478:web:33a867db330e92d6ea0be7",
    measurementId: "G-FZJM8ZJEZD",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
// Promise that resolves when we have a user (signs in anonymously if needed)
export const authReady = new Promise((resolve) => {
    let resolved = false;
    onAuthStateChanged(auth, async (user) => {
        try {
            if (!user) {
                await signInAnonymously(auth);
            }
        } catch (e) {
            console.error("[Firebase] anonymous sign-in failed:", e);
        } finally {
            if (!resolved) {
                resolved = true;
                resolve(getAuth(app).currentUser || null);
            }
        }
    });
});

// --- Analytics (only if supported) ---
export const analyticsPromise = isSupported()
    .then((ok) => (ok ? getAnalytics(app) : null))
    .catch(() => null);

export const log = async (event, params) => {
    const analytics = await analyticsPromise;
    if (analytics) logEvent(analytics, event, params);
};

// --- Realtime Database (reads only from client) ---
export const db = getDatabase(app);

export const getLetGoCount = async () => {
    try {
        const snapshot = await get(ref(db, "letGoCount"));
        return snapshot.exists() ? snapshot.val() : 0;
    } catch (err) {
        console.error("[Firebase] getLetGoCount error:", err);
        return 0;
    }
};

// --- Cloud Function for secure increment (no client writes) ---
const functions = getFunctions(app, "us-central1");

export const incrementLetGoCount = async () => {
    await authReady;
    const call = httpsCallable(functions, "incrementLetGoCount");
    const { data } = await call();
    return data?.value; // new counter value
};

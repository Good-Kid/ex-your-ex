// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
    getDatabase,
    ref,
    get,
    set,
    onValue,
    increment,
    runTransaction,
} from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyARD6QXTiiulw9QFMKlHWdVnwVj66J7BOs",
    authDomain: "ex-your-ex.firebaseapp.com",
    projectId: "ex-your-ex",
    storageBucket: "ex-your-ex.firebasestorage.app",
    messagingSenderId: "775180189478",
    appId: "1:775180189478:web:33a867db330e92d6ea0be7",
    measurementId: "G-FZJM8ZJEZD",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
getAnalytics(app);

export const analyticsPromise = isSupported().then((ok) =>
    ok ? getAnalytics(app) : null
);
export const log = async (event, params) => {
    const analytics = await analyticsPromise;
    if (analytics) logEvent(analytics, event, params);
};

// Counter helpers
export const getLetGoCount = async () => {
    try {
        const snapshot = await get(ref(db, "letGoCount"));
        const val = snapshot.exists() ? snapshot.val() : 0;
        console.debug("[Firebase] getLetGoCount value:", val);
        return val;
    } catch (err) {
        console.error("[Firebase] getLetGoCount error:", err);
        return 0;
    }
};

export const incrementLetGoCount = async () => {
    try {
        const result = await runTransaction(
            ref(db, "letGoCount"),
            (current) => {
                return (current || 0) + 1;
            }
        );
        console.debug("[Firebase] incrementLetGoCount result:", result);
        return result;
    } catch (err) {
        console.error("[Firebase] incrementLetGoCount error:", err);
        throw err;
    }
};

// functions/index.js
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

initializeApp();

exports.incrementLetGoCount = onCall({ region: "us-central1" }, async (req) => {
    if (!req.auth) throw new HttpsError("unauthenticated", "Sign in required");

    const db = getDatabase();
    const uid = req.auth.uid;
    const rlRef = db.ref(`_rateLimits/letGoCount/${uid}`);
    const WINDOW_MS = 60_000;
    const MAX_IN_WINDOW = 5;
    const now = Date.now();
    const rlSnap = await rlRef.get();
    const rl = rlSnap.exists() ? rlSnap.val() : { start: now, count: 0 };

    if (now - rl.start > WINDOW_MS) {
        await rlRef.set({ start: now, count: 1 });
    } else {
        if ((rl.count || 0) >= MAX_IN_WINDOW) {
            throw new HttpsError("resource-exhausted", "Rate limit exceeded");
        }
        await rlRef.update({ count: (rl.count || 0) + 1 });
    }

    const ref = db.ref("letGoCount");
    const res = await ref.transaction((cur) => {
        const base = Number.isFinite(cur) ? cur : 0;
        return Math.max(0, Math.min(base + 1, 1e12));
    });

    if (!res.committed) throw new HttpsError("aborted", "Increment aborted");
    return { value: res.snapshot.val() };
});

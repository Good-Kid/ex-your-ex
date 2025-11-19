import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { log } from "../firebase";

let gaSessionStarted = false;

function sendGA4PageView(pathname, search) {
    if (typeof window.gtag !== "function") return;
    const page_location = window.location.origin + pathname + search;
    window.gtag("event", "page_view", {
        page_location,
        page_path: pathname,
        page_title: document.title || undefined,
    });
}

export default function AnalyticsPageViewLogger() {
    const location = useLocation();

    useEffect(() => {
        // your backend logs (optional)
        log("page_view", {
            path: location.pathname,
            search: location.search,
            hash: location.hash,
        });

        // one-time session start (optional)
        if (!gaSessionStarted && window.gtag) {
            gaSessionStarted = true;
            window.gtag("event", "session_start");
        }

        // GA4 SPA page_view
        sendGA4PageView(location.pathname, location.search);

        // Only your own first-visit source log (doesn't affect GA)
        // GA first_user_* will be handled by the GA snippet itself on FIRST load.
        // Keep this if you like your own reporting.
        // (No changes needed beyond ensuring GA loads before React.)
        // ----
        // If you keep your existing "first_visit_source" log, it's fine.
    }, [location]);

    return null;
}

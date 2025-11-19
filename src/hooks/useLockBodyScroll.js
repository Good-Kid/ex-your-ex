import { useEffect } from "react";

export function useLockBodyScroll(locked) {
    useEffect(() => {
        if (!locked) return;

        // Save current scroll position
        const scrollY =
            window.scrollY ||
            window.pageYOffset ||
            document.documentElement.scrollTop ||
            0;

        // Apply lock styles
        const { style } = document.body;
        const prev = {
            position: style.position,
            top: style.top,
            left: style.left,
            right: style.right,
            width: style.width,
            overflow: style.overflow,
        };

        style.position = "fixed";
        style.top = `-${scrollY}px`;
        style.left = "0";
        style.right = "0";
        style.width = "100%";
        style.overflow = "hidden";

        // Helps on Android/Chrome to avoid overscroll chaining
        const htmlPrevOverscroll =
            document.documentElement.style.overscrollBehaviorY;
        document.documentElement.style.overscrollBehaviorY = "none";

        return () => {
            // Restore styles
            style.position = prev.position || "";
            style.top = prev.top || "";
            style.left = prev.left || "";
            style.right = prev.right || "";
            style.width = prev.width || "";
            style.overflow = prev.overflow || "";

            document.documentElement.style.overscrollBehaviorY =
                htmlPrevOverscroll || "";

            // Restore the scroll position
            const y = style.top ? -parseInt(style.top || "0", 10) : scrollY;
            window.scrollTo(0, y || 0);
        };
    }, [locked]);
}

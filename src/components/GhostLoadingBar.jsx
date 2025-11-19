import { useState, useEffect, useMemo } from "react";

export default function GhostLoadingBar({ progress = 0.8 }) {
    // Stable reference so the effect deps are predictable
    const frames = useMemo(
        () => ["/images/loading_frame1.webp", "/images/loading_frame2.webp"],
        []
    );

    const [frameIndex, setFrameIndex] = useState(0);

    useEffect(() => {
        // (Optional) preload frames to avoid flash
        const imgs = frames.map((src) => {
            const img = new Image();
            img.src = src;
            return img;
        });

        const id = setInterval(() => {
            setFrameIndex((prev) => (prev + 1) % frames.length);
        }, 600);

        return () => clearInterval(id); // cleanup prevents StrictMode weirdness
    }, [frames.length, frames]); // include frames length (or frames)

    return (
        <div className="ghost-loading-bar">
            <img className="frame" src={frames[frameIndex]} alt="" />
            <img
                className="bar"
                style={{
                    position: "relative",
                    left: `-${(1 - progress) * 100}%`,
                }}
                src={"/images/loading_bar.webp"} // match absolute path style
                alt=""
            />
        </div>
    );
}

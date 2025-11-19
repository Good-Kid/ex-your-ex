import { Helmet } from "react-helmet-async";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { getCardInfo, tarotCards } from "../data/tarotCards";
import TarotModal from "../components/TarotPage/TarotModal";
import LinkButton from "../components/LinkButton";

export default function GalleryPage() {
    const [modalCard, setModalCard] = useState(null);
    const tarotIds = Object.keys(tarotCards);

    // id -> true when full image is loaded
    const [loadedMap, setLoadedMap] = useState({});
    // prevent starting multiple preloads for the same id
    const startedRef = useRef({});

    // Detect mobile
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(
                /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                    navigator.userAgent
                ) || window.matchMedia("(max-width: 768px)").matches
            );
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Preload full-size images once, then flip the card to full when ready
    useEffect(() => {
        tarotIds.forEach((id) => {
            if (startedRef.current[id]) return;
            const info = getCardInfo(id);
            const fullSrc = info?.image?.src || "/images/tarot/noart.webp";
            startedRef.current[id] = true;

            const img = new Image();
            img.onload = () =>
                setLoadedMap((m) => (m[id] ? m : { ...m, [id]: true }));
            img.onerror = () =>
                setLoadedMap((m) => (m[id] ? m : { ...m, [id]: false }));
            img.src = fullSrc;
        });
    }, [tarotIds]);

    const toRoman = (num) => {
        if (num === 0) return "0";
        const roman = [
            ["M", 1000],
            ["CM", 900],
            ["D", 500],
            ["CD", 400],
            ["C", 100],
            ["XC", 90],
            ["L", 50],
            ["XL", 40],
            ["X", 10],
            ["IX", 9],
            ["V", 5],
            ["IV", 4],
            ["I", 1],
        ];
        let res = "";
        for (const [ch, val] of roman) {
            while (num >= val) {
                res += ch;
                num -= val;
            }
        }
        return res;
    };

    // Keyboard navigation for modal
    const handleKeyDown = useCallback(
        (e) => {
            if (!modalCard) return;
            const idx = tarotIds.indexOf(modalCard);
            if (e.key === "ArrowRight") {
                const nextIdx = (idx + 1) % tarotIds.length;
                setModalCard(tarotIds[nextIdx]);
            } else if (e.key === "ArrowLeft") {
                const prevIdx = (idx - 1 + tarotIds.length) % tarotIds.length;
                setModalCard(tarotIds[prevIdx]);
            } else if (e.key === "Escape") {
                setModalCard(null);
            }
        },
        [modalCard, tarotIds]
    );

    useEffect(() => {
        if (!modalCard) return;
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [modalCard, handleKeyDown]);

    return (
        <>
            <Helmet>
                <title>Exorcise Your Ex - Tarot Card Gallery</title>
                <meta
                    name="description"
                    content="View all of the Exorcise Your Ex Tarot Cards."
                />
            </Helmet>
            <div id="GalleryPage">
                <h2 className="typewriter">Tarot Card Gallery</h2>
                <LinkButton to="/kit">Back to Kit</LinkButton>

                <div className="tarot-gallery-grid">
                    {tarotIds.map((id, idx) => {
                        const info = getCardInfo(id);
                        const thumbSrc =
                            info?.image?.loadingSrc ||
                            "/images/tarot/noart.webp";
                        const fullSrc =
                            info?.image?.src || "/images/tarot/noart.webp";
                        const showFull = !!loadedMap[id];

                        return (
                            <div
                                key={id}
                                className={`tarot-gallery-card ${
                                    !isMobile ? "hoverable" : ""
                                }`}
                                style={{
                                    cursor: "pointer",
                                    textAlign: "center",
                                }}
                                onClick={() => setModalCard(id)}
                            >
                                <div className="card-title">
                                    <span className="card-no">
                                        {toRoman(idx)}
                                    </span>
                                    <span className="card-name">
                                        {info?.name || id}
                                    </span>
                                </div>

                                <img
                                    src={showFull ? fullSrc : thumbSrc}
                                    alt={info?.name || "Tarot Card"}
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            "/images/tarot/noart.webp";
                                    }}
                                    draggable={false}
                                />
                            </div>
                        );
                    })}
                </div>

                {modalCard && (
                    <TarotModal
                        selectedCard={modalCard}
                        onClose={() => setModalCard(null)}
                    />
                )}
            </div>
        </>
    );
}

import React, { useState } from "react";
import { getCardInfo, tarotCards } from "../data/tarotCards";
import TarotModal from "../components/TarotPage/TarotModal";
import LinkButton from "../components/LinkButton";

export default function GalleryPage() {
    const [modalCard, setModalCard] = useState(null);
    const tarotIds = Object.keys(tarotCards);

    // Track loaded state for each card
    const [loadedMap, setLoadedMap] = useState({}); // { [id]: true }

    return (
        <div id="GalleryPage">
            <h2 className="typewriter">Tarot Card Gallery</h2>
            <LinkButton to="/kit">Back to Kit</LinkButton>
            <div className="tarot-gallery-grid">
                {tarotIds.map((id, idx) => {
                    const info = getCardInfo(id);
                    const loadingImage =
                        info?.image?.loadingImage || "/images/tarot/noart.png";
                    const fullSrc =
                        info?.image?.src || "/images/tarot/noart.png";
                    // Helper function to convert number to Roman numerals
                    function toRoman(num) {
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
                        let result = "";
                        for (const [letter, value] of roman) {
                            while (num >= value) {
                                result += letter;
                                num -= value;
                            }
                        }
                        return result;
                    }

                    // Show loading image until fullSrc loads
                    const showFull = loadedMap[id];

                    return (
                        <div
                            key={id}
                            className="tarot-gallery-card"
                            style={{ cursor: "pointer", textAlign: "center" }}
                            onClick={() => setModalCard(id)}
                        >
                            <div className="card-title">
                                <span className="card-no">
                                    {toRoman(idx + 1)}
                                </span>
                                <span className="card-name">
                                    {info?.name || id}
                                </span>
                            </div>
                            <img
                                src={showFull ? fullSrc : loadingImage}
                                alt={info?.name || "Tarot Card"}
                                onLoad={() => {
                                    if (!showFull) {
                                        // Only set loaded if loadingImage is showing
                                        const img = new window.Image();
                                        img.src = fullSrc;
                                        img.onload = () => {
                                            setLoadedMap((prev) => ({
                                                ...prev,
                                                [id]: true,
                                            }));
                                        };
                                        img.onerror = () => {
                                            setLoadedMap((prev) => ({
                                                ...prev,
                                                [id]: false,
                                            }));
                                        };
                                    }
                                }}
                                onError={(e) => {
                                    e.currentTarget.src =
                                        "/images/tarot/noart.png";
                                }}
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
    );
}

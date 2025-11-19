import React from "react";
import { useGameState } from "../../context/GameStateContext";
import { tarotCards } from "../../data/tarotCards";

const SLOT_TITLES = ["PAST", "PRESENT", "FUTURE"];

export default function TarotCardSpread({ className = "" }) {
    const { gameState } = useGameState();
    const cardIds = gameState.flags.tarotLastDrawnCards || [];

    // Defensive: Only show if we have 3 valid cards
    if (
        !Array.isArray(cardIds) ||
        cardIds.length !== 3 ||
        cardIds.some((id) => !id)
    ) {
        return null;
    }

    // Fan positions: -12deg, 0deg, +12deg for a gentler fan
    const fanAngles = [-12, 0, 12];
    // Responsive card size for mobile
    const isMobile = typeof window !== "undefined" && window.innerWidth < 600;
    const CARD_HEIGHT = isMobile ? 140 : 315;
    const CARD_RATIO = 180 / 315; // width/height
    const CARD_WIDTH = Math.round(CARD_HEIGHT * CARD_RATIO);
    const OVERLAP = isMobile ? 2 : 2;

    return (
        <div
            className={`tarot-card-spread-fan ${className}`}
            style={{
                height: CARD_HEIGHT + 40,
            }}
        >
            {cardIds.map((id, i) => {
                const card = tarotCards[id];
                if (!card) return null;
                return (
                    <div
                        key={id}
                        className="tarot-card-spread-card"
                        style={{
                            transform: `rotate(${fanAngles[i]}deg) translateY(${
                                Math.abs(fanAngles[i]) * 2
                            }px)`,
                            zIndex: i === 1 ? 2 : 1,
                            marginLeft: i === 0 ? 0 : -OVERLAP,
                            marginRight: i === 2 ? 0 : -OVERLAP,
                        }}
                    >
                        <img
                            src={card.image?.src}
                            alt={card.name}
                            className="tarot-card-spread-img"
                            style={{
                                height: CARD_HEIGHT,
                                width: CARD_WIDTH,
                                aspectRatio: `${CARD_WIDTH}/${CARD_HEIGHT}`,
                            }}
                        />
                        <div
                            className="tarot-card-spread-label"
                            style={{
                                marginTop: isMobile ? 4 : 6,
                                fontSize: isMobile ? 13 : 16,
                            }}
                        >
                            {SLOT_TITLES[i]}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

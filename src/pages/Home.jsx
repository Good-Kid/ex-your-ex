import { useState } from "react";
import FlickerEffect from "../components/FlickerEffect";
import CursorZone from "../components/CursorZone";

const IMAGE_CONFIG = {
    candle: {
        width: "auto",
        height: "600px",
    },
    flicker: {
        width: "240px",
        height: "240px",
        positions: {
            left: {
                left: "50%",
                top: "12%",
                transform: "translate(-50%, -50%)",
            },
            right: {
                right: "50%",
                top: "12%",
                transform: "translate(50%, -50%)",
            },
        },
    },
    phone: { width: "650px", height: "auto" },
    skull: {
        size: { width: "340px", height: "auto" },
        position: { bottom: 30, left: 330 },
    },
};

export default function Home() {
    const isFlickerEnabled = true; // Set flicker state directly in code
    const [isLeftCandleLit, setIsLeftCandleLit] = useState(true);
    const [isRightCandleLit, setIsRightCandleLit] = useState(true);

    const handleLeftCandleClick = () => {
        setIsLeftCandleLit(false);
    };

    const handleRightCandleClick = () => {
        setIsRightCandleLit(false);
    };

    const isDimmed = !isLeftCandleLit || !isRightCandleLit; // Dim when any candle is snuffed
    const isFullyDimmed = !isLeftCandleLit && !isRightCandleLit; // Fully dim when both candles are snuffed

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative", // Ensure child absolute positioning works
                opacity: isFullyDimmed ? 0 : isDimmed ? 0.5 : 1, // Fully dim or partially dim
                transition: "opacity 0.3s ease", // Smooth transition
            }}
        >
            {/* Horizontal container */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "68%", // Adjust width as needed
                    position: "relative", // Ensure relative positioning for absolute children
                }}
            >
                {/* Flickering radial gradient for the left candle */}
                <div style={{ position: "relative" }}>
                    <FlickerEffect
                        position={IMAGE_CONFIG.flicker.positions.left}
                        isEnabled={isFlickerEnabled && isLeftCandleLit} // Flicker only when lit
                    />
                    <img
                        src={
                            isLeftCandleLit
                                ? "/images/candle.png"
                                : "/images/unlit_candle.png"
                        }
                        alt="Candle"
                        style={{ ...IMAGE_CONFIG.candle, zIndex: 1 }}
                    />
                    <CursorZone
                        disabled={!isLeftCandleLit}
                        cursorImage="/public/images/snuffer.png"
                        borderColor="blue"
                        position={{ top: "0", left: "5%" }}
                        size={{ width: "80px", height: "150px" }}
                        onClick={handleLeftCandleClick}
                    />
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <div
                        className="typewriter"
                        style={{
                            fontSize: "3em",
                            marginBottom: "1em",
                        }}
                    >
                        exorciseyourex.com
                    </div>
                    <img
                        src="/images/phone.webp"
                        alt="Phone"
                        style={{ ...IMAGE_CONFIG.phone }}
                    />
                </div>
                {/* Flickering radial gradient for the right candle */}
                <div style={{ position: "relative" }}>
                    <FlickerEffect
                        position={IMAGE_CONFIG.flicker.positions.right}
                        isEnabled={isFlickerEnabled && isRightCandleLit} // Flicker only when lit
                    />
                    <img
                        src={
                            isRightCandleLit
                                ? "/images/candle.png"
                                : "/images/unlit_candle.png"
                        }
                        alt="Candle"
                        style={{ ...IMAGE_CONFIG.candle, zIndex: 1 }}
                    />
                    <CursorZone
                        disabled={!isRightCandleLit}
                        cursorImage="/images/snuffer.png"
                        position={{ top: "0", left: "5%" }}
                        size={{ width: "80px", height: "150px" }}
                        onClick={handleRightCandleClick}
                    />
                </div>
            </div>
            {/* Absolutely positioned skull image */}
            <img
                src="/images/skulldither.webp"
                alt="Skull"
                style={{
                    position: "absolute",
                    ...IMAGE_CONFIG.skull.position,
                    ...IMAGE_CONFIG.skull.size,
                    zIndex: 999,
                }}
            />
        </div>
    );
}

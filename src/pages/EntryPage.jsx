import { useState } from "react";
import { Howl } from "howler";
import CursorZone from "../components/CursorZone";
import { useNavigate } from "react-router-dom";
import { useGameState } from "../context/GameStateContext";

const IMAGE_STYLES = {
    CANDLE: {
        maxHeight: "500px",
        zIndex: 2,
    },
    PHONE: {
        height: "100%",
        width: "auto",
        marginLeft: "-80px",
    },
};

export default function EntryPage() {
    const { gameState, updateGameState } = useGameState();

    const [isLeftCandleLit, setIsLeftCandleLit] = useState(true);
    const [isRightCandleLit, setIsRightCandleLit] = useState(true);
    const [phoneAnswered, setPhoneAnswered] = useState(false);

    const handleLeftCandleClick = () => {
        setIsLeftCandleLit(false);
    };

    const handleRightCandleClick = () => {
        setIsRightCandleLit(false);
    };

    const isDimmed = !isLeftCandleLit || !isRightCandleLit; // Dim when any candle is snuffed
    const isFullyDimmed = !isLeftCandleLit && !isRightCandleLit; // Fully dim when both candles are snuffed

    const dingSound = new Howl({
        src: ["/sounds/ding.mp3"], // Use your sound file path
        volume: 1.0, // Optional: set volume (0.0 to 1.0)
    });

    const navigate = useNavigate();

    const orderButtonClicked = () => {
        setPhoneAnswered(true);
        dingSound.play();

        setTimeout(() => {
            setTimeout(() => {
                const dimSound = new Howl({
                    src: ["/sounds/woosh.mp3"], // Use your dim sound file path
                    volume: 1.0,
                });
                dimSound.play();

                document.getElementById("EntryPage").style.transition =
                    "opacity 1s ease";
                document.getElementById("EntryPage").style.opacity = 0;

                setTimeout(() => {
                    updateGameState({
                        flags: { ...gameState.flags, kitIntroPlayed: false },
                    });
                    navigate("/kit");
                }, 1000); // Wait for the dim sound to finish before redirecting
            }, 1000); // Wait for the dim animation to finish
        }, 2000);
    };

    return (
        <>
            <div
                id="EntryPage"
                className={
                    "entry-page " +
                    (isFullyDimmed ? "fullDim" : isDimmed ? "partialDim" : "")
                }
                style={{
                    width: "100%",
                    maxWidth: "1500px",
                    margin: "auto",
                    height: "100%",
                    maxHeight: "100vh",
                    padding: "80px 60px",
                    display: "grid",
                    justifyContent: "center",
                    alignItems: "center",
                    gridTemplateColumns: "1fr minmax(500px,1.75fr) 1fr",
                    gridTemplateRows: "80px 1fr 1fr",
                    gridGap: "30px 0px",
                    position: "relative",
                }}
            >
                <div
                    className="typewriter"
                    style={{
                        fontSize: !phoneAnswered ? "4.5em" : "3em",
                        gridRow: 1,
                        gridColumn: "1/-1",
                        textAlign: "center",
                        verticalAlign: "top",
                        zIndex: 1,
                    }}
                >
                    {!phoneAnswered
                        ? "exorciseyourex.com"
                        : "Thank you for your order"}
                </div>
                <div
                    style={{
                        margin: "auto",
                        gridRow: 2,
                        gridColumn: 1,
                        position: "relative",
                        alignSelf: "end",
                        zIndex: 2,
                    }}
                >
                    <img
                        style={{ ...IMAGE_STYLES.CANDLE }}
                        src={
                            isLeftCandleLit
                                ? "/images/homepage/candle.png"
                                : "/images/homepage/unlit_candle.png"
                        }
                        alt="Candle"
                    />
                    <img
                        src="/images/homepage/skulldither.webp"
                        alt="Skull"
                        style={{
                            position: "absolute",
                            zIndex: 5,
                            bottom: 0,
                            left: 0,
                            transform: "translate(-250px, 150px)",
                            width: "350px",
                            maxWidth: "none",
                        }}
                    />
                    <CursorZone
                        disabled={!isLeftCandleLit}
                        position={{ top: "0", left: "5%" }}
                        size={{ width: "80px", height: "150px" }}
                        onClick={handleLeftCandleClick}
                    />
                </div>
                <div
                    style={{
                        gridRow: 2,
                        gridColumn: "1 / 3",
                        overflow: "visible",
                        alignSelf: "end",
                        zIndex: 1,
                    }}
                >
                    {/* Phone */}
                    <img
                        style={IMAGE_STYLES.PHONE}
                        src={
                            !phoneAnswered
                                ? "/images/homepage/phone.png"
                                : "/images/homepage/phoneanswered.png"
                        }
                        alt="Phone"
                    />
                </div>
                <div
                    style={{
                        margin: "auto",
                        gridRow: 2,
                        gridColumn: 3,
                        position: "relative",
                        alignSelf: "end",
                        zIndex: 2,
                    }}
                >
                    <img
                        style={IMAGE_STYLES.CANDLE}
                        src={
                            isRightCandleLit
                                ? "/images/homepage/candle.png"
                                : "/images/homepage/unlit_candle.png"
                        }
                        alt="Candle"
                    />
                    <CursorZone
                        disabled={!isRightCandleLit}
                        position={{ top: "0", left: "5%" }}
                        size={{ width: "80px", height: "150px" }}
                        onClick={handleRightCandleClick}
                    />
                </div>
                <div
                    style={{
                        gridRow: 3,
                        gridColumn: "1/-1",
                        textAlign: "center",
                    }}
                >
                    {!phoneAnswered ? (
                        <button
                            className="creepy-button"
                            onClick={orderButtonClicked}
                        >
                            ORDER NOW
                        </button>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        </>
    );
}

import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { Howl } from "howler";
import CursorZone from "../components/CursorZone";
import { useNavigate } from "react-router-dom";
import { useGameState } from "../context/GameStateContext";

const IMAGE_STYLES = {};

const FLAME_SRC = "/images/homepage/flame.gif";
const CANDLE_SRC = "/images/homepage/candle.png";
const PHONE_SRC = "/images/homepage/phone.png";
const PHONE_ANSWERED_SRC = "/images/homepage/phoneanswered.png";
const PHONE_SOUND_SRC = "/sounds/ding.mp3";
const FADE_SOUND_SRC = "/sounds/woosh.mp3";

const FLAME_X = "48%";
const FLAME_Y = "16%";
const FLAME_W = "18%";

export default function EntryPage() {
    const { updateGameState } = useGameState();
    const [phoneAnswered, setPhoneAnswered] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const navigate = useNavigate();

    const handlePhoneClick = () => {
        if (!phoneAnswered) {
            const sound = new Howl({ src: [PHONE_SOUND_SRC] });
            sound.play();
            setPhoneAnswered(true);
        }
    };

    // // Show demo alert on first visit
    // useEffect(() => {
    //     if (!window.__entryPageAlertShown) {
    //         window.__entryPageAlertShown = true;
    //         window.alert(
    //             "This is a demo!\n\nPlease reach out to Libra on Discord with any comments or bugs."
    //         );
    //     }
    // }, []);

    useEffect(() => {
        if (phoneAnswered) {
            const timeout = setTimeout(() => {
                setFadeOut(true);
                const fadeSound = new Howl({
                    src: [FADE_SOUND_SRC],
                    volume: 0.5,
                });
                fadeSound.play();
            }, 800);
            return () => clearTimeout(timeout);
        }
    }, [phoneAnswered]);

    useEffect(() => {
        if (fadeOut) {
            const navTimeout = setTimeout(() => {
                navigate("/kit");
                updateGameState({ kitIntroPlayed: false });
            }, 1000); // match transition duration
            return () => clearTimeout(navTimeout);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fadeOut, navigate]);

    return (
        <>
            <Helmet>
                <title>Exorcise Your Ex - Call Now!</title>
                <meta
                    name="description"
                    content="Are you a victim of heartbreak? Call today!"
                />
            </Helmet>
            <div
                id="EntryPage"
                style={{
                    transition: "opacity 1s",
                    opacity: fadeOut ? 0 : 1,
                }}
            >
                <div className="logo">
                    <img src="/images/logo_full_white.png" alt="" />
                </div>
                <div
                    className="candle"
                    style={{
                        ["--flame-x"]: FLAME_X,
                        ["--flame-y"]: FLAME_Y,
                        ["--flame-w"]: FLAME_W,
                    }}
                >
                    <div className="skull">
                        <img src="/images/homepage/skull.webp" alt="" />
                    </div>
                    <img
                        className="stick"
                        src="/images/homepage/candle.png"
                        alt=""
                    />
                    <img
                        className="flame"
                        src="/images/homepage/flame.gif"
                        alt=""
                    />
                </div>
                <div
                    className={`phone ${
                        phoneAnswered ? "answered" : "hoverable"
                    }`}
                    onClick={handlePhoneClick}
                >
                    <img
                        draggable={false}
                        src={phoneAnswered ? PHONE_ANSWERED_SRC : PHONE_SRC}
                        alt=""
                    />
                    <div className="prompt typewriter">CALL NOW!</div>
                </div>
                <div
                    className="candle"
                    style={{
                        ["--flame-x"]: FLAME_X,
                        ["--flame-y"]: FLAME_Y,
                        ["--flame-w"]: FLAME_W,
                    }}
                >
                    <img
                        className="stick"
                        src="/images/homepage/candle.png"
                        alt=""
                    />
                    <img
                        className="flame"
                        src="/images/homepage/flame.gif"
                        alt=""
                    />
                </div>
            </div>
        </>
    );
}

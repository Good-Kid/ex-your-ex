import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Howl } from "howler";
import CursorZone from "../components/CursorZone";
import { useNavigate } from "react-router-dom";
import { useGameState } from "../context/GameStateContext";

const IMAGE_STYLES = {};

const FLAME_SRC = "/images/homepage/flame.gif";
const CANDLE_SRC = "/images/homepage/candle.webp";
const PHONE_SRC = "/images/homepage/phone.webp";
const PHONE_ANSWERED_SRC = "/images/homepage/phoneanswered.webp";
const PHONE_SOUND_SRC = "/sounds/ding.mp3";
const FADE_SOUND_SRC = "/sounds/woosh.mp3";

const FLAME_X = "48%";
const FLAME_Y = "16%";
const FLAME_W = "18%";

// All images used on this page (unique)
const IMAGE_ASSETS = [
    "/images/logo_full_white.webp",
    "/images/homepage/skull.webp",
    CANDLE_SRC,
    FLAME_SRC,
    PHONE_SRC,
    PHONE_ANSWERED_SRC,
];

// Preload one image (resolves on load/error; prefers decode() for no-jank paint)
function preloadImage(src) {
    return new Promise((resolve) => {
        if (!src) return resolve();
        const img = new Image();
        img.onload = img.onerror = resolve;
        img.src = src;
        if (img.decode) {
            img.decode().then(resolve).catch(resolve);
        }
    });
}

// Preload many with a timeout guard
function preloadImagesWithTimeout(srcs, ms = 2500) {
    const unique = Array.from(new Set(srcs.filter(Boolean)));
    const all = Promise.all(unique.map(preloadImage));

    const timeout = new Promise((resolve) => {
        const id = setTimeout(() => {
            clearTimeout(id);
            resolve(); // let it continue even if some are slow
        }, ms);
    });

    return Promise.race([all, timeout]);
}

export default function EntryPage() {
    const { updateGameState } = useGameState();
    const [phoneAnswered, setPhoneAnswered] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    // NEW: fade-in after preloading
    const [ready, setReady] = useState(false);

    const navigate = useNavigate();

    // Preload all page images before showing the page
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                await preloadImagesWithTimeout(IMAGE_ASSETS, 2500);
            } finally {
                // small RAF for smooth paint before opacity transition
                requestAnimationFrame(() => {
                    if (!cancelled) setReady(true);
                });
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const handlePhoneClick = () => {
        if (!phoneAnswered) {
            const sound = new Howl({ src: [PHONE_SOUND_SRC] });
            sound.play();
            setPhoneAnswered(true);
        }
    };

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

    // Combine fade-in and fade-out
    const pageOpacity = ready ? (fadeOut ? 0 : 1) : 0;

    return (
        <>
            <Helmet>
                <title>Exorcise Your Ex - Call Now!</title>
                <meta
                    name="description"
                    content="Are you a victim of heartbreak? Call today!"
                />
                {/* Optional hints to the browser: */}
                <link
                    rel="preload"
                    as="image"
                    href="/images/logo_full_white.webp"
                />
                <link
                    rel="preload"
                    as="image"
                    href="/images/homepage/skull.webp"
                />
                <link rel="preload" as="image" href={CANDLE_SRC} />
                <link rel="preload" as="image" href={FLAME_SRC} />
                <link rel="preload" as="image" href={PHONE_SRC} />
                <link rel="preload" as="image" href={PHONE_ANSWERED_SRC} />
            </Helmet>

            <div
                id="EntryPage"
                style={{
                    transition: "opacity 1s",
                    opacity: pageOpacity,
                    // avoid accidental clicks while hidden
                    pointerEvents: ready && !fadeOut ? "auto" : "none",
                }}
            >
                <div className="logo">
                    <img src="/images/logo_full_white.webp" alt="" />
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
                    <img className="stick" src={CANDLE_SRC} alt="" />
                    <img className="flame" src={FLAME_SRC} alt="" />
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
                    <img className="stick" src={CANDLE_SRC} alt="" />
                    <img className="flame" src={FLAME_SRC} alt="" />
                </div>
            </div>
        </>
    );
}

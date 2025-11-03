import { useState, useEffect, useRef } from "react";
import { useAnimate } from "motion/react";
import { Howl } from "howler";
import { useGameState } from "../context/GameStateContext.jsx";
import LinkButton from "../components/LinkButton.jsx";

const ONION_STAGES = [
    "/images/knife/onion/onionchop00.png",
    "/images/knife/onion/onionchop01.png",
    "/images/knife/onion/onionchop02.png",
    "/images/knife/onion/onionchop03.png",
    "/images/knife/onion/onionchop04.png",
    "/images/knife/onion/onionchop05.png",
    "/images/knife/onion/onionchop06.png",
    "/images/knife/onion/onionchop07.png",
];

const BOTTLE_STAGES = [
    "/images/knife/bottle/bottle01.png",
    "/images/knife/bottle/bottle01.png",
    "/images/knife/bottle/bottle02.png",
    "/images/knife/bottle/bottle03.png",
    "/images/knife/bottle/bottle04.png",
    "/images/knife/bottle/bottle05.png",
    "/images/knife/bottle/bottle06.png",
    "/images/knife/bottle/bottle07.png",
];

const SOUND_SRCS = [
    "/sounds/chops/chop1.mp3",
    "/sounds/chops/chop2.mp3",
    "/sounds/chops/chop3.mp3",
    "/sounds/chops/chop4.mp3",
];

const playRandomChop = (lastPlayedRef) => {
    const pool = lastPlayedRef.current
        ? SOUND_SRCS.filter((s) => s !== lastPlayedRef.current)
        : SOUND_SRCS;
    const src = pool[Math.floor(Math.random() * pool.length)];
    lastPlayedRef.current = src;
    new Howl({ src: [src] }).play();
};

export default function KnifePage() {
    const { updateGameState } = useGameState();
    const lastPlayedRef = useRef(null);

    const [onionIndex, setOnionIndex] = useState(0);
    const [bottleIndex, setBottleIndex] = useState(0);

    const [knifePos, setKnifePos] = useState({ x: 0, y: 0 });
    const [knifeCursorEnabled, setKnifeCursorEnabled] = useState(false);

    const [onionGlow, setOnionGlow] = useState(false);
    const [onionFullyChopped, setOnionFullyChopped] = useState(false);

    const rafRef = useRef(null);
    const targetRef = useRef({ x: 0, y: 0 });

    // NEW: last-known pointer (updated always; doesn’t re-render)
    const lastPointerRef = useRef({
        x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
        y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
    });

    const [isMobile, setIsMobile] = useState(false);
    const [isTouchScreen, setIsTouchScreen] = useState(false);

    useEffect(() => {
        const checkMobileAndTouch = () => {
            const touch =
                "ontouchstart" in window ||
                navigator.maxTouchPoints > 0 ||
                navigator.msMaxTouchPoints > 0;
            const smallScreen = window.innerWidth < 900;
            setIsTouchScreen(touch);
            setIsMobile(smallScreen);
        };
        checkMobileAndTouch();
        window.addEventListener("resize", checkMobileAndTouch);
        return () => window.removeEventListener("resize", checkMobileAndTouch);
    }, []);

    // Preload onion and bottle images
    useEffect(() => {
        const allImages = [...ONION_STAGES, ...BOTTLE_STAGES];
        allImages.forEach((src) => {
            const img = new window.Image();
            img.src = src;
        });
    }, []);

    // Always track last-known pointer (for immediate seed on enable)
    useEffect(() => {
        const onAnyPointerMove = (e) => {
            if (e && typeof e.clientX === "number") {
                lastPointerRef.current = { x: e.clientX, y: e.clientY };
            }
        };
        window.addEventListener("pointermove", onAnyPointerMove, {
            passive: true,
        });
        return () =>
            window.removeEventListener("pointermove", onAnyPointerMove);
    }, []);

    // Track cursor (only when enabled)
    useEffect(() => {
        if (!knifeCursorEnabled) return;

        const onMove = (e) => {
            targetRef.current = { x: e.clientX, y: e.clientY };
            if (!rafRef.current) {
                rafRef.current = requestAnimationFrame(() => {
                    setKnifePos(targetRef.current);
                    rafRef.current = null;
                });
            }
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        return () => {
            window.removeEventListener("pointermove", onMove);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [knifeCursorEnabled]);

    // ----- Animations -----
    const [scope, animate] = useAnimate();

    const DEFAULT_DURATION = 0.75;

    // Intro animation
    useEffect(() => {
        const introAnimation = async () => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await animate(
                ".intro-container .line1",
                { opacity: 1 },
                { duration: DEFAULT_DURATION }
            );
            await new Promise((resolve) => setTimeout(resolve, 500));
            await animate(
                ".intro-container .line2",
                { opacity: 1 },
                { duration: DEFAULT_DURATION }
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
            await animate(
                ".intro-container",
                { opacity: 0 },
                { duration: DEFAULT_DURATION }
            );
            await animate(
                ".intro-container",
                { display: "none" },
                { duration: 0 }
            );
            await animate(
                ".knife-container",
                { display: "flex" },
                { duration: 0 }
            );
            await animate(
                ".knife-container",
                { opacity: 1 },
                { duration: DEFAULT_DURATION }
            );
        };
        introAnimation();
    }, [animate]);

    //----- Click Handlers -----
    const handleTakeKnife = async (e) => {
        await animate(
            ".knife-container img",
            { opacity: 0 },
            { duration: 0.1 }
        );

        if (!isMobile && !isTouchScreen) {
            // Prefer the click/tap coordinates; fall back to last-known pointer
            const x =
                e?.clientX ??
                e?.touches?.[0]?.clientX ??
                lastPointerRef.current.x;
            const y =
                e?.clientY ??
                e?.touches?.[0]?.clientY ??
                lastPointerRef.current.y;

            // Seed both target and state BEFORE enabling the cursor
            targetRef.current = { x, y };
            setKnifePos({ x, y });
            setKnifeCursorEnabled(true);
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
        await animate(
            ".knife-container",
            { opacity: 0 },
            { duration: DEFAULT_DURATION }
        );
        await animate(".knife-container", { display: "none" }, { duration: 0 });
        await animate(".onion-container", { display: "flex" }, { duration: 0 });
        animate(
            ".bottle-container",
            { bottom: "20%", right: "10%" },
            { duration: 0 }
        );
        animate(
            ".bottle-container",
            { opacity: 1 },
            { duration: DEFAULT_DURATION }
        );
        await animate(
            ".onion-container",
            { opacity: 1 },
            { duration: DEFAULT_DURATION }
        );
    };

    const handleOnionChop = async () => {
        if (onionFullyChopped) return;

        playRandomChop(lastPlayedRef);

        if (onionIndex === ONION_STAGES.length - 1) {
            0;
            // Onion is fully chopped
            setOnionFullyChopped(true);
            animate(".onion-container", { opacity: 0 }, { duration: 0.3 });
            if (knifeCursorEnabled) {
                await animate(
                    ".knife-cursor",
                    { opacity: 0 },
                    { duration: 0.3 }
                );
                setKnifeCursorEnabled(false);
            }
            animate(".onion-container", { display: "none" }, { duration: 0.3 });
            updateGameState({ bottleCompleted: true });
            await animate(
                ".bottle-container",
                {
                    bottom: "50%",
                    right: "50%",
                    pointerEvents: "auto",
                },
                { duration: DEFAULT_DURATION }
            );
            await animate(
                ".bottle-text",
                {
                    opacity: 1,
                },
                { duration: DEFAULT_DURATION }
            );
            return;
        }

        setOnionIndex((i) => Math.min(i + 1, ONION_STAGES.length - 1));
        setBottleIndex((i) => Math.min(i + 1, BOTTLE_STAGES.length - 1));

        animate(".onion-container span", { opacity: 0 }, { duration: 0.5 });
    };

    // ---- Render ----
    return (
        <div
            id="KnifePage"
            className={
                "typewriter " +
                (knifeCursorEnabled && !isMobile ? "cursor-none" : "")
            }
            ref={scope}
        >
            <div className="intro-container">
                <span className="line1" style={{ opacity: 0 }}>
                    The ritual demands a sacrifice
                </span>
                <span className="line2 red" style={{ opacity: 0 }}>
                    Offer what flows within
                </span>
            </div>

            <div
                className="knife-container"
                style={{ display: "none", opacity: 0 }}
            >
                <span>Take the knife</span>
                <img
                    draggable={false}
                    onClick={handleTakeKnife}
                    src="/images/kit/full/knife.png"
                    alt=""
                />
            </div>

            <div
                className="onion-container"
                style={{
                    display: "none",
                    opacity: 0,
                    transform: "translate(0%, 0%)",
                }}
            >
                <span>{isMobile && "Tap to "}Chop</span>
                <img
                    style={{
                        zIndex: 200,
                    }}
                    className={onionGlow ? "glow" : undefined}
                    draggable={false}
                    src={ONION_STAGES[onionIndex]}
                    alt=""
                />
                <div
                    className="onion-click-zone"
                    onClick={handleOnionChop}
                    onMouseEnter={() => {
                        setOnionGlow(true);
                    }}
                    onMouseLeave={() => {
                        setOnionGlow(false);
                    }}
                ></div>
            </div>

            <div
                className="bottle-container"
                style={{
                    opacity: 0,
                    pointerEvents: "none",
                }}
            >
                <span
                    className="bottle-text"
                    style={{
                        opacity: 0,
                    }}
                >
                    You filled the bottle with tears
                </span>
                <img
                    className="bottle-img"
                    draggable={false}
                    src={BOTTLE_STAGES[bottleIndex]}
                    alt=""
                />
                <LinkButton
                    className="bottle-text"
                    style={{
                        opacity: 0,
                    }}
                    to="/kit"
                >
                    Return to Kit
                </LinkButton>
            </div>

            {knifeCursorEnabled && (
                <img
                    draggable={false}
                    src="/images/kit/full/knife.png"
                    alt=""
                    className="knife-cursor"
                    style={{
                        position: "fixed",
                        opacity: 1,
                        left: `${knifePos.x + 100}px`,
                        top: `${knifePos.y - 100}px`,
                        pointerEvents: "none",
                    }}
                />
            )}
        </div>
    );
}

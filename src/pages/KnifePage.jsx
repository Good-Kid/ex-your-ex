import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSequence } from "../utils/useSequence.js";
import { Howl } from "howler";
import { useGameState } from "../context/GameStateContext";
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
    const { gameState, updateGameState } = useGameState();

    const [onionIndex, setOnionIndex] = useState(0);
    const [bottleIndex, setBottleIndex] = useState(0);
    const lastPlayedRef = useRef(null);

    const [knifePos, setKnifePos] = useState({ x: 0, y: 0 });
    const [knifeCursorEnabled, setKnifeCursorEnabled] = useState(false);
    const rafRef = useRef(null);
    const targetRef = useRef({ x: 0, y: 0 });

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

    const [ui, setUI] = useState({
        showIntro: true,
        introLine1: false,
        introLine2: false,
        introFade: false,
        showKnifeContainer: false,
        showKnifeContent: false,
        showKnifeImg: false,
        showOnionContainer: false,
        showBottleContainer: false,
        showBottleImg: false,
        showFearMessage: false,
        showCutMessage: false,
        showOnionImg: false,
        showEnding: false,
        centerBottle: false,
        showBottleMessage: false,
        showKitLink: false,
    });

    // Intro sequence
    useSequence(
        [
            {
                delay: 100,
                run: () => setUI((u) => ({ ...u, introLine1: true })),
            },
            {
                delay: 2000,
                run: () => setUI((u) => ({ ...u, introLine2: true })),
            },
            {
                delay: 2500,
                run: () => setUI((u) => ({ ...u, introFade: true })),
            },
            {
                delay: 800,
                run: () =>
                    setUI((u) => ({
                        ...u,
                        showIntro: false,
                        showKnifeContainer: true,
                    })),
            },
            {
                delay: 50,
                run: () =>
                    setUI((u) => ({
                        ...u,
                        showKnifeContent: true,
                        showKnifeImg: true,
                    })),
            },
        ],
        []
    );

    // Onion Sequence
    useSequence(
        ui.showOnionContainer
            ? [
                  {
                      delay: 0,
                      run: () =>
                          setUI((u) => ({
                              ...u,
                              showOnionContainer: true,
                              showBottleContainer: true,
                          })),
                  },
                  {
                      delay: 10,
                      run: () =>
                          setUI((u) => ({
                              ...u,
                              showFearMessage: true,
                          })),
                  },
                  {
                      delay: 2500,
                      run: () =>
                          setUI((u) => ({
                              ...u,
                              showFearMessage: false,
                          })),
                  },
                  {
                      delay: 1000,
                      run: () =>
                          setUI((u) => ({
                              ...u,
                              showCutMessage: true,
                              showOnionImg: true,
                              showBottleImg: true,
                          })),
                  },
              ]
            : [],
        [ui.showOnionContainer]
    );

    // Ending Sequence
    useSequence(
        ui.showEnding
            ? [
                  {
                      delay: 0,
                      run: () => {
                          setUI((u) => ({
                              ...u,
                              showOnionImg: false,
                              showCutMessage: false,
                          }));
                          setKnifeCursorEnabled(false);
                      },
                  },
                  {
                      delay: 1000,
                      run: () => {
                          setUI((u) => ({
                              ...u,
                              showOnionContainer: false,
                              centerBottle: true,
                          }));
                          updateGameState({
                              flags: {
                                  ...gameState.flags,
                                  bottleCollected: true,
                              },
                          });
                      },
                  },
                  {
                      delay: 1000,
                      run: () =>
                          setUI((u) => ({
                              ...u,
                              showBottleMessage: true,
                          })),
                  },
                  {
                      delay: 2000,
                      run: () =>
                          setUI((u) => ({
                              ...u,
                              showKitLink: true,
                          })),
                  },
              ]
            : [],
        [ui.showEnding]
    );

    // Take knife
    const takeKnife = (e) => {
        const { clientX, clientY } = e;
        setKnifePos({ x: clientX, y: clientY });
        if (!isMobile || !isTouchScreen) {
            setKnifeCursorEnabled(true);
        }
        // Hide the knife
        setUI((u) => ({ ...u, showKnifeImg: false, showKnifeContent: false }));

        setTimeout(() => {
            // Transition to onion stage
            setUI((u) => ({
                ...u,
                showKnifeContainer: false,
                showOnionContainer: true,
            }));
        }, 600);
    };

    // Detect when Onion is fully chopped
    useEffect(() => {
        if (onionIndex === ONION_STAGES.length - 1) {
            setUI((u) => ({ ...u, showEnding: true }));
        }
    }, [onionIndex]);

    // Track cursor
    useEffect(() => {
        if (!knifeCursorEnabled) return;

        const onMove = (e) => {
            targetRef.current = { x: e.clientX, y: e.clientY };
            if (!rafRef.current)
                rafRef.current = requestAnimationFrame(() => {
                    setKnifePos(targetRef.current);
                    rafRef.current = null;
                });
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        return () => {
            window.removeEventListener("pointermove", onMove);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [knifeCursorEnabled]);

    // Click handler for onion chopping
    const handleChop = () => {
        if (ui.showEnding || !ui.showOnionImg) return;

        setOnionIndex((i) => Math.min(i + 1, ONION_STAGES.length - 1));
        setBottleIndex((i) => Math.min(i + 1, BOTTLE_STAGES.length - 1));
        playRandomChop(lastPlayedRef);
    };

    return (
        <div
            id="KnifePage"
            className={
                "typewriter " + (knifeCursorEnabled ? "cursor-none" : "")
            }
        >
            {ui.showIntro && (
                <div
                    className={`knife-intro-container ${
                        ui.introFade ? "hide" : "show"
                    }`}
                >
                    <span className={`${ui.introLine1 ? "show" : "hide"}`}>
                        The ritual demands a sacrifice
                    </span>
                    <span className={`red ${ui.introLine2 ? "show" : "hide"}`}>
                        Offer what flows within
                    </span>
                </div>
            )}

            {ui.showKnifeContainer && (
                <div className="take-knife-container">
                    <span className={ui.showKnifeContent ? "show" : "hide"}>
                        Take the knife
                    </span>
                    <div className="take-knife-img">
                        <button
                            type="button"
                            onClick={takeKnife}
                            style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                margin: 0,
                            }}
                        >
                            <img
                                draggable={false}
                                src="/images/kit/full/knife.png"
                                alt="Knife"
                                className={`knife-img ${
                                    ui.showKnifeImg ? "show" : "hide"
                                }`}
                            />
                        </button>
                    </div>
                </div>
            )}

            {ui.showOnionContainer && (
                <div className="onion-container">
                    <span
                        className={`${ui.showFearMessage ? "show" : "hide"}`}
                        style={{
                            // Gets it out of the way
                            display: ui.showCutMessage ? "none" : "initial",
                        }}
                    >
                        Don't be afraid.
                    </span>
                    <span className={`${ui.showCutMessage ? "show" : "hide"}`}>
                        {isTouchScreen && "Tap to "} Cut the Onion.
                    </span>
                    <img
                        draggable={false}
                        src={ONION_STAGES[onionIndex]}
                        alt="Onion"
                        className={`onion-img ${
                            ui.showOnionImg ? "show" : "hide"
                        }`}
                        onClick={handleChop}
                    />
                </div>
            )}

            {ui.showBottleContainer && (
                <div
                    className={`bottle-container ${
                        ui.centerBottle ? "center" : ""
                    }`}
                >
                    <span
                        className={`${ui.showBottleMessage ? "show" : "hide"}`}
                    >
                        The offering is complete
                    </span>
                    <img
                        className={`${ui.showBottleImg ? "show" : "hide"}`}
                        draggable={false}
                        src={BOTTLE_STAGES[bottleIndex]}
                        alt="Bottle"
                    />
                    <span
                        className={`${ui.showKitLink ? "show" : "hide"}`}
                        style={{
                            fontSize: "26px",
                        }}
                    >
                        <LinkButton to="/kit">Return to Kit</LinkButton>
                    </span>
                </div>
            )}

            {knifeCursorEnabled && (
                <img
                    draggable={false}
                    src="/images/kit/full/knife.png"
                    alt=""
                    className="knife-cursor show"
                    style={{
                        position: "fixed",
                        left: `${knifePos.x + 100}px`,
                        top: `${knifePos.y - 100}px`,
                    }}
                />
            )}
        </div>
    );
}

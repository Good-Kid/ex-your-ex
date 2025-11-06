import { useEffect, useState } from "react";
import { useAnimate } from "motion/react";
import { Howl } from "howler";
import { useGameState } from "../context/GameStateContext";
import LinkButton from "../components/LinkButton";

const TAPE_SRCS = [
    "/images/cassette/tape/unwound1.png",
    "/images/cassette/tape/unwound2.png",
    "/images/cassette/tape/unwound3.png",
    "/images/cassette/tape/unwound4.png",
    "/images/cassette/tape/unwound5.png",
];

const playCrankSound = () => {
    const randomRate = Math.random() * 0.3 + 0.85; // Rate between 0.85 and 1.15
    const sound = new Howl({
        src: ["/sounds/crank.wav"],
        rate: randomRate,
    });
    sound.play();
};

export default function CassettePage() {
    const { gameState, updateGameState } = useGameState();

    // ----- Detect Mobile -----
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

    // ----- State -----
    const [tapeSrc, setTapeSrc] = useState(TAPE_SRCS[0]);
    const [tapeFixed, setTapeFixed] = useState(
        () => gameState.flags.cassetteCompleted
    );
    const [tapeHoverable, setTapeHoverable] = useState(true);
    const [showLaylo, setShowLaylo] = useState(false);

    // ----- Animations -----
    const [scope, animate] = useAnimate();
    const DEFAULT_DURATION = 0.75;

    // Intro animation
    useEffect(() => {
        const introAnimation = async () => {
            // Preload only the first tape image
            await new Promise((resolve) => {
                const img = new window.Image();
                img.src = TAPE_SRCS[0];
                img.onload = () => resolve();
                img.onerror = () => resolve();
            });
            // Preload the rest in the background
            TAPE_SRCS.slice(1).forEach((src) => {
                const img = new window.Image();
                img.src = src;
            });
            animate(".repair-container", {
                display: "flex",
            });
            await new Promise((resolve) => setTimeout(resolve, 500));
            await animate(".repair-container", {
                opacity: 1,
                pointerEvents: "auto",
            });
        };

        const tapePlayerAnimation = async () => {
            animate(".song-preview-container", {
                display: "flex",
            });
            setShowLaylo(true);
            await new Promise((resolve) => setTimeout(resolve, 500));
            await animate(
                ".song-preview-container",
                {
                    opacity: 1,
                },
                { duration: DEFAULT_DURATION }
            );
        };

        if (!tapeFixed) introAnimation();
        if (tapeFixed) {
            if (!gameState.flags.cassetteCompleted) {
                updateGameState({ cassetteCompleted: true });
            }
            tapePlayerAnimation();
        }
    }, [animate, tapeFixed, updateGameState]);

    // ----- Click Handlers -----

    const handleClickCasette = () => {
        const fadeOutRepairFrame = async () => {
            await animate(
                ".repair-container",
                {
                    opacity: 0,
                },
                { duration: DEFAULT_DURATION }
            );
            animate(
                ".repair-container",
                {
                    display: "none",
                },
                { duration: 0 }
            );
            setTapeFixed(true);
        };

        if (tapeFixed) return;
        const currentIndex = TAPE_SRCS.indexOf(tapeSrc);
        if (currentIndex < TAPE_SRCS.length - 1) {
            setTapeSrc(TAPE_SRCS[currentIndex + 1]);
            playCrankSound();
        }
        // Detect end of repair frames
        if (currentIndex === TAPE_SRCS.length - 2) {
            setTapeHoverable(false);
            fadeOutRepairFrame();
            return;
        }
    };

    // ---- Render ----
    return (
        <div id="CassettePage" className={"typewriter"} ref={scope}>
            <div
                className={`repair-container ${
                    tapeHoverable ? "hoverable" : ""
                }`}
                style={{
                    display: "none",
                    pointerEvents: "none",
                    opacity: 0,
                }}
            >
                <span>{isMobile ? "Tap" : "Click"} to fix the Cassette</span>
                <img
                    draggable={false}
                    className={`tape-img`}
                    src={tapeSrc}
                    alt=""
                    onClick={handleClickCasette}
                />
            </div>
            <div
                className={`song-preview-container `}
                style={{
                    display: "none",
                    opacity: 0,
                }}
            >
                <iframe
                    className="youtube"
                    width="100%"
                    height="auto"
                    src="https://www.youtube.com/embed/RFuXdBOXtHI?si=sZzmJsqha_A_AUuZ"
                    title="YouTube video player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen
                ></iframe>
                <div className="laylo-container">
                    {showLaylo && (
                        <iframe
                            id="laylo-drop-f1a526de-0264-47bc-a2b2-257e19be0c67"
                            frameborder="0"
                            scrolling="no"
                            allow="web-share"
                            allowtransparency="true"
                            style={{
                                zIndex: 99999,
                                width: "100%",
                                backgroundColor: "black",
                            }}
                            src="https://embed.laylo.com?dropId=f1a526de-0264-47bc-a2b2-257e19be0c67&color=ffffff&minimal=false&theme=dark&background=translucent&customTitle=PRESAVE%20%22RIFT%22"
                        ></iframe>
                    )}
                </div>
                <LinkButton to="/kit">Back to Kit</LinkButton>
            </div>
        </div>
    );
}

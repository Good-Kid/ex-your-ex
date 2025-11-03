import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAnimate } from "motion/react";
import { Howl } from "howler";
import { useGameState } from "../context/GameStateContext";

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

    // ----- State -----
    const [tapeSrc, setTapeSrc] = useState(TAPE_SRCS[0]);

    // Shake animation state
    const [shake, setShake] = useState(false);

    // ----- Pencil Cursor -----
    const [pencilCursorEnabled, setPencilCursorEnabled] = useState(false);
    const [pencilPos, setPencilPos] = useState({ x: 0, y: 0 });
    const rafRef = useRef(null);
    const targetRef = useRef({ x: 0, y: 0 });

    // ----- Animations -----
    const [scope, animate] = useAnimate();
    const DEFAULT_DURATION = 0.75;

    // Track pointer for pencil cursor
    useEffect(() => {
        const onAnyPointerMove = (e) => {
            if (e && typeof e.clientX === "number") {
                targetRef.current = { x: e.clientX, y: e.clientY };
                if (pencilCursorEnabled) {
                    if (!rafRef.current) {
                        rafRef.current = requestAnimationFrame(() => {
                            setPencilPos(targetRef.current);
                            rafRef.current = null;
                        });
                    }
                }
            }
        };
        window.addEventListener("pointermove", onAnyPointerMove, {
            passive: true,
        });
        return () =>
            window.removeEventListener("pointermove", onAnyPointerMove);
    }, [pencilCursorEnabled]);

    // Intro animation
    useEffect(() => {
        const introAnimation = async () => {};
        introAnimation();
    }, [animate]);

    // ----- Click Handlers -----
    const handleTakePencil = (e) => {
        if (pencilCursorEnabled) {
            setPencilCursorEnabled(false);
            return;
        }
        const x = e?.clientX ?? window.innerWidth / 2;
        const y = e?.clientY ?? window.innerHeight / 2;
        targetRef.current = { x, y };
        setPencilPos({ x, y });
        setPencilCursorEnabled(true);
    };

    const handleClickCasette = (e) => {
        if (!pencilCursorEnabled) {
            setShake(true);
            return;
        }
        const currentIndex = TAPE_SRCS.indexOf(tapeSrc);
        if (currentIndex < TAPE_SRCS.length - 1) {
            setTapeSrc(TAPE_SRCS[currentIndex + 1]);
            playCrankSound();
        }
    };

    // ---- Render ----
    return (
        <div
            id="CassettePage"
            className={
                "typewriter " + (pencilCursorEnabled ? "cursor-none" : "")
            }
            ref={scope}
        >
            <div className="tape-container">
                <motion.img
                    className={`tape-img ${pencilCursorEnabled && "hoverable"}`}
                    src={tapeSrc}
                    alt=""
                    onClick={handleClickCasette}
                    animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    onAnimationComplete={() => setShake(false)}
                />
                <img
                    className={`pencil-img ${
                        pencilCursorEnabled && "picked-up"
                    }`}
                    src={
                        pencilCursorEnabled
                            ? "/images/cassette/pencil_silhouette.png"
                            : "/images/cassette/pencil.png"
                    }
                    onClick={handleTakePencil}
                />
            </div>
            <div className="player-container"></div>
            {pencilCursorEnabled && (
                <img
                    draggable={false}
                    src="/images/cassette/pencil.png"
                    alt="Pencil Cursor"
                    className="pencil-cursor"
                    style={{
                        position: "fixed",
                        opacity: 1,
                        left: `${pencilPos.x + 160}px`,
                        top: `${pencilPos.y - 100}px`,
                        pointerEvents: "none",
                        zIndex: 9999,
                    }}
                />
            )}
        </div>
    );
}

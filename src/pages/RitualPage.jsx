import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGameState } from "../context/GameStateContext";
import { useAnimate } from "motion/react";
import { Howl } from "howler";
import { incrementLetGoCount, authReady } from "../firebase";
import FinalPage from "./FinalPage";

const ITEM_STEP_DIR = "images/ritual/item_step/";
const RITUAL_STEP_DIR = "images/ritual/ritual_step/";

const STAGES = [
    {
        id: "bottle",
        prompt: "Click the bottle to create the circle",
        item_steps: ["bottle1.webp", "bottle2.webp"],
        ritual_steps: ["empty.webp", "justthecircle.gif"],
        sounds: ["clink.mp3"],
    },
    {
        id: "candles",
        prompt: "Click to place the candles",
        item_steps: [
            "candleitem5.webp",
            "candleitem4.webp",
            "candleitem3.webp",
            "candleitem2.webp",
            "candleitem1.webp",
            "empty.webp",
        ],
        ritual_steps: [
            "justthecircle.gif",
            "1candleadded.gif",
            "2candlesadded.gif",
            "3candlesadded.gif",
            "4candlesadded.gif",
            "5candlesadded.gif",
        ],
        sounds: [
            "put_down/put_down1.mp3",
            "put_down/put_down2.mp3",
            "put_down/put_down3.mp3",
            "put_down/put_down4.mp3",
            "put_down/put_down5.mp3",
            "put_down/put_down6.mp3",
        ],
    },
    {
        id: "cassette",
        prompt: "Click to place the Cassette Player ",
        item_steps: ["cassette_player.webp", "empty.webp"],
        ritual_steps: ["5candlesadded.gif", "allcandlesandwalkman.gif"],
        sounds: ["put_down/put_down6.mp3"],
    },
    {
        id: "lighter",
        prompt: "Click to light the candles",
        item_steps: ["lighter.webp"],
        ritual_steps: [
            "allcandlesandwalkman.gif",
            "1candlelit.gif",
            "2candleslit.gif",
            "3candleslit.gif",
            "4candleslit.gif",
            "5candleslit.gif",
        ],
        sounds: [
            "lighter/lighter1.mp3",
            "lighter/lighter2.mp3",
            "lighter/lighter3.mp3",
            "lighter/lighter4.mp3",
        ],
    },
];

const preloadImage = (src) =>
    !src
        ? Promise.resolve()
        : new Promise((resolve) => {
              const img = new Image();
              img.onload = () => {
                  if (img.decode) img.decode().then(resolve).catch(resolve);
                  else resolve();
              };
              img.onerror = resolve;
              img.src = src;
          });

const preloadStage = (stage) => {
    const items = (stage.item_steps || []).map((n) =>
        n ? ITEM_STEP_DIR + n : ""
    );
    const rituals = (stage.ritual_steps || []).map((n) =>
        n ? RITUAL_STEP_DIR + n : ""
    );
    const all = [...items, ...rituals].filter(Boolean);
    return Promise.all(all.map(preloadImage));
};

export default function RitualPage() {
    const { gameState, updateGameState } = useGameState();
    const navigate = useNavigate();

    // redirect if not all required flags are completed
    useEffect(() => {
        if (
            !(
                gameState.flags.quizCompleted &&
                gameState.flags.cassetteCompleted &&
                gameState.flags.tarotCompleted &&
                gameState.flags.bottleCompleted
            )
        ) {
            navigate("/kit", { replace: true });
        }
    }, [gameState, navigate]);

    // Finale BGM
    const bgm = useRef(null);
    useEffect(() => {
        bgm.current = new Howl({
            src: ["/sounds/soulpitonhold.mp3"],
            loop: true,
            volume: 0.6,
        });
        return () => {
            try {
                bgm.current?.stop();
            } catch {}
        };
    }, []);

    const [stageIndex, setStageIndex] = useState(0);
    const [itemIndex, setItemIndex] = useState(0);
    const [ritualIndex, setRitualIndex] = useState(0);

    const [isBusy, setIsBusy] = useState(false);
    const [playIntro, setPlayIntro] = useState(true);
    const [playFinale, setPlayFinale] = useState(false);
    const [finaleText, setFinaleText] = useState("");
    const [hasLetGo, setHasLetGo] = useState(false);
    const [finalVisible, setFinalVisible] = useState(false); // <- fixed typo

    const [scope, animate] = useAnimate();

    const soundMapRef = useRef({});

    useEffect(() => {
        const seen = new Set();
        const allSounds = STAGES.flatMap((s) => s.sounds || []);
        allSounds.forEach((s) => {
            const src = s.startsWith("/") ? s : `/sounds/${s}`;
            if (!seen.has(src)) {
                seen.add(src);
                soundMapRef.current[src] = new Howl({
                    src: [src],
                    volume: 0.5,
                    preload: true,
                });
            }
        });
    }, []);

    // Detect Mobile
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

    const stage = STAGES[stageIndex];
    const safeItemIdx = Math.min(itemIndex, stage.item_steps.length - 1);
    const safeRitualIdx = Math.min(ritualIndex, stage.ritual_steps.length - 1);
    const itemSrc = ITEM_STEP_DIR + stage.item_steps[safeItemIdx];
    const ritualSrc = RITUAL_STEP_DIR + stage.ritual_steps[safeRitualIdx];

    const itemPrompt = isMobile
        ? stage.prompt.replace(/Click/g, "Tap")
        : stage.prompt;

    const normalizeSoundSrc = (s) => (s.startsWith("/") ? s : `/sounds/${s}`);
    const playStageSound = (stg) => {
        if (!stg || !stg.sounds) return;
        const list = Array.isArray(stg.sounds) ? stg.sounds : [stg.sounds];
        if (!list.length) return;
        const pick = list[Math.floor(Math.random() * list.length)];
        const src = normalizeSoundSrc(pick);
        const howl = soundMapRef.current[src] || new Howl({ src: [src] });
        howl.play();
    };

    const endStageWithFade = async () => {
        setIsBusy(true);
        await new Promise((r) => setTimeout(r, 200));
        await animate(
            ".item-stage",
            { opacity: 0, pointerEvents: "none" },
            { duration: 0.35 }
        );

        const nextStage = stageIndex + 1;
        if (nextStage >= STAGES.length) {
            await animate(
                ".item-stage",
                { opacity: 1, pointerEvents: "auto" },
                { duration: 0.25 }
            );
            setIsBusy(false);
            return;
        }

        const next = STAGES[nextStage];
        await preloadStage(next);

        setStageIndex(nextStage);
        setItemIndex(0);
        setRitualIndex(0);

        await new Promise((r) => requestAnimationFrame(r));
        await animate(
            ".item-stage",
            { opacity: 1, pointerEvents: "auto" },
            { duration: 0.25 }
        );
        setIsBusy(false);
    };

    const handleItemClick = async () => {
        if (isBusy || playIntro) return;

        playStageSound(stage);
        setIsBusy(true);

        const lastRitual = stage.ritual_steps.length - 1;
        const nextItem = Math.min(itemIndex + 1, stage.item_steps.length - 1);
        const nextRitual = Math.min(ritualIndex + 1, lastRitual);

        if (stage.id === "bottle" && nextRitual === lastRitual) {
            if (nextItem !== itemIndex) {
                const nextItemSrc = ITEM_STEP_DIR + stage.item_steps[nextItem];
                await preloadImage(nextItemSrc);
                setItemIndex(nextItem);
            }

            const circleSrc = RITUAL_STEP_DIR + stage.ritual_steps[nextRitual];
            await preloadImage(circleSrc);

            await animate(".ritual-stage img", { opacity: 0 }, { duration: 0 });
            setRitualIndex(nextRitual);
            await new Promise((r) => requestAnimationFrame(r));
            await animate(
                ".ritual-stage img",
                { opacity: 1 },
                { duration: 0.45 }
            );

            await endStageWithFade();
            return;
        }

        if (nextItem !== itemIndex) {
            const nextItemSrc = ITEM_STEP_DIR + stage.item_steps[nextItem];
            await preloadImage(nextItemSrc);
            setItemIndex(nextItem);
        }

        if (nextRitual !== ritualIndex) {
            const nextRitualSrc =
                RITUAL_STEP_DIR + stage.ritual_steps[nextRitual];
            await preloadImage(nextRitualSrc);
            setRitualIndex(nextRitual);
        }

        if (nextRitual === lastRitual) {
            const isFinalStage = stageIndex === STAGES.length - 1;
            if (isFinalStage) {
                await new Promise((r) => requestAnimationFrame(r));
                await new Promise((r) => setTimeout(r, 120));
                await finaleAnimation();
                return;
            } else {
                await endStageWithFade();
                return;
            }
        }

        setIsBusy(false);
    };

    // === FIXED: proceed even if counter fails ===
    const handleLettingGo = async () => {
        if (hasLetGo) return;
        setHasLetGo(true);

        let order = null;
        try {
            if (gameState.flags.soulReleased == null) {
                // new incrementLetGoCount returns a number (or throws)
                await authReady;
                const value = await incrementLetGoCount();
                if (Number.isFinite(value)) order = value;
            }
        } catch (err) {
            console.warn(
                "[Ritual] incrementLetGoCount failed; continuing anyway:",
                err
            );
            // swallow error and continue the ritual
        } finally {
            // Always mark ritual complete; include soulReleased only if we have a value
            const patch = { ritualCompleted: true };
            if (order != null) patch.soulReleased = order;
            updateGameState(patch);
        }

        // Continue the finale regardless of counter result
        await animate(".finale-buttons", { opacity: 0 }, { duration: 1 });

        try {
            animate(".ghost img", { transform: "scale(0.2)" }, { duration: 3 });
            await new Promise((resolve) => setTimeout(resolve, 300));
            await animate(
                ".ghost",
                { bottom: 600, opacity: 0 },
                { duration: 3 }
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
            await animate(".vortex", { opacity: 0 }, { duration: 2 });
        } catch {}

        setFinalVisible(true);
    };

    // Intro / Finale animations
    const introAnimation = async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await animate(
            ".ritual-intro-container .line1",
            { opacity: 1 },
            { duration: 1 }
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        await animate(
            ".ritual-intro-container .line2",
            { opacity: 1 },
            { duration: 1 }
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        await animate(
            ".ritual-intro-container .line3",
            { opacity: 1 },
            { duration: 1 }
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await animate(
            ".ritual-intro-container",
            { opacity: 0 },
            { duration: 1 }
        );

        await preloadStage(STAGES[0]); // ensure bottle stage is ready

        setPlayIntro(false);

        await new Promise((resolve) => {
            const check = () => {
                const el = document.querySelector(".item-stage");
                if (el) resolve();
                else requestAnimationFrame(check);
            };
            check();
        });
        await animate(".item-stage", { opacity: 1 }, { duration: 1 });
    };

    const finaleAnimation = async () => {
        const showText = async (text) => {
            const avgReadingSpeed = 150;
            const words = text.split(/\s+/).length;
            const ms = Math.max(
                1200,
                Math.round((words / avgReadingSpeed) * 60000)
            );
            setFinaleText(text);
            await animate(
                ".finale-text-stage",
                { opacity: 1 },
                { duration: 0.8 }
            );
            await new Promise((resolve) => setTimeout(resolve, ms));
            await animate(
                ".finale-text-stage",
                { opacity: 0 },
                { duration: 0.8 }
            );
        };

        animate(".item-stage", { opacity: 0 }, { duration: 0.8 });
        await animate(
            ".ritual-complete-stage",
            { opacity: 1 },
            { duration: 0.8 }
        );
        animate(".ritual-stage", { opacity: 0 }, { duration: 0 });
        setPlayFinale(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await showText("Pain leaves the body, but not the room.");
        new Howl({ src: ["/sounds/eject.mp3"], volume: 0.5 }).play();
        await new Promise((resolve) => setTimeout(resolve, 100));
        try {
            bgm.current?.play();
        } catch {}
        await new Promise((resolve) => setTimeout(resolve, 500));
        await animate(".ghost", { opacity: 1 }, { duration: 1.2 });
        await showText("This spirit is a culmination of your sadness.");
        await showText("A culmination of those empty feelings in your heart.");
        await showText("Doesn't it feel better to be free?");
        await showText("All that's left to do is let go");
        await animate(
            ".ritual-complete-stage",
            { opacity: 0 },
            { duration: 1.2 }
        );
        await animate(".vortex", { opacity: 1 }, { duration: 1.2 });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await animate(
            ".finale-buttons",
            { display: "flex", opacity: 1 },
            { duration: 1.2 }
        );
        setIsBusy(false);
    };

    useEffect(() => {
        if (playIntro) introAnimation();
    }, [playIntro]);

    // click/tap guard
    const clickGuardRef = useRef(false);
    const lastTapRef = useRef(0);
    const activatorRef = useRef(null);

    const handleActivate = async (e) => {
        if (e?.nativeEvent?.pointerType && e?.nativeEvent?.isPrimary === false)
            return;
        if (isBusy || playIntro) return;
        const now = Date.now();
        if (now - lastTapRef.current < 100) return;
        lastTapRef.current = now;
        if (clickGuardRef.current) return;
        clickGuardRef.current = true;
        if (activatorRef.current)
            activatorRef.current.style.pointerEvents = "none";
        try {
            await handleItemClick();
        } finally {
            clickGuardRef.current = false;
            if (activatorRef.current)
                activatorRef.current.style.pointerEvents = "auto";
        }
    };

    return (
        <>
            {!finalVisible ? (
                <div
                    id="RitualPage"
                    ref={scope}
                    style={{ position: "relative" }}
                >
                    {playIntro ? (
                        <div className="ritual-intro-container typewriter">
                            <span className="line1">The time has come.</span>
                            <span className="line2">Perform the ritual.</span>
                            <span className="line3">
                                Free yourself of your pain.
                            </span>
                        </div>
                    ) : (
                        <>
                            {!playFinale ? (
                                <div className="item-stage">
                                    <div className="prompt typewriter">
                                        {itemPrompt}
                                    </div>
                                    <img
                                        ref={activatorRef}
                                        draggable={false}
                                        className={
                                            !isBusy && !isMobile
                                                ? "hoverable ritual-activator"
                                                : "ritual-activator"
                                        }
                                        onPointerUp={handleActivate}
                                        src={itemSrc}
                                        alt=""
                                        style={{
                                            pointerEvents: isBusy
                                                ? "none"
                                                : "auto",
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="finale-text-stage">
                                    <div className="prompt typewriter">
                                        {finaleText}
                                    </div>
                                </div>
                            )}

                            <div className="ritual-complete-stage">
                                <img
                                    draggable={false}
                                    src={`${RITUAL_STEP_DIR}ritualcomplete.gif`}
                                    alt="Ritual Circle"
                                />
                            </div>

                            <div className="ritual-stage">
                                <img
                                    draggable={false}
                                    src={ritualSrc}
                                    alt="Ritual Circle"
                                />
                            </div>

                            <div className="vortex">
                                <img src="/images/ritual/vortex.gif" alt="" />
                            </div>

                            <div className="ghost">
                                <img src="/images/ritual/ghost.gif" alt="" />
                                <div className="finale-buttons">
                                    <button onClick={handleLettingGo}>
                                        Let go
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <FinalPage />
            )}
        </>
    );
}

import { Helmet } from "react-helmet-async";
import React, { useRef, useEffect, useMemo, useState } from "react";
import { Howl } from "howler";
import TarotModal from "../components/TarotPage/TarotModal";
import WaveText from "../components/WaveText";
import { getCardInfo, tarotCards } from "../data/tarotCards"; // <-- UPDATED
import { useGameState } from "../context/GameStateContext";
import LinkButton from "../components/LinkButton";
// eslint-disable-next-line no-unused-vars
import { motion, useAnimate } from "motion/react";
import { log } from "../firebase";

// ----- Constants -----
const SLOT_COUNT = 3;
const CARD_COUNT = 5;
const CARD_BACK_IMAGE = "/images/tarot/back.webp"; // back image
const MOBILE_TRIGGER_WIDTH = 700;
const DEFAULT_CARD_HEIGHT = 250;
const MOBILE_CARD_HEIGHT = 160;
const CARD_RATIO = 11 / 19;
const CARD_FLIP_DURATION = 0.14; // seconds
const CARD_FLIP_DELAY = 0.5; // seconds between flips
const CARD_BORDER_RADIUS = 6;
const SLOT_TITLES = ["PAST", "PRESENT", "FUTURE"];

const HAS_HOVER =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(hover: hover)").matches;

// ----- Helpers -----
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const shuffleTake = (arr, n) => {
    if (!arr?.length) return Array(n).fill(null);
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
};

const pickFortunes = (ids) => {
    return ids.map((id, i) => {
        const info = getCardInfo(id);
        const pools = info?.fortunes || {};
        const group = i === 0 ? "past" : i === 1 ? "present" : "future";
        const options = pools[group] || [""];
        return options[Math.floor(Math.random() * options.length)] || "";
    });
};

// Compute fan positions for the current visible set
function computeFanTransforms({ visibleCount, cardWidth, mobile }) {
    if (!visibleCount) return [];
    const spreadDeg = 60;
    const baseAngle = -spreadDeg / 2;
    const angleStep = visibleCount > 1 ? spreadDeg / (visibleCount - 1) : 0;
    const center = (visibleCount - 1) / 2;
    const arcHeight = 60;
    const overlap = mobile ? 40 : 80;
    const spacing = cardWidth - overlap;
    const startX = -center * spacing;

    return Array.from({ length: visibleCount }).map((_, pos) => {
        const angle = baseAngle + angleStep * pos;
        const offset = pos - center;
        const y =
            -30 - arcHeight * (1 - Math.pow(offset / Math.max(center, 1), 2));
        const x = startX + spacing * pos;
        return { x, y, rotate: angle, origY: y };
    });
}

// ---- Small helper to safely get image sources w/ fallbacks ----
function getImagesForId(id) {
    const info = getCardInfo(id);
    const loadingImage = info?.image?.loadingImage;
    const fullSrc = info?.image?.src;
    return { loadingImage, fullSrc, name: info?.name || "Tarot Card" };
}

// ----- Component -----
export default function TarotPage() {
    // ----- Context -----
    const { gameState, updateGameState } = useGameState();

    // ----- Layout / Responsive -----
    const initialCardHeight = () =>
        typeof window !== "undefined" &&
        window.innerWidth < MOBILE_TRIGGER_WIDTH
            ? MOBILE_CARD_HEIGHT
            : DEFAULT_CARD_HEIGHT;

    const [cardHeight, setCardHeight] = useState(initialCardHeight);
    const cardWidth = Math.round(cardHeight * CARD_RATIO);

    const isMobile =
        typeof window !== "undefined"
            ? window.innerWidth < MOBILE_TRIGGER_WIDTH
            : false;

    useEffect(() => {
        const handleResize = () => {
            setCardHeight(
                window.innerWidth < MOBILE_TRIGGER_WIDTH
                    ? MOBILE_CARD_HEIGHT
                    : DEFAULT_CARD_HEIGHT
            );
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ----- UI State -----
    const [playTarotIntro, setPlayTarotIntro] = useState(
        () => !gameState.flags.tarotIntroPlayed
    );

    const [selectedCards, setSelectedCards] = useState([]); // indices from fan
    const [removedCards, setRemovedCards] = useState([]); // removed from fan

    // store selected "faces" as card IDs now
    const [revealedFaces, setRevealedFaces] = useState(
        Array(SLOT_COUNT).fill(null) // ids
    );

    // loading state for each revealed face (id -> boolean)
    const [loadedMap, setLoadedMap] = useState({}); // { [id]: true }

    const [fortuneParts, setFortuneParts] = useState([
        "line1",
        "line2",
        "line3",
    ]);
    const [isInitialAnimating, setIsInitialAnimating] = useState(true);
    const [isRevealing, setIsRevealing] = useState(false);
    const [hasRevealed, setHasRevealed] = useState(false);

    // fan visibility (instead of display:none)
    const [fanHidden, setFanHidden] = useState(playTarotIntro);

    // ----- Refs -----
    const cardsRef = useRef([]); // fan card elements (motion.img refs if needed)
    const fanWrapRef = useRef(null); // fan container
    const slotOuterRefs = useRef([]); // flip wrapper
    const slotTiltRefs = useRef([]); // hover tilt inner

    // ----- Modal -----
    const [modalCard, setModalCard] = useState(null); // will hold the card id

    // ----- Animations -----
    const [scope, animate] = useAnimate();
    const DEFAULT_DURATION = 0.6;

    useEffect(() => {
        const revealCardsAnimation = async () => {
            animate(".learn-more", {
                opacity: 0.45,
            });
            await animate(".tarot-buttons", {
                opacity: 1,
                pointerEvents: "auto",
            });
        };
        if (hasRevealed) revealCardsAnimation();
    }, [hasRevealed, animate]);

    useEffect(() => {
        const tarotIntroAnimation = async () => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await animate(
                ".tarot-intro-container .line1",
                { opacity: 1 },
                { duration: 1 }
            );
            await new Promise((resolve) => setTimeout(resolve, 500));
            await animate(
                ".tarot-intro-container .line2",
                { opacity: 1 },
                { duration: 1 }
            );
            await new Promise((resolve) => setTimeout(resolve, 500));
            await animate(
                ".tarot-intro-container .line3",
                { opacity: 1 },
                { duration: 1 }
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await animate(scope.current, { opacity: 0 }, { duration: 1 });
            setPlayTarotIntro(false);
            updateGameState({ tarotIntroPlayed: true });
            await animate(scope.current, { opacity: 1 }, { duration: 1 });
            setFanHidden(false);
        };
        if (playTarotIntro) tarotIntroAnimation();
    }, [playTarotIntro, animate, updateGameState, scope]);

    // ----- Sound -----
    const flipSoundRef = useRef(
        new Howl({ src: ["/sounds/flip.ogg"], volume: 0.8 })
    );

    // ----- Data -----
    // use ids instead of image paths now
    const tarotIds = useMemo(() => Object.keys(tarotCards), []);

    // ----- Fan transforms cache -----
    const visibleIdx = useMemo(
        () =>
            Array.from({ length: CARD_COUNT }, (_, i) => i).filter(
                (i) => !removedCards.includes(i)
            ),
        [removedCards]
    );

    const fanTransforms = useMemo(() => {
        const t = computeFanTransforms({
            visibleCount: visibleIdx.length,
            cardWidth,
            mobile: isMobile,
        });
        return t; // array aligned to visibleIdx order
    }, [visibleIdx.length, cardWidth, isMobile]);

    // After first paint of the fan, mark initial anim as done
    useEffect(() => {
        if (visibleIdx.length) {
            const id = setTimeout(() => setIsInitialAnimating(false), 600);
            return () => clearTimeout(id);
        }
    }, [visibleIdx.length]);

    // ----- Interactions -----
    const handleCardClick = (idx) => {
        if (
            isInitialAnimating ||
            selectedCards.length >= SLOT_COUNT ||
            selectedCards.includes(idx) ||
            removedCards.includes(idx) ||
            playTarotIntro
        )
            return;

        setSelectedCards((prev) => [...prev, idx]);

        // Soft-remove after a short delay to let Motion animate out
        const removeDelay = 350;
        setTimeout(() => {
            setRemovedCards((prev) => [...prev, idx]);
        }, removeDelay);
    };

    // Slot hover tilt (disabled on touch by HAS_HOVER)
    const handleSlotHoverMove = (e, idx) => {
        if (
            !HAS_HOVER ||
            !hasRevealed ||
            isRevealing ||
            window.innerWidth < MOBILE_TRIGGER_WIDTH
        )
            return;
        const el = slotTiltRefs.current[idx];
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const nx = clamp((e.clientX - cx) / (rect.width / 2), -1, 1);
        const ny = clamp((e.clientY - cy) / (rect.height / 2), -1, 1);
        const MAX_TILT_X = 6;
        const MAX_TILT_Y = 5;
        const SHIFT = 2;
        el.style.transform = `translate3d(${-nx * SHIFT}px, ${
            -ny * SHIFT
        }px, 0) rotateX(${-ny * MAX_TILT_X}deg) rotateY(${
            -nx * MAX_TILT_Y
        }deg)`;
    };

    const handleSlotHoverLeave = (idx) => {
        const el = slotTiltRefs.current[idx];
        if (!el || window.innerWidth < MOBILE_TRIGGER_WIDTH) return;
        el.style.transform = `translate3d(0,0,0) rotateX(0deg) rotateY(0deg)`;
    };

    // ----- Reveal Sequence -----
    useEffect(() => {
        if (hasRevealed || selectedCards.length !== SLOT_COUNT) return;

        // Pick faces (ids) + fortunes
        const slotIds = shuffleTake(tarotIds, SLOT_COUNT);
        const fortunes = pickFortunes(slotIds);

        // Preload full images; show loading until they load
        slotIds.forEach((id) => {
            if (!id) return;
            const { fullSrc } = getImagesForId(id);
            const img = new Image();
            img.onload = () =>
                setLoadedMap((prev) =>
                    prev[id] ? prev : { ...prev, [id]: true }
                );
            img.onerror = () =>
                setLoadedMap((prev) =>
                    prev[id] ? prev : { ...prev, [id]: false }
                );
            img.src = fullSrc;
        });

        setRevealedFaces(slotIds);
        setFortuneParts(fortunes);

        // Use a ref to hold the slotIds for update after animation
        const slotIdsRef = { current: slotIds };

        const doReveal = async () => {
            setIsRevealing(true);

            // 1) Slide/fade fan out
            if (fanWrapRef.current) {
                await animate(
                    fanWrapRef.current,
                    { y: 400, opacity: 0 },
                    { duration: 0.6 }
                );
                setFanHidden(true);
            }

            // 2) Flip each slot sequentially and reveal fortune lines
            for (let s = 0; s < SLOT_COUNT; s++) {
                const outer = slotOuterRefs.current[s];
                if (!outer) continue;

                await animate(
                    outer,
                    { rotateY: 180 },
                    { duration: CARD_FLIP_DURATION, easing: "easeInOut" }
                );

                // sound + line reveal
                flipSoundRef.current.play();
                animate(
                    `.tarot-card-slots .slot-title.slot${s}`,
                    { opacity: 1 },
                    { duration: 0.5 }
                );
                await animate(
                    `.fortune-parts-container .line${s + 1}`,
                    { opacity: 1 },
                    { duration: 0.5 }
                );

                // gap before next flip
                await new Promise((r) => setTimeout(r, CARD_FLIP_DELAY * 1000));
            }

            // Only update gameState after animation, using the ref
            updateGameState({
                tarotCompleted: true,
                tarotLastDrawnCards: slotIdsRef.current,
                tarotCompletedCount:
                    (gameState.flags.tarotCompletedCount || 0) + 1,
            });
            setHasRevealed(true);
            setIsRevealing(false);
        };

        doReveal();
    }, [selectedCards, hasRevealed, tarotIds, animate, updateGameState]);

    // Log a 'tarot_draw' event with card IDs and device type every time a tarot reading is completed.
    useEffect(() => {
        if (!hasRevealed) return;
        // Log tarot draw event with card IDs
        log("tarot_draw", {
            cards: revealedFaces.filter(Boolean),
            device: isMobile ? "mobile" : "desktop",
        });
    }, [hasRevealed]);

    // ----- Draw Again Handler -----
    const handleDrawAgain = async () => {
        let cleanupAnimSignals = [
            animate(
                ".tarot-card-slots img",
                { opacity: 0 },
                { duration: DEFAULT_DURATION }
            ).finished,
            animate(".learn-more", {
                opacity: 0,
            }).finished,
            animate(
                ".tarot-buttons",
                { opacity: 0, pointerEvents: "none" },
                { duration: DEFAULT_DURATION }
            ).finished,
        ];

        for (let i = 0; i < SLOT_COUNT; i++) {
            cleanupAnimSignals.push(
                animate(
                    `.fortune-parts-container .line${i + 1}`,
                    { opacity: 0 },
                    { duration: DEFAULT_DURATION }
                ).finished
            );
            cleanupAnimSignals.push(
                animate(
                    `.slot-title.slot${i}`,
                    { opacity: 0 },
                    { duration: DEFAULT_DURATION }
                ).finished
            );
        }

        await Promise.allSettled(cleanupAnimSignals);

        // Reset state
        setIsInitialAnimating(true);
        setSelectedCards([]);
        setRemovedCards([]);
        setRevealedFaces(Array(SLOT_COUNT).fill(null));
        setFortuneParts(["", "", ""]);
        setHasRevealed(false);
        setIsRevealing(false);
        setModalCard(null);
        setFanHidden(false);
        setLoadedMap({});

        requestAnimationFrame(() => {
            animate(".tarot-card-slots img", { opacity: 1 }, { duration: 0 });
        });
    };

    // ----- Render -----
    return (
        <>
            <Helmet>
                <title>Exorcise Your Ex - Tarot Reading</title>
                <meta
                    name="description"
                    content="Have your Tarot Read - Good Kid Band inspired Tarot Cards"
                />
            </Helmet>
            <div id="TarotPage" ref={scope}>
                {playTarotIntro ? (
                    <div className="tarot-intro-container typewriter">
                        <span style={{ opacity: 0 }} className="line1">
                            Hold an uncertainty in your mind
                        </span>
                        <span style={{ opacity: 0 }} className="line2">
                            Choose 3 cards
                        </span>
                        <span style={{ opacity: 0 }} className="line3">
                            The answer will be made clear
                        </span>
                    </div>
                ) : (
                    <div>
                        <div className="tarot-card-slots">
                            {Array.from({ length: SLOT_COUNT }).map((_, i) => {
                                const id = revealedFaces[i];
                                const info = id ? getCardInfo(id) : null;
                                const { loadingImage, fullSrc, name } = id
                                    ? getImagesForId(id)
                                    : {
                                          loadingImage: null,
                                          fullSrc: null,
                                          name: "Tarot Card",
                                      };

                                // choose which front img to show (loading vs full) when flipped
                                const showFull = id && loadedMap[id];

                                return (
                                    <div
                                        key={i}
                                        style={{
                                            width: `${cardWidth * 1.2}px`,
                                            height: `${cardHeight * 1.2}px`,
                                            opacity: 1,
                                        }}
                                    >
                                        {SLOT_TITLES[i] ? (
                                            <div
                                                className={`slot-title slot${i}`}
                                            >
                                                {SLOT_TITLES[i]}
                                            </div>
                                        ) : undefined}
                                        {selectedCards[i] !== undefined && (
                                            <div
                                                ref={(el) =>
                                                    (slotOuterRefs.current[i] =
                                                        el)
                                                }
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    position: "relative",
                                                    borderRadius:
                                                        CARD_BORDER_RADIUS,
                                                    transformStyle:
                                                        "preserve-3d",
                                                    cursor:
                                                        hasRevealed &&
                                                        !isRevealing
                                                            ? "pointer"
                                                            : "default",
                                                    transform:
                                                        "perspective(800px) rotateY(0deg)",
                                                    transition:
                                                        "transform 0.3s ease",
                                                    zIndex: hasRevealed ? 3 : 1,
                                                }}
                                                onMouseMove={(e) =>
                                                    handleSlotHoverMove(e, i)
                                                }
                                                onMouseLeave={() =>
                                                    handleSlotHoverLeave(i)
                                                }
                                                // Tap/Click lives on the wrapper
                                                onClick={() => {
                                                    if (
                                                        hasRevealed &&
                                                        !isRevealing &&
                                                        id
                                                    ) {
                                                        setModalCard(id); // pass id to modal
                                                    }
                                                }}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (
                                                        (e.key === "Enter" ||
                                                            e.key === " ") &&
                                                        hasRevealed &&
                                                        !isRevealing &&
                                                        id
                                                    ) {
                                                        setModalCard(id);
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                <div
                                                    ref={(el) =>
                                                        (slotTiltRefs.current[
                                                            i
                                                        ] = el)
                                                    }
                                                    style={{
                                                        position: "absolute",
                                                        inset: 0,
                                                        transformStyle:
                                                            "preserve-3d",
                                                        borderRadius:
                                                            CARD_BORDER_RADIUS,
                                                        transformOrigin:
                                                            "50% 50%",
                                                        pointerEvents:
                                                            isRevealing
                                                                ? "none"
                                                                : "auto",
                                                        backfaceVisibility:
                                                            "hidden",
                                                    }}
                                                >
                                                    {/* Back */}
                                                    <img
                                                        draggable={false}
                                                        src={CARD_BACK_IMAGE}
                                                        alt={`Back of Selected Card ${
                                                            selectedCards[i] + 1
                                                        }`}
                                                        style={{
                                                            userSelect: "none",
                                                            touchAction:
                                                                "manipulation",
                                                            position:
                                                                "absolute",
                                                            inset: 0,
                                                            width: "100%",
                                                            height: "100%",
                                                            borderRadius:
                                                                CARD_BORDER_RADIUS,
                                                            backfaceVisibility:
                                                                "hidden",
                                                            transform:
                                                                "rotateY(0deg)",
                                                            // Make the back non-interactive after reveal to avoid iOS hit-test quirks
                                                            pointerEvents:
                                                                hasRevealed
                                                                    ? "none"
                                                                    : "auto",
                                                        }}
                                                    />
                                                    {/* Front */}
                                                    <img
                                                        draggable={false}
                                                        src={
                                                            id
                                                                ? showFull
                                                                    ? fullSrc
                                                                    : loadingImage
                                                                : CARD_BACK_IMAGE
                                                        }
                                                        alt={
                                                            id
                                                                ? name
                                                                : "Tarot Card"
                                                        }
                                                        style={{
                                                            userSelect: "none",
                                                            touchAction:
                                                                "manipulation",
                                                            position:
                                                                "absolute",
                                                            inset: 0,
                                                            width: "100%",
                                                            height: "100%",
                                                            borderRadius:
                                                                CARD_BORDER_RADIUS,
                                                            backfaceVisibility:
                                                                "hidden",
                                                            transform:
                                                                "rotateY(180deg)",
                                                            cursor:
                                                                hasRevealed &&
                                                                !isRevealing
                                                                    ? "pointer"
                                                                    : "default",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div
                            className="learn-more"
                            style={{
                                opacity: 0,
                            }}
                        >
                            {isMobile ? "Tap" : "Click"} each card to learn more
                        </div>
                    </div>
                )}

                {/* Fan (Framer Motion) */}
                {!fanHidden && (
                    <motion.div
                        className="card-fan"
                        ref={fanWrapRef}
                        style={{
                            height: `${cardHeight + 120}px`,
                            pointerEvents: "auto",
                        }}
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {Array.from({ length: CARD_COUNT }).map((_, i) => {
                            if (removedCards.includes(i)) return null;

                            // Where is this card among the visible positions?
                            const vPos = visibleIdx.indexOf(i);
                            const t = fanTransforms[vPos] || {
                                x: 0,
                                y: 0,
                                rotate: 0,
                                origY: 0,
                            };
                            const xCentered = t.x - cardWidth / 2;
                            const isPicked = selectedCards.includes(i);

                            // Hover allowed?
                            const canHover =
                                HAS_HOVER &&
                                !isPicked &&
                                !isInitialAnimating &&
                                !playTarotIntro;

                            // When picked, animate out
                            const pickedAnimate = isPicked
                                ? {
                                      opacity: 0,
                                      y: t.origY - 100,
                                      scale: 1.05,
                                      transition: { duration: 0.35 },
                                  }
                                : {};

                            return (
                                <motion.img
                                    draggable={false}
                                    key={i}
                                    ref={(el) => (cardsRef.current[i] = el)}
                                    src={CARD_BACK_IMAGE}
                                    alt={`Tarot Card ${i + 1}`}
                                    data-orig-y={t.origY}
                                    initial={{
                                        x: xCentered,
                                        y: 0,
                                        rotate: 0,
                                        opacity: 0,
                                    }}
                                    animate={{
                                        x: xCentered,
                                        y: t.y,
                                        rotate: t.rotate,
                                        opacity: 1,
                                        ...pickedAnimate,
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        delay: vPos >= 0 ? 0.02 * vPos : 0,
                                        type: "tween",
                                        ease: "easeOut",
                                    }}
                                    whileHover={
                                        canHover
                                            ? {
                                                  y: t.origY - 30,
                                                  scale: 1.08,
                                                  transition: {
                                                      duration: 0.12,
                                                  },
                                              }
                                            : {}
                                    }
                                    style={{
                                        userSelect: "none",
                                        touchAction: "manipulation",
                                        width: `${Math.round(cardWidth)}px`,
                                        height: `${cardHeight}px`,
                                        position: "absolute",
                                        left: "50%",
                                        top: 0,
                                        cursor:
                                            isPicked || playTarotIntro
                                                ? "default"
                                                : "pointer",
                                        boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
                                        borderRadius: CARD_BORDER_RADIUS,
                                        background: "#222",
                                        pointerEvents: isPicked
                                            ? "none"
                                            : "auto",
                                    }}
                                    onClick={() => handleCardClick(i)}
                                />
                            );
                        })}
                    </motion.div>
                )}

                {/* Fortune */}
                <div className="fortune-parts-container typewriter">
                    <span className="line1" style={{ opacity: 0 }}>
                        <WaveText intensity="low">{fortuneParts[0]}</WaveText>
                    </span>
                    <span className="line2" style={{ opacity: 0 }}>
                        <WaveText intensity="low">{fortuneParts[1]}</WaveText>
                    </span>
                    <span className="line3" style={{ opacity: 0 }}>
                        <WaveText intensity="low">{fortuneParts[2]}</WaveText>
                    </span>
                </div>

                <div
                    className="tarot-buttons"
                    style={{ opacity: 0, pointerEvents: "none" }}
                >
                    <LinkButton style={{ justifySelf: "flex-end" }} to="/kit">
                        Return to Kit
                    </LinkButton>
                    <button onClick={handleDrawAgain}>Draw Again</button>
                    {gameState.flags.tarotCompletedCount >= 3 && (
                        <LinkButton
                            style={{ justifySelf: "flex-end" }}
                            to="/tarot/gallery"
                        >
                            Tarot Gallery
                        </LinkButton>
                    )}
                </div>

                <TarotModal
                    selectedCard={modalCard} // <-- now an id; update TarotModal to read by id via getCardInfo
                    onClose={() => setModalCard(null)}
                />
            </div>
        </>
    );
}

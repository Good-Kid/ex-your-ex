import React, {
    useRef,
    useEffect,
    useMemo,
    useCallback,
    useState,
} from "react";
import gsap from "gsap";
import { Howl } from "howler";
import TarotModal from "../components/TarotPage/TarotModal";
import WaveText from "../components/WaveText";
import { getCardInfo, tarotCardData } from "../data/tarotCards";
import { useGameState } from "../context/GameStateContext";

// ------------------ Constants ------------------
const SLOT_COUNT = 3;
const CARD_COUNT = 6;
const CARD_IMAGE = "/images/tarot/back.png"; // back image
const MOBILE_TRIGGER_WIDTH = 700;
const DEFAULT_CARD_HEIGHT = 300;
const MOBILE_CARD_HEIGHT = 140;
const CARD_RATIO = 11 / 19;
const CARD_FLIP_DURATION = 0.6; // seconds
const CARD_FLIP_DELAY = 0.5; // seconds between flips

// ------------------ Helpers ------------------
const shuffleTake = (arr, n) => {
    if (!arr?.length) return Array(n).fill(null);
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
};

const pickFortunes = (images) => {
    return images.map((src, i) => {
        const info = getCardInfo(src);
        const pools = info?.fortunes || {};
        const group = i === 0 ? "cause" : i === 1 ? "effect" : "lesson";
        const options = pools[group] || [""];
        return options[Math.floor(Math.random() * options.length)] || "";
    });
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// ------------------ Component ------------------
export default function TarotPage() {
    // Contexts
    const { gameState, updateGameState } = useGameState();

    // Responsive card size
    const [cardHeight, setCardHeight] = useState(() =>
        window.innerWidth < MOBILE_TRIGGER_WIDTH
            ? MOBILE_CARD_HEIGHT
            : DEFAULT_CARD_HEIGHT
    );
    const cardWidth = Math.round(cardHeight * CARD_RATIO);

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

    // State
    const [playTarotIntro, setPlayTarotIntro] = useState(
        () => !gameState.flags.tarotIntroPlayed
    );
    // Intro text fade state
    const [introVis, setIntroVis] = useState({
        line1: false,
        line2: false,
        fadeOut: false,
        cardSlots: false,
    });

    const [selectedCards, setSelectedCards] = useState([]); // indices from fan
    const [removedCards, setRemovedCards] = useState([]); // removed from fan
    const [revealedFaces, setRevealedFaces] = useState(
        Array(SLOT_COUNT).fill(null)
    );
    const [fortuneParts, setFortuneParts] = useState([null, null, null]);
    const [fortuneReveal, setFortuneReveal] = useState([false, false, false]);

    // Animation state
    const [isInitialAnimating, setIsInitialAnimating] = useState(true);
    const [isRevealing, setIsRevealing] = useState(false);
    const [hasRevealed, setHasRevealed] = useState(false);

    // Refs
    const cardsRef = useRef([]); // fan card elements
    const fanWrapRef = useRef(null); // fan container
    const slotOuterRefs = useRef([]); // flip wrapper
    const slotTiltRefs = useRef([]); // hover tilt inner

    // Modal
    const [modalCard, setModalCard] = useState(null);

    // Sound
    const flipSoundRef = useRef(
        new Howl({ src: ["/sounds/flip.ogg"], volume: 0.8 })
    );

    // Precompute tarot key list
    const tarotKeys = useMemo(() => Object.keys(tarotCardData), []);

    // ------------------ Intro ------------------

    useEffect(() => {
        if (!playTarotIntro) return;

        const t1 = setTimeout(
            () => setIntroVis((v) => ({ ...v, line1: true })),
            100
        );
        const t2 = setTimeout(
            () => setIntroVis((v) => ({ ...v, line2: true })),
            1400
        );
        const t3 = setTimeout(
            () => setIntroVis((v) => ({ ...v, fadeOut: true })),
            3200
        );
        const t4 = setTimeout(() => setPlayTarotIntro(false), 4000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            updateGameState({
                flags: { ...gameState.flags, tarotIntroPlayed: true },
            });
        };
    }, [playTarotIntro]);

    useEffect(() => {
        if (playTarotIntro) return;

        // Ensure it starts hidden on first render after mount
        setIntroVis((v) => ({ ...v, cardSlots: false }));

        // Double rAF guarantees it's after the slots are in the DOM,
        // so the 0 -> 1 transition actually runs.
        let raf1 = 0,
            raf2 = 0;
        raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => {
                setIntroVis((v) => ({ ...v, cardSlots: true }));
            });
        });

        return () => {
            cancelAnimationFrame(raf1);
            cancelAnimationFrame(raf2);
        };
    }, [playTarotIntro]);

    // ------------------ Layout Fan ------------------
    const layoutFan = useCallback(() => {
        const elts = cardsRef.current;
        if (!elts) return;

        const visibleIdx = Array.from(
            { length: CARD_COUNT },
            (_, i) => i
        ).filter((i) => !removedCards.includes(i));
        const visibleCount = visibleIdx.length;
        if (!visibleCount) return;

        const spreadDeg = 60;
        const baseAngle = -spreadDeg / 2;
        const angleStep = visibleCount > 1 ? spreadDeg / (visibleCount - 1) : 0;
        const center = (visibleCount - 1) / 2;
        const arcHeight = 60;

        // Make overlap smaller on mobile for more spacing
        const overlap = window.innerWidth < 700 ? 40 : 80;
        const spacing = cardWidth - overlap;
        const startX = -center * spacing;

        let completed = 0;
        const total = visibleIdx.length;

        visibleIdx.forEach((cardIdx, pos) => {
            const card = elts[cardIdx];
            if (!card) return;

            const angle = baseAngle + angleStep * pos;
            const offset = pos - center;
            const y =
                -30 -
                arcHeight * (1 - Math.pow(offset / Math.max(center, 1), 2));
            const x = startX + spacing * pos;

            card.dataset.origY = String(y);

            gsap.to(card, {
                x,
                y,
                rotate: angle,
                duration: 0.5,
                ease: "power3.out",
                delay: 0.02 * pos,
                onComplete: () => {
                    completed++;
                    if (completed === total) setIsInitialAnimating(false);
                },
            });
        });
    }, [removedCards, cardWidth]);

    useEffect(() => {
        layoutFan();
    }, [layoutFan, selectedCards]);

    // ------------------ Interactions ------------------
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

        const el = cardsRef.current[idx];
        if (!el) return;

        el.style.zIndex = 3;
        gsap.to(el, {
            y: (Number(el.dataset.origY) || 0) - 100,
            scale: 1.05,
            opacity: 0,
            duration: 0.4,
            ease: "power3.inOut",
            onComplete: () => {
                setRemovedCards((prev) => [...prev, idx]);
                cardsRef.current[idx] = null;
            },
        });
    };

    const handleSlotHoverMove = (e, idx) => {
        if (
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

        gsap.to(el, {
            rotationX: -ny * MAX_TILT_X,
            rotationY: -nx * MAX_TILT_Y,
            x: -nx * SHIFT,
            y: -ny * SHIFT,
            duration: 0.15,
            ease: "power2.out",
            overwrite: true,
        });
    };

    const handleSlotHoverLeave = (idx) => {
        const el = slotTiltRefs.current[idx];
        if (!el || window.innerWidth < MOBILE_TRIGGER_WIDTH) return;
        gsap.to(el, {
            rotationX: 0,
            rotationY: 0,
            x: 0,
            y: 0,
            duration: 0.25,
            ease: "power2.out",
            overwrite: true,
        });
    };

    // ------------------ Reveal Sequence ------------------
    useEffect(() => {
        if (hasRevealed || selectedCards.length !== SLOT_COUNT) return;

        // Pick faces + fortunes
        const slotImages = shuffleTake(tarotKeys, SLOT_COUNT);
        const fortunes = pickFortunes(slotImages);

        // Preload
        slotImages.forEach((src) => {
            if (!src) return;
            const img = new Image();
            img.src = src;
        });

        setRevealedFaces(slotImages);
        setFortuneParts(fortunes);
        setFortuneReveal([false, false, false]);

        // Build flip timeline
        setIsRevealing(true);

        const tl = gsap.timeline({
            defaults: { ease: "power3.inOut" },
            onComplete: () => {
                setHasRevealed(true);
                setIsRevealing(false);
            },
        });

        if (fanWrapRef.current) {
            tl.to(fanWrapRef.current, { y: 400, opacity: 0, duration: 0.6 });
            tl.set(fanWrapRef.current, { display: "none" });
        }

        for (let s = 0; s < SLOT_COUNT; s++) {
            const outer = slotOuterRefs.current[s];
            if (!outer) continue;

            gsap.set(outer, {
                transformPerspective: 800,
                transformStyle: "preserve-3d",
                rotationY: 0,
            });

            tl.to(outer, {
                rotationY: 180,
                duration: CARD_FLIP_DURATION,
                onStart: () => {
                    flipSoundRef.current.play();
                    setFortuneReveal((prev) => {
                        const next = [...prev];
                        next[s] = true;
                        return next;
                    });
                },
            });
            tl.to({}, { duration: CARD_FLIP_DELAY });
        }

        // Cleanup on unmount
        return () => tl.kill();
    }, [selectedCards, hasRevealed, tarotKeys]);

    // ------------------ Render ------------------
    return (
        <div id="TarotPage">
            {playTarotIntro ? (
                <div
                    style={{
                        opacity: introVis.fadeOut ? 0 : 1,
                        transition: "opacity 0.6s ease, transform 0.6s ease",
                    }}
                    className="tarot-intro-container typewriter"
                >
                    <span
                        style={{
                            opacity: introVis.line1 ? 1 : 0,
                            transition:
                                "opacity 0.6s ease, transform 0.6s ease",
                        }}
                        className="line1"
                    >
                        Choose 3 cards
                    </span>
                    <span
                        style={{
                            opacity: introVis.line2 ? 1 : 0,
                            transition:
                                "opacity 0.6s ease, transform 0.6s ease",
                        }}
                        className="line2"
                    >
                        Your fortune will be made clear
                    </span>
                </div>
            ) : (
                <>
                    <div className="tarot-card-slots">
                        {Array.from({ length: SLOT_COUNT }).map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    width: `${cardWidth * 1.2}px`,
                                    height: `${cardHeight * 1.2}px`,
                                    borderRadius: 12,
                                    background: "rgba(255,255,255,0.05)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    perspective: "1000px",
                                    opacity: introVis.cardSlots ? 1 : 0,
                                    transition:
                                        "opacity 0.6s ease, transform 0.6s ease",
                                }}
                            >
                                {selectedCards[i] !== undefined && (
                                    <div
                                        ref={(el) =>
                                            (slotOuterRefs.current[i] = el)
                                        }
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            position: "relative",
                                            borderRadius: 12,
                                            transformStyle: "preserve-3d",
                                            cursor:
                                                hasRevealed && !isRevealing
                                                    ? "pointer"
                                                    : "default",
                                        }}
                                        onMouseMove={(e) =>
                                            handleSlotHoverMove(e, i)
                                        }
                                        onMouseLeave={() =>
                                            handleSlotHoverLeave(i)
                                        }
                                    >
                                        <div
                                            ref={(el) =>
                                                (slotTiltRefs.current[i] = el)
                                            }
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                transformStyle: "preserve-3d",
                                                borderRadius: 12,
                                                transformOrigin: "50% 50%",
                                                pointerEvents: isRevealing
                                                    ? "none"
                                                    : "auto",
                                            }}
                                        >
                                            {/* Back */}
                                            <img
                                                draggable={false}
                                                src={CARD_IMAGE}
                                                alt={`Back of Selected Card ${
                                                    selectedCards[i] + 1
                                                }`}
                                                style={{
                                                    userSelect: "none",
                                                    touchAction: "manipulation",
                                                    position: "absolute",
                                                    inset: 0,
                                                    width: "100%",
                                                    height: "100%",
                                                    borderRadius: 12,
                                                    backfaceVisibility:
                                                        "hidden",
                                                    transform: "rotateY(0deg)",
                                                }}
                                            />
                                            {/* Front */}
                                            <img
                                                draggable={false}
                                                src={
                                                    revealedFaces[i] ||
                                                    CARD_IMAGE
                                                }
                                                alt={
                                                    revealedFaces[i]
                                                        ? getCardInfo(
                                                              revealedFaces[i]
                                                          ).name || "Tarot Card"
                                                        : "Tarot Card"
                                                }
                                                style={{
                                                    userSelect: "none",
                                                    touchAction: "manipulation",
                                                    position: "absolute",
                                                    inset: 0,
                                                    width: "100%",
                                                    height: "100%",
                                                    borderRadius: 12,
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
                                                onClick={() => {
                                                    if (
                                                        hasRevealed &&
                                                        !isRevealing &&
                                                        revealedFaces[i]
                                                    ) {
                                                        setModalCard(
                                                            revealedFaces[i]
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
            {/* Fan */}
            <div
                ref={fanWrapRef}
                style={{
                    position: "absolute",
                    bottom: -150,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "100%",
                    maxWidth: 1200,
                    height: `${cardHeight + 120}px`,
                    pointerEvents: "auto",
                }}
            >
                {Array.from({ length: CARD_COUNT }).map((_, i) => {
                    if (removedCards.includes(i)) return null;
                    const isPicked = selectedCards.includes(i);
                    return (
                        <img
                            draggable={false}
                            key={i}
                            ref={(el) => (cardsRef.current[i] = el)}
                            src={CARD_IMAGE}
                            alt={`Tarot Card ${i + 1}`}
                            style={{
                                userSelect: "none",
                                touchAction: "manipulation",
                                width: `${cardWidth}px`,
                                height: `${cardHeight}px`,
                                position: "absolute",
                                left: "50%",
                                top: 0,
                                transform: "translateX(-50%)",
                                cursor:
                                    isPicked || playTarotIntro
                                        ? "default"
                                        : "pointer",
                                boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
                                borderRadius: 12,
                                background: "#222",
                                opacity: isPicked ? 0.3 : 1,
                                pointerEvents: isPicked ? "none" : "auto",
                            }}
                            onMouseEnter={(e) => {
                                if (
                                    window.innerWidth < 700 ||
                                    isPicked ||
                                    isInitialAnimating ||
                                    playTarotIntro
                                )
                                    return;
                                gsap.to(e.currentTarget, {
                                    y:
                                        Number(e.currentTarget.dataset.origY) -
                                        30,
                                    scale: 1.08,
                                    duration: 0.12,
                                    overwrite: true,
                                });
                            }}
                            onMouseLeave={(e) => {
                                if (
                                    window.innerWidth < 700 ||
                                    isPicked ||
                                    isInitialAnimating ||
                                    playTarotIntro
                                )
                                    return;
                                gsap.to(e.currentTarget, {
                                    y: Number(e.currentTarget.dataset.origY),
                                    scale: 1,
                                    boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
                                    duration: 0.25,
                                    overwrite: true,
                                });
                            }}
                            onClick={() => handleCardClick(i)}
                        />
                    );
                })}
            </div>

            {/* Fortune */}
            {fortuneParts.some(Boolean) && (
                <div className="fortune-parts-container typewriter">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            style={{
                                opacity: fortuneReveal[i] ? 1 : 0,
                                transition: "opacity 0.6s",
                                marginRight: i < 2 ? 8 : 0,
                                display: "inline-block",
                            }}
                        >
                            <WaveText intensity="low">
                                {fortuneParts[i]}
                            </WaveText>
                        </div>
                    ))}
                </div>
            )}

            <TarotModal
                selectedCard={modalCard}
                onClose={() => setModalCard(null)}
            />
        </div>
    );
}

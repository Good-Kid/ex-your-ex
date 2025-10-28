import React, { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import WaveText from "../WaveText";
import { getCardInfo } from "../../data/tarotCards";

const TarotModal = ({ selectedCard, onClose }) => {
    const tiltRef = useRef(null);
    const isAnimatingRef = useRef(false);
    const rafRef = useRef(null);

    const cardInfo = selectedCard ? getCardInfo(selectedCard) : null;

    // Throttled hover tilt effect - much more performant
    const MOBILE_TRIGGER_WIDTH = 700;
    const handleHoverMove = useCallback((e) => {
        if (!tiltRef.current || isAnimatingRef.current) return;
        if (window.innerWidth < MOBILE_TRIGGER_WIDTH) return;

        // Cancel any pending animation frame
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
            if (!tiltRef.current) return;

            const rect = tiltRef.current.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            const nx = (e.clientX - cx) / (rect.width / 2);
            const ny = (e.clientY - cy) / (rect.height / 2);

            const clx = Math.max(-1, Math.min(1, nx));
            const cly = Math.max(-1, Math.min(1, ny));

            // Reduced tilt amounts for better performance
            const MAX_TILT_X = 5;
            const rotX = -cly * MAX_TILT_X;
            const MAX_TILT_Y = 4;
            const rotY = -clx * MAX_TILT_Y;

            const SHIFT = 2;
            const tx = -clx * SHIFT;
            const ty = -cly * SHIFT;

            // Use direct style updates instead of GSAP for hover (much faster)
            tiltRef.current.style.transform = `
                perspective(1000px) 
                rotateX(${rotX}deg) 
                rotateY(${rotY}deg) 
                translateX(${tx}px) 
                translateY(${ty}px)
            `;
        });
    }, []);

    const handleHoverLeave = useCallback(() => {
        if (!tiltRef.current) return;
        if (window.innerWidth < MOBILE_TRIGGER_WIDTH) return;

        // Cancel any pending animation frame
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }

        // Use GSAP only for the reset animation
        gsap.to(tiltRef.current, {
            rotationX: 0,
            rotationY: 0,
            x: 0,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
            overwrite: true,
        });
    }, []);

    // Cleanup animation frames on unmount
    useEffect(() => {
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    // Simplified entrance animation
    useEffect(() => {
        if (selectedCard && tiltRef.current) {
            isAnimatingRef.current = true;

            gsap.fromTo(
                tiltRef.current,
                {
                    scale: 0.9,
                    opacity: 0,
                },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.out",
                    onComplete: () => {
                        isAnimatingRef.current = false;
                    },
                }
            );
        }
    }, [selectedCard]);

    if (!selectedCard || !cardInfo) return null;

    const isMobile = window.innerWidth < MOBILE_TRIGGER_WIDTH;

    return (
        <div className="tarot-modal" onClick={onClose}>
            <div
                className="tarot-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="tarot-card-container">
                    <div
                        ref={tiltRef}
                        className="tarot-modal-card"
                        onMouseMove={handleHoverMove}
                        onMouseLeave={handleHoverLeave}
                        style={{
                            transformStyle: "preserve-3d",
                            transformOrigin: "50% 50%",
                        }}
                    >
                        <img
                            src={selectedCard}
                            alt={cardInfo.name}
                            className="tarot-modal-image"
                        />
                    </div>
                </div>
                <div className="tarot-modal-text">
                    <div className="tarot-card-name typewriter">
                        <WaveText intensity="low">{cardInfo.name}</WaveText>
                    </div>
                    <div className="tarot-card-description">
                        <p>{cardInfo.description}</p>
                    </div>
                    <div className="tarot-card-symbolism typewriter">
                        <h4>Symbolism</h4>
                        <p>{cardInfo.symbolism}</p>
                    </div>
                    <div className="tarot-card-artist typewriter">
                        <h4>Artist</h4>
                        <p>{cardInfo.artist}</p>
                    </div>
                    <div className="tarot-modal-close-hint">
                        {isMobile ? (
                            <button
                                style={{
                                    background: "rgba(255,255,255,0.08)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "10px 18px",
                                    fontSize: "1em",
                                    margin: "12px auto 0",
                                    cursor: "pointer",
                                    width: "100%",
                                }}
                                onClick={onClose}
                            >
                                Click here to close
                            </button>
                        ) : (
                            <p>Click anywhere outside to close</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TarotModal;

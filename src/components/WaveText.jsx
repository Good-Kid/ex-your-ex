import React, { useLayoutEffect, useRef } from "react";

// Configuration presets
const intensityPresets = {
    low: {
        speed: 0.02,
        maxOpacity: 0.98,
        minOpacity: 0.92,
        phaseProgress: 0.08,
        baseAmplitude: 2,
        amplitudeVariation: 1,
        verticalMultiplier: 0.6,
    },
    lowMedium: {
        // Added low-medium preset
        speed: 0.03,
        maxOpacity: 0.96,
        minOpacity: 0.86,
        phaseProgress: 0.1,
        baseAmplitude: 4,
        amplitudeVariation: 2,
        verticalMultiplier: 0.9,
    },
    medium: {
        speed: 0.04,
        maxOpacity: 0.95,
        minOpacity: 0.8,
        phaseProgress: 0.12,
        baseAmplitude: 6,
        amplitudeVariation: 4,
        verticalMultiplier: 1.2,
    },
    high: {
        speed: 0.06,
        maxOpacity: 0.9,
        minOpacity: 0.7,
        phaseProgress: 0.16,
        baseAmplitude: 10,
        amplitudeVariation: 6,
        verticalMultiplier: 1.8,
    },
};

const WaveText = ({ children, intensity = "medium" }) => {
    const lettersRef = useRef([]);
    const rafRef = useRef(0);
    const phaseRef = useRef(0);

    const text = typeof children === "string" ? children : String(children);
    const config = intensityPresets[intensity] || intensityPresets.medium;

    useLayoutEffect(() => {
        let running = true;

        // ensure refs array length matches text
        lettersRef.current.length = text.length;

        // one synchronous pass BEFORE paint → no pop-in
        const paintPhase = (phase) => {
            lettersRef.current.forEach((el, i) => {
                if (!el) return;
                const mag =
                    config.baseAmplitude +
                    Math.sin(phase + i * config.phaseProgress) *
                        config.amplitudeVariation;
                const rad = phase + i * config.phaseProgress;
                const sin = Math.sin(rad);
                const cos = Math.cos(rad);

                // baseline styles set synchronously
                el.style.position = "relative";
                el.style.willChange = "transform, opacity";
                el.style.transform = `translate3d(${mag * cos}px, ${
                    config.verticalMultiplier * mag * sin
                }px, 0)`;
                el.style.opacity = String(
                    config.maxOpacity -
                        (config.maxOpacity - config.minOpacity) *
                            (1 + sin) *
                            0.5
                );
            });
        };

        // initial synchronous paint
        paintPhase(phaseRef.current);

        // animate on subsequent frames
        const tick = () => {
            if (!running) return;
            phaseRef.current += config.speed;
            paintPhase(phaseRef.current);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            running = false;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [text, config]);

    return (
        <span
            className="wave-text"
            style={{ display: "inline-block", whiteSpace: "nowrap" }}
        >
            {text.split("").map((letter, i) => (
                <span
                    key={i}
                    ref={(el) => (lettersRef.current[i] = el)}
                    style={{
                        display: "inline-block",
                        // keep a stable baseline even before JS runs
                        position: "relative",
                        willChange: "transform, opacity",
                        transition: "opacity 0.2s",
                        transform: "translate3d(0,0,0)",
                    }}
                >
                    {letter === " " ? "\u00A0" : letter}
                </span>
            ))}
        </span>
    );
};

export default WaveText;

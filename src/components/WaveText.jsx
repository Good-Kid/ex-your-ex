import React, { useLayoutEffect, useMemo, useRef } from "react";

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

const WaveText = ({ children, intensity = "medium", noWrap = false }) => {
    const lettersRef = useRef([]);
    const rafRef = useRef(0);
    const phaseRef = useRef(0);

    const text = typeof children === "string" ? children : String(children);
    const config = intensityPresets[intensity] || intensityPresets.medium;
    const tokens = useMemo(() => text.split(/(\s+)/), [text]);

    useLayoutEffect(() => {
        let running = true;
        lettersRef.current.length = text.length;

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

        paintPhase(phaseRef.current);
        const tick = () => {
            if (!running) return;
            phaseRef.current += config.speed;
            paintPhase(phaseRef.current);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            running = false;
            cancelAnimationFrame(rafRef.current);
        };
    }, [text, config]);

    let cursor = 0;
    return (
        <span
            className="wave-text"
            style={{
                display: "inline-block",
                whiteSpace: noWrap ? "nowrap" : "normal",
            }}
        >
            {tokens.map((tok, tIdx) => {
                if (tok === "") return null;

                if (/^\s+$/.test(tok)) {
                    cursor += tok.length;
                    return (
                        <React.Fragment key={`ws-${tIdx}`}>
                            {tok}
                        </React.Fragment>
                    );
                }

                const wordChars = Array.from(tok);
                const wordStart = cursor;
                cursor += tok.length;

                return (
                    <span
                        key={`w-${tIdx}`}
                        style={{
                            display: "inline-block",
                            whiteSpace: "nowrap",
                            lineHeight: "inherit",
                            verticalAlign: "baseline",
                        }}
                    >
                        {wordChars.map((ch, i) => {
                            const absIndex = wordStart + i;
                            return (
                                <span
                                    key={`ch-${tIdx}-${i}`}
                                    ref={(el) =>
                                        (lettersRef.current[absIndex] = el)
                                    }
                                    style={{
                                        display: "inline-block",
                                        willChange: "transform, opacity",
                                        transition: "opacity 0.2s",
                                    }}
                                >
                                    {ch}
                                </span>
                            );
                        })}
                    </span>
                );
            })}
        </span>
    );
};

export default WaveText;

import React, { useRef, useState, useLayoutEffect } from "react";

const OuijaMenu = ({
    onClickHandler,
    style,
    hidePlanchette = false,
    noDisabled = false,
}) => {
    const containerRef = useRef(null);
    const planchetteRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    // Helper to position planchette at center
    const positionPlanchetteCenter = () => {
        const container = containerRef.current;
        if (!container) return;

        const buttons = container.querySelectorAll("button");
        const yes = buttons[0],
            no = buttons[1];
        if (!yes || !no) return;

        const c = container.getBoundingClientRect();
        const y = yes.getBoundingClientRect();
        const n = no.getBoundingClientRect();

        const centerX = (y.right + n.left) / 2 - c.left;
        const centerY = y.bottom - c.top + 8;

        const el = planchetteRef.current;
        if (!el) return;
        el.style.transition = "none";
        el.style.transform = `translate(${centerX}px, ${centerY}px) translateX(-50%)`;

        requestAnimationFrame(() => {
            el.style.transition = ""; // restore CSS transition
            setMounted(true);
        });
    };

    useLayoutEffect(() => {
        positionPlanchetteCenter();

        const handleResize = () => {
            positionPlanchetteCenter();
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const onOptionHover = (e) => {
        const btn = e.currentTarget;
        const container = containerRef.current;
        const c = container.getBoundingClientRect();
        const b = btn.getBoundingClientRect();

        const x = b.left - c.left + b.width / 2;
        const y = b.bottom - c.top + 8;

        planchetteRef.current.style.transform = `translate(${x}px, ${y}px) translateX(-50%)`;
    };

    return (
        <div
            ref={containerRef}
            className="ouija-menu"
            style={{
                ...style,
            }}
        >
            <div
                className="typewriter"
                style={{
                    gridRow: 1,
                    gridColumn: "1 / 3",
                    width: "100%",
                    textAlign: "center",
                }}
            >
                Open the box?
            </div>

            <div className="button-container">
                <button
                    style={{ gridRow: 2, gridColumn: 1 }}
                    onMouseOver={onOptionHover}
                    onFocus={onOptionHover}
                    onClick={() => onClickHandler(true)}
                >
                    Yes
                </button>
            </div>

            <div className="button-container">
                <button
                    style={{
                        gridRow: 2,
                        gridColumn: 2,
                        opacity: noDisabled ? 0.5 : 1,
                    }}
                    className={noDisabled ? "disabled" : undefined}
                    disabled={noDisabled}
                    onMouseOver={onOptionHover}
                    onFocus={onOptionHover}
                    onClick={() => onClickHandler(false)}
                >
                    No
                </button>
                {noDisabled && <div className="crossout"></div>}
            </div>

            <div
                ref={planchetteRef}
                className={"planchette" + (mounted ? " is-ready" : "")}
                style={{
                    display: hidePlanchette ? "none" : "initial",
                    position: "absolute",
                    top: -20,
                    left: 0,
                    pointerEvents: "none",
                    willChange: "transform",
                    transition: mounted
                        ? "transform 300ms ease-in-out"
                        : "none",
                }}
            >
                <img
                    src="/images/planchette.webp"
                    alt=""
                    style={{ height: 120, width: "auto" }}
                />
            </div>
        </div>
    );
};

export default OuijaMenu;

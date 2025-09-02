import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

export default function PageTransition({
    children,
    direction = "horizontal",
    triggerOut,
    onOutComplete,
    animateIn = true,
}) {
    const container = useRef();
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        // Only hide after out-animation, never on initial render
        setHidden(false);
        if (!animateIn) return;
        const node = container.current;
        if (direction === "vertical") {
            gsap.fromTo(
                node,
                {
                    y: "100vh",
                    x: 0,
                    opacity: 0,
                    transformOrigin: "center center",
                },
                {
                    y: 0,
                    x: 0,
                    opacity: 1,
                    duration: 0.7,
                    ease: "power2.out",
                    transformOrigin: "center center",
                }
            );
        } else {
            gsap.fromTo(
                node,
                {
                    x: "-100vw",
                    y: 0,
                    opacity: 0,
                    transformOrigin: "center center",
                },
                {
                    x: 0,
                    y: 0,
                    opacity: 1,
                    duration: 0.7,
                    ease: "power2.out",
                    transformOrigin: "center center",
                }
            );
        }
    }, [direction, animateIn]);

    useEffect(() => {
        if (triggerOut) {
            const node = container.current;
            const outProps =
                direction === "vertical"
                    ? {
                          y: "100vh",
                          x: 0,
                          opacity: 0,
                          duration: 0.7,
                          ease: "power2.in",
                          transformOrigin: "center center",
                          onComplete: () => {
                              setHidden(true);
                              if (onOutComplete) onOutComplete();
                          },
                      }
                    : {
                          x: "-100vw",
                          y: 0,
                          opacity: 0,
                          duration: 0.7,
                          ease: "power2.in",
                          transformOrigin: "center center",
                          onComplete: () => {
                              setHidden(true);
                              if (onOutComplete) onOutComplete();
                          },
                      };
            gsap.to(node, outProps);
        }
    }, [triggerOut, direction, onOutComplete]);

    return (
        <div
            ref={container}
            style={{
                minHeight: "100vh",
                width: "100vw",
                display: hidden ? "none" : "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                top: 0,
                left: 0,
                overflow: "hidden",
                zIndex: triggerOut ? 2 : 1,
                background: "transparent",
            }}
        >
            {children}
        </div>
    );
}

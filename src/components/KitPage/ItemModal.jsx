import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import WaveText from "../WaveText";
import LinkButton from "../LinkButton";

const ItemModal = ({ selectedItem, onClose }) => {
    const [contentReady, setContentReady] = useState(false);
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

    // Add 'modal-open' to <html> when modal is open
    useEffect(() => {
        if (selectedItem) {
            document.documentElement.classList.add("modal-open");
        } else {
            document.documentElement.classList.remove("modal-open");
        }
        return () => {
            document.documentElement.classList.remove("modal-open");
        };
    }, [selectedItem]);

    const src = useMemo(() => {
        if (!selectedItem?.imageSrc) return null;
        return selectedItem.imageSrc.startsWith("/")
            ? selectedItem.imageSrc
            : `/${selectedItem.imageSrc.replace(/^\/?/, "")}`;
    }, [selectedItem?.imageSrc]);

    useEffect(() => {
        let cancelled = false;
        setContentReady(false);
        if (!src) return;

        const probe = new Image();
        probe.src = src;

        const finish = () => {
            if (cancelled) return;
            // two RAFs to ensure DOM is ready and decode has committed
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setContentReady(true));
            });
        };

        if (probe.decode) {
            probe.decode().then(finish).catch(finish);
        } else {
            probe.onload = finish;
            probe.onerror = finish;
        }

        return () => {
            cancelled = true;
        };
    }, [src]);

    if (!selectedItem) return null;

    const handleClickOutside = () => {
        onClose();
    };

    // Reserve image space to prevent jank
    const imageConstraintStyles = {};
    if (selectedItem.maxWidth)
        imageConstraintStyles.maxWidth = selectedItem.maxWidth;
    if (selectedItem.maxHeight)
        imageConstraintStyles.maxHeight = selectedItem.maxHeight;
    if (selectedItem.rotation)
        imageConstraintStyles.transform = `rotate(${selectedItem.rotation}deg)`;

    // Add marginBottom for cassette
    const imageExtraStyles =
        selectedItem.name === "Broken Cassette" ? { marginBottom: -100 } : {};

    return (
        <div className="item-modal" onClick={handleClickOutside}>
            <div
                style={{
                    visibility: contentReady ? "visible" : "hidden",
                    opacity: contentReady ? 1 : 0,
                }}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="item-modal-image"
                    style={{
                        ...(selectedItem.noFloat ? { animation: "none" } : {}),
                        cursor: "default",
                    }}
                >
                    <img
                        src={src}
                        alt={selectedItem.name}
                        style={{
                            ...imageConstraintStyles,
                            ...imageExtraStyles,
                            cursor: "default",
                        }}
                    />
                </div>

                <div
                    className="item-modal-text"
                    onClick={(e) => e.stopPropagation()}
                    style={{ cursor: "default" }}
                >
                    <div className="item-name typewriter">
                        <WaveText intensity="low">{selectedItem.name}</WaveText>
                    </div>
                    <p>{selectedItem.description}</p>
                    {selectedItem.inspectLink && (
                        <LinkButton to={selectedItem.inspectLink}>
                            Inspect
                        </LinkButton>
                    )}
                    <hr />
                    <div className="modal-footer">
                        {isMobile ? "Tap" : "Click"} anywhere outside to close
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemModal;

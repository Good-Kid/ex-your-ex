import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import WaveText from "../WaveText";
import LinkButton from "../LinkButton";

const normalizeSrc = (path) => {
    if (!path) return null;
    return path.startsWith("/") ? path : `/${path.replace(/^\/?/, "")}`;
};

const ItemModal = ({ selectedItem, onClose }) => {
    const [hiReady, setHiReady] = useState(false);
    const [previewReady, setPreviewReady] = useState(false);

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

    // Compute sources
    const srcLarge = useMemo(
        () => normalizeSrc(selectedItem?.imageSrc),
        [selectedItem?.imageSrc]
    );
    const srcPreview = useMemo(
        () =>
            normalizeSrc(
                selectedItem?.smallImageSrc || selectedItem?.imageSrc || null
            ),
        [selectedItem?.smallImageSrc, selectedItem?.imageSrc]
    );

    // Reset readiness on source change
    useEffect(() => {
        setHiReady(false);
        setPreviewReady(false);
    }, [srcLarge, srcPreview]);

    // Decode hi-res in the background and fade in
    useEffect(() => {
        if (!srcLarge) return;
        let cancelled = false;

        const probe = new Image();
        probe.src = srcLarge;

        const finish = () => {
            if (cancelled) return;
            // double RAF to ensure DOM is ready and decode has committed
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setHiReady(true));
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
    }, [srcLarge]);

    if (!selectedItem) return null;

    const handleClickOutside = () => {
        onClose();
    };

    // Reserve image space & apply YOUR transforms (unchanged)
    const imageConstraintStyles = {};
    if (selectedItem.maxWidth)
        imageConstraintStyles.maxWidth = selectedItem.maxWidth;
    if (selectedItem.maxHeight)
        imageConstraintStyles.maxHeight = selectedItem.maxHeight;
    if (selectedItem.rotation)
        imageConstraintStyles.transform = `rotate(${selectedItem.rotation}deg)`;

    // Extra style for cassette
    const imageExtraStyles =
        selectedItem.name === "Broken Cassette" ? { marginBottom: -100 } : {};

    // We can show the modal body as soon as either preview or hi-res is ready
    const contentReady = previewReady || hiReady;

    return (
        <div className="item-modal" onClick={handleClickOutside}>
            <div
                style={{
                    visibility: contentReady ? "visible" : "hidden",
                    opacity: contentReady ? 1 : 0,
                    transition: "opacity .15s ease",
                }}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="item-modal-image"
                    style={{
                        ...(selectedItem.noFloat ? { animation: "none" } : {}),
                        cursor: "default",
                        position: "relative",
                        display: "inline-block",
                    }}
                >
                    {/* Preview (blurred) */}
                    {srcPreview && (
                        <img
                            src={srcPreview}
                            alt={`${selectedItem.name} (preview)`}
                            decoding="async"
                            loading="eager"
                            onLoad={() => setPreviewReady(true)}
                            style={{
                                ...imageConstraintStyles, // your transform/size applied here
                                ...imageExtraStyles,
                                display: "block",
                                width: "100%",
                                height: "auto",
                                cursor: "default",
                                filter: hiReady ? "none" : "blur(8px)",
                                opacity: hiReady ? 0 : 1,
                                transition:
                                    "filter .25s ease, opacity .25s ease",
                            }}
                        />
                    )}

                    {/* High-res (fades in on top of preview) */}
                    {srcLarge && (
                        <img
                            src={srcLarge}
                            alt={selectedItem.name}
                            decoding="async"
                            loading="lazy"
                            style={{
                                ...imageConstraintStyles, // same exact transform/size
                                ...imageExtraStyles,
                                display: "block",
                                width: "100%",
                                height: "auto",
                                cursor: "default",
                                position: srcPreview ? "absolute" : "static",
                                inset: srcPreview ? 0 : "auto",
                                opacity: hiReady ? 1 : 0,
                                transition: "opacity .25s ease",
                            }}
                        />
                    )}
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

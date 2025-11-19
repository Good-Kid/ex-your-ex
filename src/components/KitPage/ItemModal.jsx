import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import WaveText from "../WaveText";
import LinkButton from "../LinkButton";

const normalizeSrc = (path) => {
    if (!path) return null;
    return path.startsWith("/") ? path : `/${path.replace(/^\/?/, "")}`;
};

const ItemModal = ({ selectedItem, onClose }) => {
    const [previewReady, setPreviewReady] = useState(false);
    const [sharp, setSharp] = useState(false); // controls blur off
    const [shownSrc, setShownSrc] = useState(null); // current <img> src

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

    // Lock scroll when modal open
    useEffect(() => {
        if (selectedItem) document.documentElement.classList.add("modal-open");
        else document.documentElement.classList.remove("modal-open");
        return () => document.documentElement.classList.remove("modal-open");
    }, [selectedItem]);

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

    // Reset per item
    useEffect(() => {
        setPreviewReady(false);
        setSharp(false);
        setShownSrc(srcPreview || srcLarge || null); // start with preview (or large)
    }, [srcPreview, srcLarge]);

    // Decode hi-res in background; when done, swap src and unblur
    useEffect(() => {
        if (!srcLarge) return;
        let cancelled = false;
        const img = new Image();
        img.src = srcLarge;

        const finish = () => {
            if (cancelled) return;
            setShownSrc(srcLarge);
            requestAnimationFrame(() => setSharp(true));
        };

        if (img.decode) img.decode().then(finish).catch(finish);
        else {
            img.onload = finish;
            img.onerror = finish;
        }
        return () => {
            cancelled = true;
        };
    }, [srcLarge]);

    if (!selectedItem) return null;

    const handleClickOutside = () => onClose();

    // Modal viewport bounds
    const modalMaxW = isMobile ? "85vw" : "50vw";
    const modalMaxH = isMobile ? "30vh" : "50vh";

    // Compose final max-* so we honor BOTH the modal bounds AND kit limits.
    const computedMaxWidth = selectedItem?.maxWidth
        ? `min(${Number(selectedItem.maxWidth)}px, ${modalMaxW})`
        : modalMaxW;

    const computedMaxHeight = selectedItem?.maxHeight
        ? `min(${Number(selectedItem.maxHeight)}px, ${modalMaxH})`
        : modalMaxH;

    // Your original transforms/constraints
    const imageConstraintStyles = {};
    if (selectedItem?.rotation)
        imageConstraintStyles.transform = `rotate(${selectedItem.rotation}deg)`;

    // Optional offset for the cassette (use position shift, not margin vs flex gap)
    const wrapperExtraStyles =
        selectedItem?.name === "Broken Cassette"
            ? {
                  position: "relative",
                  top: isMobile ? 50 : 100,
              }
            : {};

    const contentReady = previewReady || !!shownSrc;

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
                        ...(selectedItem?.noFloat ? { animation: "none" } : {}),
                        cursor: "default",
                        display: "inline-block",
                        lineHeight: 0,
                        ...wrapperExtraStyles,
                    }}
                >
                    {shownSrc && (
                        <img
                            src={shownSrc}
                            alt={selectedItem.name}
                            decoding="async"
                            loading="eager"
                            onLoad={() => setPreviewReady(true)}
                            style={{
                                ...imageConstraintStyles,
                                display: "block",
                                width: "auto",
                                height: "auto",
                                // CRITICAL: these two lines replace the hard-coded 50vw/50vh
                                maxWidth: computedMaxWidth,
                                maxHeight: computedMaxHeight,
                                cursor: "default",
                                filter: sharp ? "none" : "blur(8px)",
                                transition: "filter .25s ease",
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

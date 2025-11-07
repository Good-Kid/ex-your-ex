import React, { useEffect, useRef, useState } from "react";
import { useGameState } from "../../context/GameStateContext";

import { GrCheckbox } from "react-icons/gr";
import { GrCheckboxSelected } from "react-icons/gr";
import { Link } from "react-router-dom";

const NoteModal = ({ modalOpen, onClose }) => {
    const { gameState } = useGameState();

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

    useEffect(() => {
        if (modalOpen) {
            document.documentElement.classList.add("modal-open");
        } else {
            document.documentElement.classList.remove("modal-open");
        }
        return () => {
            document.documentElement.classList.remove("modal-open");
        };
    }, [modalOpen]);

    const handleClickOutside = () => {
        onClose();
    };

    const [ritualBtnSrc, setRitualBtnSrc] = useState(
        "images/kit/ritualbutton.gif"
    );
    const [imgLoaded, setImgLoaded] = useState(false);

    useEffect(() => {
        const img = new window.Image();
        img.onload = () => setImgLoaded(true);
        img.src = "images/kit/ritualbutton.gif";
    }, []);

    // Wait for paper/background image
    const noteRef = useRef(null);
    const [paperLoaded, setPaperLoaded] = useState(false);

    useEffect(() => {
        if (!modalOpen) return;
        const el = noteRef.current;
        if (!el) return;

        const bg = window.getComputedStyle(el).backgroundImage || "";
        const match = bg.match(/url\((['"]?)(.*?)\1\)/i);
        const src = match?.[2];

        if (!src) {
            setPaperLoaded(true);
            return;
        }

        const img = new window.Image();
        img.onload = () => setPaperLoaded(true);
        img.onerror = () => setPaperLoaded(true);
        img.src = src.startsWith("data:") ? src : src;
    }, [modalOpen]);

    const ready = imgLoaded && paperLoaded;

    return (
        <div
            className="note-modal"
            onClick={handleClickOutside}
            style={!modalOpen ? { display: "none" } : undefined}
        >
            <div
                className="note-container"
                onClick={(e) => e.stopPropagation()}
                ref={noteRef}
            >
                {ready &&
                    (gameState.flags.quizCompleted &&
                    gameState.flags.cassetteCompleted &&
                    gameState.flags.tarotCompleted &&
                    gameState.flags.bottleCompleted ? (
                        <div className="note-content handwritten">
                            <span>The time has come.</span>
                            <span>
                                Thank you for completing your kit. You've done
                                wonderfully to reach this stage.
                            </span>
                            <span>
                                That ache, that weight, that voice you couldn't
                                quiet... It's ready to leave you.
                            </span>
                            <span>
                                Perform the ritual and release it as a spirit.
                                we’ll take care of it from there.
                            </span>
                            <span>Are you ready?</span>
                            <Link className="ritual-button" to={"/ritual"}>
                                <img
                                    src={ritualBtnSrc}
                                    alt=""
                                    onMouseEnter={() =>
                                        setRitualBtnSrc(
                                            "images/kit/ritualbuttonhover.gif"
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setRitualBtnSrc(
                                            "images/kit/ritualbutton.gif"
                                        )
                                    }
                                />
                            </Link>
                        </div>
                    ) : (
                        ready && (
                            <div className="note-content handwritten">
                                <span>
                                    Thank you for ordering an{" "}
                                    <i>Exorcise your Ex</i>
                                    <sup>™</sup> kit.
                                </span>
                                <span>
                                    It's our guarantee that by the time you
                                    complete the ritual, all of the heartbreak
                                    and grief you've been feeling will have left
                                    your body entirely.
                                </span>
                                <span>
                                    To get rid of those nasty feelings you've
                                    been dealing with, just follow these steps:
                                </span>
                                <div className="note-checklist">
                                    <span
                                        className={
                                            gameState.flags.cassetteCompleted
                                                ? "completed"
                                                : undefined
                                        }
                                    >
                                        {gameState.flags.cassetteCompleted ? (
                                            <GrCheckboxSelected className="check-icon" />
                                        ) : (
                                            <GrCheckbox className="check-icon" />
                                        )}
                                        Listen to the Cassette
                                    </span>
                                    <span
                                        className={
                                            gameState.flags.tarotCompleted
                                                ? "completed"
                                                : undefined
                                        }
                                    >
                                        {gameState.flags.tarotCompleted ? (
                                            <GrCheckboxSelected className="check-icon" />
                                        ) : (
                                            <GrCheckbox className="check-icon" />
                                        )}
                                        Read your Tarot
                                    </span>
                                    <span
                                        className={
                                            gameState.flags.quizCompleted
                                                ? "completed"
                                                : undefined
                                        }
                                    >
                                        {gameState.flags.quizCompleted ? (
                                            <GrCheckboxSelected className="check-icon" />
                                        ) : (
                                            <GrCheckbox className="check-icon" />
                                        )}
                                        Consult the Grimoire
                                    </span>
                                    <span
                                        className={
                                            gameState.flags.bottleCompleted
                                                ? "completed"
                                                : undefined
                                        }
                                    >
                                        {gameState.flags.bottleCompleted ? (
                                            <GrCheckboxSelected className="check-icon" />
                                        ) : (
                                            <GrCheckbox className="check-icon" />
                                        )}
                                        Fill the Bottle
                                    </span>
                                    <span>
                                        {gameState.flags.ritualCompleted ? (
                                            <GrCheckboxSelected className="check-icon" />
                                        ) : (
                                            <GrCheckbox className="check-icon" />
                                        )}
                                        Perform the Ritual
                                    </span>
                                </div>
                                <span>
                                    P.S. If you get stuck, the skull might know
                                    what to do.
                                </span>
                            </div>
                        )
                    ))}
            </div>
            <span className="close-tip">
                {isMobile ? "Tap" : "Click"} anywhere outside the note to close
            </span>
        </div>
    );
};

export default NoteModal;

import React, { useEffect, useState } from "react";
import { useGameState } from "../../context/GameStateContext";

import { GrCheckbox } from "react-icons/gr";
import { GrCheckboxSelected } from "react-icons/gr";

const NoteModal = ({ modalOpen, onClose }) => {
    const { gameState } = useGameState();

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
        console.log("closin");

        onClose();
    };

    return (
        <div
            className="note-modal"
            onClick={handleClickOutside}
            style={!modalOpen ? { display: "none" } : undefined}
        >
            <div
                className="note-container"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="note-content handwritten">
                    <span>Thank you for ordering a kit!</span>
                    <span>
                        It's our guarantee that by the time you complete the
                        ritual, all of the heartbreak and grief you've been
                        feeling will have left your body entirely... as a
                        spirit!
                    </span>
                    <span>
                        In order to exorcise those nasty residual feelings
                        you've been dealing with, just follow this checklist:
                    </span>

                    <div className="note-checklist">
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
                        P.S. If you get stuck, the skull might know what to do.
                    </span>
                </div>
            </div>
            <span className="close-tip">
                {isMobile ? "Tap" : "Click"} anywhere outside the note to close
            </span>
        </div>
    );
};

export default NoteModal;

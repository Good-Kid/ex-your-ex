import React, { useEffect, useRef, useState } from "react";
import WaveText from "../components/WaveText";
import axios from "axios";
import { Howl } from "howler";

import ghostQuizData, {
    scoreAnswers,
    computeMaxWeights,
    normalizeScores,
    pickResult4x4,
    resultFromScores,
} from "../data/ghostData";

const BOOK_COVER_SRC = "/images/quiz/book_closed.png";
const BOOK_OPEN_SRC = "/images/quiz/book_open.png";
const OPEN_BOOK_GIF_SRC = "/images/quiz/book_opening.gif";
const PAGE_FLIP_GIF_SRC = "/images/quiz/book_flip.gif";
const OPEN_DURATION = 1400; // ms
const FLIP_DURATION = 250; // ms

const QuizPage = () => {
    const [bookSrc, setBookSrc] = useState(BOOK_COVER_SRC);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [lastAnswer, setLastAnswer] = useState();
    const [showText, setShowText] = useState(false);

    const [scores, setScores] = useState({ voice: 0, temper: 0 });

    useEffect(() => {
        console.log("Scores updated to: ", scores);
    }, [scores]);

    const getBookSrc = () => {
        if (bookSrc.endsWith(".gif")) {
            return `${bookSrc}?cb=${Date.now()}`;
        }
        return bookSrc;
    };

    const handleBookClick = () => {
        if (bookSrc == BOOK_COVER_SRC) {
            setBookSrc(OPEN_BOOK_GIF_SRC);
            setTimeout(() => {
                setBookSrc("/images/quiz/book_open.png");
                setTimeout(() => {
                    setShowText(true);
                }, 100); // slight delay after book opens
            }, OPEN_DURATION);
        }
    };

    const handleChoiceClick = (question, answer) => {
        if (showText === false) {
            return;
        }
        setLastAnswer(`${question} ${answer}`);
        setShowText(false);

        const answerWeights =
            ghostQuizData.questions[question].answers[answer].weights;

        // update the score
        setScores((prev) => scoreAnswers(prev, answerWeights));

        setTimeout(() => {
            setBookSrc(PAGE_FLIP_GIF_SRC);
            setTimeout(() => {
                setCurrentQuestion((prev) => prev + 1);
                setBookSrc(BOOK_OPEN_SRC);
                setShowText(true);
            }, 1200); // how long until the text fades back in
        }, 300); // how long until the page flip starts
    };

    const renderQuestion = () => {
        return <span>{ghostQuizData.questions[currentQuestion].text}</span>;
    };

    const renderAnswers = () => {
        return (
            <>
                {ghostQuizData.questions[currentQuestion].answers.map(
                    (answer, idx) => (
                        <div
                            className="choice"
                            onClick={() => {
                                handleChoiceClick(currentQuestion, idx);
                            }}
                            key={idx}
                        >
                            <div className="choice-key">
                                {String.fromCharCode(65 + idx)})
                                <div
                                    className="circle"
                                    style={
                                        lastAnswer ==
                                        `${currentQuestion} ${idx}`
                                            ? {
                                                  opacity: 1,
                                              }
                                            : {}
                                    }
                                >
                                    <img
                                        src="/images/quiz/circle.png"
                                        alt=""
                                        className="circle"
                                        style={
                                            lastAnswer ==
                                            `${currentQuestion} ${idx}`
                                                ? {
                                                      opacity: 1,
                                                  }
                                                : {}
                                        }
                                    />
                                </div>
                            </div>
                            <div className="choice-text">{answer.text}</div>
                        </div>
                    )
                )}
            </>
        );
    };

    return (
        <div id="QuizPage">
            <div className="quiz-container">
                <div
                    className="book-container"
                    style={{
                        cursor:
                            bookSrc == BOOK_COVER_SRC ? "pointer" : "default",
                        transform: `translateX(${
                            bookSrc == BOOK_COVER_SRC ? "-25%" : "0px"
                        })`,
                    }}
                >
                    <img src={getBookSrc()} onClick={handleBookClick} alt="" />
                    <div
                        className="book-text typewriter"
                        style={{
                            opacity: showText ? 1 : 0,
                            pointerEvents: showText ? "auto" : "none",
                        }}
                    >
                        <div className="question">{renderQuestion()}</div>
                        <div className="answers">{renderAnswers()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizPage;

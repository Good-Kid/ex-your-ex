import React, { useEffect, useState } from "react";

import ghostQuizData, {
    scoreAnswers,
    resultFromScores,
} from "../data/ghostData";
import LinkButton from "../components/LinkButton";

const BOOK_COVER_SRC = "/images/quiz/book_closed.png";
const BOOK_OPEN_SRC = "/images/quiz/book_open.png";
const OPEN_BOOK_GIF_SRC = "/images/quiz/book_opening.gif";
const PAGE_FLIP_GIF_SRC = "/images/quiz/book_flip.gif";
const OPEN_DURATION = 1400; // ms
const FLIP_DURATION = 250; // ms

const QuizPage = () => {
    const [bookSrc, setBookSrc] = useState(BOOK_COVER_SRC);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showText, setShowText] = useState(false);
    const [scores, setScores] = useState({ voice: 0, temper: 0 });
    const [result, setResult] = useState();

    const [ui, setUI] = useState({
        quizContainer: true,
        showQuiz: true,
        resultsContainer: false,
        showResults: false,
    });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1000);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        console.log(result);
    }, [result]);

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
        setShowText(false);

        const answerWeights =
            ghostQuizData.questions[question].answers[answer].weights;

        const nextScores = scoreAnswers(scores, answerWeights);
        setScores(nextScores);

        // detect if this was the last question
        if (question === ghostQuizData.questions.length - 1) {
            setResult(resultFromScores(scores, ghostQuizData));
            setTimeout(() => {
                setUI((u) => ({ ...u, showQuiz: false }));
                setTimeout(() => {
                    setUI((u) => ({
                        ...u,
                        quizContainer: false,
                        resultsContainer: true,
                    }));
                    setTimeout(() => {
                        setUI((u) => ({ ...u, showResults: true }));
                    }, 10);
                }, 300); // how long until the book fades away
            }, 0);
            return;
        }

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
        const text = ghostQuizData.questions[currentQuestion].text;
        return (
            <>
                {text.split("\n").map((line, idx) => (
                    <span key={idx}>
                        {line}
                        {idx < text.split("\n").length - 1 && <br />}
                    </span>
                ))}
            </>
        );
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
                            <div className="choice-text">{answer.text}</div>
                        </div>
                    )
                )}
            </>
        );
    };

    if (ui.quizContainer)
        return (
            <div id="QuizPage">
                <div
                    className={`quiz-container ${
                        ui.showQuiz ? "show" : "hide"
                    }`}
                >
                    <div
                        className={`book-container ${
                            bookSrc == BOOK_COVER_SRC && "hoverable"
                        }`}
                        style={{
                            cursor:
                                bookSrc == BOOK_COVER_SRC
                                    ? "pointer"
                                    : "default",
                            transform: `translateX(${
                                bookSrc == BOOK_COVER_SRC ? "-25%" : "0px"
                            })`,
                        }}
                    >
                        <img
                            src={getBookSrc()}
                            onClick={handleBookClick}
                            alt=""
                        />
                        <div
                            className="book-text typewriter"
                            style={{
                                opacity: showText ? 1 : 0,
                                pointerEvents: showText ? "auto" : "none",
                            }}
                        >
                            <div className="question ">{renderQuestion()}</div>
                            <div className="answers">
                                <span className="prompt">Choose One:</span>
                                {renderAnswers()}
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className={`quiz-results ${
                        ui.showResults ? "show" : "hide"
                    }`}
                ></div>
            </div>
        );
    else if (ui.resultsContainer) {
        return (
            <div
                className={`results-container ${
                    ui.showResults ? "show" : "hide"
                }`}
                style={{
                    width: "500px",
                    margin: "auto",
                    textAlign: "center",
                }}
            >
                The results page isnt done yet {":P"},<br />
                But if it was, you would've gotten:
                <div
                    style={{
                        border: "1px solid white",
                        display: "flex",
                        flexDirection: "column",
                        padding: "20px",
                        margin: "20px",
                    }}
                >
                    <span
                        style={{
                            borderBottom: "1px solid white",
                            marginBottom: "10px",
                        }}
                    >
                        <b>{result.name}</b>
                    </span>
                    <span>{result.description}</span>
                </div>
                <LinkButton to="/kit">Back to Kit</LinkButton>
            </div>
        );
    }
};

export default QuizPage;

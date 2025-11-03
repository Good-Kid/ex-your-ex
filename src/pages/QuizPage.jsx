import React, { useEffect, useState } from "react";

import ghostQuizData, {
    scoreAnswers,
    resultFromScores,
} from "../data/ghostData";
import { useAnimate } from "motion/react";
import LinkButton from "../components/LinkButton";
import WaveText from "../components/WaveText";
import { useGameState } from "../context/GameStateContext";

const BOOK_COVER_SRC = "/images/quiz/book_closed.png";
const BOOK_OPEN_SRC = "/images/quiz/book_open.png";
const OPEN_BOOK_GIF_SRC = "/images/quiz/book_opening.gif"; // 0.11 secs
const PAGE_FLIP_GIF_SRC = "/images/quiz/book_flip.gif"; // 0.06 secs

const QuizPage = () => {
    const { updateGameState } = useGameState();

    // ----- State -----
    const [bookSrc, setBookSrc] = useState(BOOK_COVER_SRC);
    const [bookOpen, setBookOpen] = useState(false);
    const [qIndex, setQIndex] = useState(0);
    const [clickable, setClickable] = useState(true);
    const [scores, setScores] = useState({});
    const [quizResult, setQuizResult] = useState();

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
        console.log(scores);
    }, [scores]);

    // ----- Helpers -----
    const setBookSrcWithCacheBust = (src) => {
        if (src.endsWith(".gif")) {
            const cacheBustSrc = `${src}?t=${Date.now()}`;
            setBookSrc(cacheBustSrc);
        } else {
            setBookSrc(src);
        }
    };

    const renderQuestion = () => {
        const text = ghostQuizData.questions[qIndex].text;
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

    const renderChoices = () => {
        return (
            <>
                {ghostQuizData.questions[qIndex].answers.map(
                    (answer, cIndex) => (
                        <div
                            className="choice"
                            onClick={() => {
                                handleChoiceClick(qIndex, cIndex);
                            }}
                            key={cIndex}
                        >
                            <div className="choice-text">{answer.text}</div>
                        </div>
                    )
                )}
            </>
        );
    };

    // ----- Animations -----
    const [scope, animate] = useAnimate();
    const DEFAULT_DURATION = 0.5;
    const FADE_DURATION = 0.35;

    const choiceAnimationDesktop = async () => {
        await animate(
            ".book-text-container",
            { opacity: 0 },
            { duration: FADE_DURATION }
        );
        setQIndex((prev) => prev + 1);
        setBookSrcWithCacheBust(PAGE_FLIP_GIF_SRC);
        await new Promise((resolve) => setTimeout(resolve, 1100));
        await animate(
            ".book-text-container",
            { opacity: 1 },
            { duration: FADE_DURATION }
        );
    };

    const choiceAnimationMobile = async () => {
        await animate(
            ".quiz-container-mobile",
            { opacity: 0 },
            { duration: FADE_DURATION }
        );
        setQIndex((prev) => prev + 1);
        const nextQIndex = qIndex + 1;
        const nextImgSrc = ghostQuizData.questions[nextQIndex]?.imageSrc;
        if (nextImgSrc) {
            const img = new window.Image();
            img.src = nextImgSrc;
            if (img.decode) {
                await img.decode();
            }
        }
        await animate(
            ".quiz-container-mobile",
            { opacity: 1 },
            { duration: FADE_DURATION }
        );
    };

    const quizOverAnimationMobile = async () => {
        await animate(
            scope.current,
            { opacity: 0 },
            { duration: FADE_DURATION }
        );
        setQuizResult(resultFromScores(scores));
        updateGameState({ quizCompleted: true });
        await animate(
            scope.current,
            { opacity: 1 },
            { duration: DEFAULT_DURATION }
        );
    };

    // ----- Click Handlers -----
    const handleBookClick = async () => {
        if (bookSrc != BOOK_COVER_SRC) return;

        setBookSrcWithCacheBust(OPEN_BOOK_GIF_SRC);

        await animate(
            ".book-img",
            { transform: "translateX(-50%)" },
            { duration: DEFAULT_DURATION }
        );
        // wait gif length - default_duration
        await new Promise((resolve) =>
            setTimeout(resolve, 1100 - DEFAULT_DURATION)
        );

        animate(".book-text-container", { display: "grid" }, { duration: 0 });
        await animate(
            ".book-text-container",
            { opacity: 1 },
            { duration: DEFAULT_DURATION }
        );
        setBookOpen(true);
    };

    const handleChoiceClick = async (question_index, choice_index) => {
        if (!clickable) return;
        setClickable(false);

        const weights =
            ghostQuizData.questions[question_index].answers[choice_index]
                .weights;
        setScores((prevScores) => scoreAnswers(prevScores, weights));

        let quizOver = qIndex + 1 >= ghostQuizData.questions.length;
        if (isMobile) {
            if (quizOver) {
                await quizOverAnimationMobile();
            } else await choiceAnimationMobile();
        } else {
            if (quizOver) {
                // TODO: Make a desktop one
                await quizOverAnimationMobile();
            } else await choiceAnimationDesktop();
        }

        setClickable(true);
    };

    if (!isMobile) {
        if (quizResult) {
            // TODO: REPLACE THIS ENTIRELY
            return (
                <div id="QuizPageMobileResults" ref={scope}>
                    <div className="quiz-result">
                        <div>You're being haunted by a...</div>
                        <div className="result-name">
                            <WaveText intensity="lowMedium">
                                {quizResult.name}
                            </WaveText>
                        </div>
                        <div className="result-description">
                            {quizResult.description}
                        </div>
                        <LinkButton to="/kit">Back to Kit</LinkButton>
                    </div>
                </div>
            );
        } else
            return (
                // Desktop version
                <div id="QuizPage" ref={scope}>
                    <div
                        className={`book-container ${
                            bookSrc == BOOK_COVER_SRC && "closed"
                        }`}
                    >
                        <img
                            draggable={false}
                            className="book-img"
                            src={bookSrc}
                            alt=""
                            style={
                                bookOpen
                                    ? { transform: "translateX(-50%)" }
                                    : { transform: "translateX(-70%)" }
                            }
                            onClick={handleBookClick}
                        />
                        <div
                            className="book-text-container"
                            style={
                                bookOpen
                                    ? {
                                          display: "grid",
                                          opacity: 1,
                                      }
                                    : {
                                          display: "none",
                                          opacity: 0,
                                      }
                            }
                        >
                            <div className="question typewriter">
                                {renderQuestion()}
                            </div>
                            <div className="answer-choices">
                                {renderChoices()}
                            </div>
                        </div>
                    </div>
                </div>
            );
    } else {
        if (quizResult) {
            // Mobile Results
            return (
                <div id="QuizPageMobileResults" ref={scope}>
                    <div className="quiz-result">
                        <div>You're being haunted by a...</div>
                        <div className="result-name">
                            <WaveText intensity="lowMedium">
                                {quizResult.name}
                            </WaveText>
                        </div>
                        <div className="result-description">
                            {quizResult.description}
                        </div>
                        <LinkButton to="/kit">Back to Kit</LinkButton>
                    </div>
                </div>
            );
        }
        return (
            // Mobile Quiz
            <div id="QuizPageMobile" ref={scope}>
                <div className="quiz-container-mobile">
                    <div className="question-number typewriter">
                        Question {qIndex + 1}
                    </div>
                    <div className="question-art">
                        <img
                            src={ghostQuizData.questions[qIndex].imageSrc}
                            alt=""
                        />
                    </div>
                    <div className="question typewriter ">
                        {renderQuestion()}
                    </div>
                    <div className="answer-choices">{renderChoices()}</div>
                </div>
            </div>
        );
    }
};

export default QuizPage;

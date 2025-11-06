import React, { useEffect, useState } from "react";

import ghostQuizData, {
    scoreAnswers,
    resultFromScores,
    computeMaxWeights,
    normalizeScores,
} from "../data/ghostData";
import { motion, AnimatePresence, useAnimate } from "motion/react";
import WaveText from "../components/WaveText";
import { useGameState } from "../context/GameStateContext";
import {
    getShareUrl,
    getResultTitle,
    getResultImageFile,
    downloadUrlAsFile,
} from "../utils/shareUtils";
import LinkButton from "../components/LinkButton";
import { log } from "../firebase";

const BOOK_COVER_SRC = "/images/quiz/book_closed.png";
const BOOK_OPEN_SRC = "/images/quiz/book_open.png";
const OPEN_BOOK_GIF_SRC = "/images/quiz/book_opening.gif"; // 0.11 secs
const PAGE_FLIP_GIF_SRC = "/images/quiz/book_flip.gif"; // 0.06 secs

const QuizPage = () => {
    const { updateGameState } = useGameState();

    // ----- State -----
    const [qIndex, setQIndex] = useState(0); // The current quesiton index
    const [scores, setScores] = useState({}); // Current score data
    const [quizResult, setQuizResult] = useState(); // Quiz result

    // UI State
    const [bookSrc, setBookSrcReal] = useState(BOOK_COVER_SRC); // Book image src
    const [quizStarted, setQuizStarted] = useState(false);
    const [renderBookContent, setRenderBookContent] = useState(false);
    const [choicesClickable, setChoicesClickable] = useState(true);

    // Preloading
    useEffect(() => {
        const imagesToPreload = [BOOK_COVER_SRC, BOOK_OPEN_SRC];
        imagesToPreload.forEach((src) => {
            const img = new window.Image();
            img.src = src;
        });
    }, []);

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

    // ----- UseEffects -----

    // preload the first and next images
    useEffect(() => {
        // current
        preloadImage(ghostQuizData.questions[qIndex]?.imageSrc);
        // next
        preloadImage(ghostQuizData.questions[qIndex + 1]?.imageSrc);
    }, [qIndex]);

    // ----- Helper Functions -----

    const preloadImage = (src) =>
        new Promise((resolve) => {
            if (!src) return resolve();
            const img = new Image();
            img.onload = img.onerror = resolve;
            img.src = src;
            // Optional: img.decode?.().then(resolve).catch(resolve);
        });

    const setBookSrc = async (src) => {
        let finalSrc = src;
        if (src.endsWith(".gif")) {
            finalSrc = `${src}?t=${Date.now()}`;
        }
        // Preload image before setting
        await new Promise((resolve) => {
            const img = new window.Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = finalSrc;
        });
        setBookSrcReal(finalSrc);
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
                            key={`${qIndex}-${cIndex}`}
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
    const FADE_DURATION = 0.55;

    const desktopStartQuizAnimation = async () => {
        await setBookSrc(OPEN_BOOK_GIF_SRC);
        // wait gif length - default_duration
        await new Promise((resolve) =>
            setTimeout(resolve, 1100 - DEFAULT_DURATION)
        );
        setBookSrc(BOOK_OPEN_SRC);
        setRenderBookContent(true);
    };

    const mobileStartQuizAnimation = async () => {
        await setBookSrc(OPEN_BOOK_GIF_SRC);
        // wait gif length - default_duration
        await new Promise((resolve) =>
            setTimeout(resolve, 1100 - DEFAULT_DURATION)
        );
        setBookSrc(BOOK_OPEN_SRC);
        animate(
            ".intro-container .top",
            { opacity: 0 },
            { duration: DEFAULT_DURATION }
        );
        animate(
            ".intro-container .bottom",
            { opacity: 0 },
            { duration: DEFAULT_DURATION }
        );
        await animate(
            ".intro-container .book-img",
            {
                transform: "", // translateX(-80%) removed translateY(-20%) scale(4) bc it looked corny
                opacity: 0,
            },
            { duration: 1 }
        );
        setQuizStarted(true);
        setRenderBookContent(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        await animate(
            ".quiz-container-mobile",
            {
                opacity: 1,
            },
            { duration: 1 }
        );
    };

    const choiceAnimationDesktop = async () => {
        await animate(
            ".book-text-container",
            { opacity: 0 },
            { duration: FADE_DURATION }
        );
        setQIndex((prev) => prev + 1);
        await setBookSrc(PAGE_FLIP_GIF_SRC);
        await new Promise((resolve) => setTimeout(resolve, 600));
        setBookSrc(BOOK_OPEN_SRC);
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
        await animate(
            ".quiz-container-mobile",
            { opacity: 1 },
            { duration: DEFAULT_DURATION }
        );
    };

    const quizOverAnimation = async (finalScores) => {
        setQuizResult(resultFromScores(finalScores));
        updateGameState({ quizCompleted: true });
    };

    // ----- Click Handlers -----
    const mobileStartQuiz = () => {
        if (quizStarted) {
            return;
        }
        mobileStartQuizAnimation();
    };

    const desktopStartQuiz = () => {
        if (quizStarted) {
            return;
        }
        setQuizStarted(true);
        desktopStartQuizAnimation();
    };

    const handleChoiceClick = async (question_index, choice_index) => {
        if (!choicesClickable) return;
        setChoicesClickable(false);

        const weights =
            ghostQuizData.questions[question_index].answers[choice_index]
                .weights;

        // Compute the new totals synchronously
        const nextScores = scoreAnswers(scores, weights);
        setScores(nextScores);

        // TODO: REMOVE DEBUG
        const maxima = computeMaxWeights(ghostQuizData.questions);
        const { nVoice, nTemper } = normalizeScores(nextScores, maxima);
        console.log(
            `[Q${question_index + 1}] voice=${nextScores.voice} temper=${
                nextScores.temper
            } | nVoice=${nVoice.toFixed(3)} nTemper=${nTemper.toFixed(3)}`
        );

        const quizOver = qIndex + 1 >= ghostQuizData.questions.length;
        if (quizOver) {
            await quizOverAnimation(nextScores);
            return;
        }
        if (isMobile) {
            await choiceAnimationMobile();
        } else {
            await choiceAnimationDesktop();
        }

        setChoicesClickable(true);
    };

    const handleShareClick = async () => {
        // Guard
        if (!quizResult) return;

        let canShareFiles = false;

        try {
            const slug = quizResult.id;
            const shareUrl = getShareUrl(slug); // e.g. https://yoursite/share/<slug>
            const resultImgUrl = new URL(
                `/images/quiz/result_art/${slug}.png`,
                window.location.origin
            ).href;

            const title = `I got "${getResultTitle(
                quizResult
            )}" in the Ghost Quiz! 👻`;
            const text = `Take the quiz and see what you get:`;

            if (navigator.share) {
                let files;
                try {
                    const file = await getResultImageFile(
                        resultImgUrl,
                        `${slug}.png`
                    );
                    files = [file];
                } catch {
                    files = undefined; // image fetch failed, share link only
                }

                canShareFiles = !!(
                    files &&
                    navigator.canShare &&
                    navigator.canShare({ files })
                );

                if (canShareFiles) {
                    await navigator.share({
                        title,
                        text,
                        url: shareUrl,
                        files,
                    });
                } else {
                    await navigator.share({ title, text, url: shareUrl });
                }

                // Log after we know the capability
                await log("share_click", {
                    slug,
                    method: canShareFiles
                        ? "web-share-api-with-file"
                        : "web-share-api",
                    hasFile: canShareFiles,
                });

                return;
            }

            // No native share (desktop or older browsers): prefer link copy, then download as last resort
            try {
                await navigator.clipboard?.writeText?.(shareUrl);
                await log("share_click", {
                    slug,
                    method: "clipboard-link",
                    hasFile: false,
                });
                alert("Link copied! Share it anywhere.");
                return;
            } catch {
                // fall through to download
            }

            await downloadUrlAsFile(resultImgUrl, `${slug}.png`);
            await log("share_click", {
                slug,
                method: "download-fallback",
                hasFile: false,
            });
        } catch (err) {
            console.error("Share failed:", err);

            // Last-chance fallback: try to copy link, otherwise try downloading image path (may open in new tab on iOS)
            try {
                const slug = quizResult?.id ?? "result";
                const shareUrl = getShareUrl(slug);
                await navigator.clipboard?.writeText?.(shareUrl);
                alert("Link copied! Share it anywhere.");
            } catch {
                try {
                    const slug = quizResult?.id ?? "result";
                    const fallbackImgUrl = new URL(
                        `/images/quiz/result_art/${slug}.png`,
                        window.location.origin
                    ).href;
                    await downloadUrlAsFile(fallbackImgUrl, `${slug}.png`);
                } catch {}
            }
        }
    };

    // ----- Render -----
    if (quizResult) {
        // Results page
        return (
            <div id="QuizPageResults" ref={scope}>
                <div className="img-container">
                    <img
                        id="quiz-result-img"
                        src={`/images/quiz/result_art/${quizResult.id}.png`}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "/images/quiz/result_art/poltergeist.png";
                        }}
                        alt=""
                    />
                </div>
                <div className="buttons">
                    <LinkButton to="/kit">Back to Kit</LinkButton>
                    <button onClick={handleShareClick}>Share Result</button>
                </div>
            </div>
        );
    } else if (isMobile) {
        // Mobile Quiz
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="intro-container"
                id="QuizPageMobile"
                ref={scope}
            >
                <AnimatePresence>
                    {!quizStarted ? (
                        <>
                            <div className="intro-container">
                                <div className="top">
                                    <div className="title typewriter">
                                        <WaveText intensity="low" noWrap>
                                            Personality Quiz
                                        </WaveText>
                                    </div>
                                    <div className="description">
                                        What kind of spirit will you become when
                                        you die?
                                    </div>
                                </div>
                                <img
                                    className="book-img"
                                    src={bookSrc}
                                    alt=""
                                    onClick={mobileStartQuiz}
                                />

                                <div className="bottom">
                                    {isMobile ? "Tap" : "Click"} the Book to
                                    begin
                                </div>
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="quiz-container-mobile"
                        >
                            <div className="question-number typewriter">
                                {`Question ${qIndex + 1}/${
                                    ghostQuizData.questions.length
                                }`}
                            </div>
                            <div className="question-art">
                                <img
                                    src={
                                        ghostQuizData.questions[qIndex].imageSrc
                                    }
                                    alt=""
                                />
                            </div>
                            <div className="question typewriter ">
                                {renderQuestion()}
                            </div>
                            <div className="answer-choices">
                                {renderChoices()}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    } else {
        // Desktop Quiz
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="intro-container"
                id="QuizPage"
                ref={scope}
            >
                <div className="book-container">
                    <AnimatePresence>
                        {!quizStarted && (
                            <>
                                <motion.div
                                    initial={{ opacity: 1 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="intro-container"
                                >
                                    <div className="top">
                                        <div className="title typewriter">
                                            <WaveText intensity="low" noWrap>
                                                Personality Quiz
                                            </WaveText>
                                        </div>
                                        <div className="description">
                                            What kind of spirit will you become
                                            when you die?
                                        </div>
                                    </div>
                                    <div className="bottom">
                                        Click the Book to begin
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                    <img
                        draggable={false}
                        className={`book-img ${!quizStarted && "hoverable"}`}
                        onClick={desktopStartQuiz}
                        src={bookSrc}
                        style={
                            quizStarted
                                ? {}
                                : {
                                      transform: "translateX(-70%)",
                                  }
                        }
                    />
                    <AnimatePresence>
                        {renderBookContent && (
                            <motion.div
                                key="book-text"
                                className="book-text-container"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="question-number typewriter">
                                    <WaveText intensity="low">
                                        {`Question ${qIndex + 1}/${
                                            ghostQuizData.questions.length
                                        }`}
                                    </WaveText>
                                </div>
                                <div className="question typewriter">
                                    <img
                                        src={
                                            ghostQuizData.questions[qIndex]
                                                .imageSrc
                                        }
                                        alt=""
                                    />
                                    {renderQuestion()}
                                </div>
                                <div className="answer-choices ">
                                    {renderChoices()}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        );
    }
};

export default QuizPage;

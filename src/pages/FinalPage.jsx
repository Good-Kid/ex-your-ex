import React, { useEffect, useState, useRef } from "react";
import { getLetGoCount } from "../firebase";
import { useGameState } from "../context/GameStateContext";
import { Howler } from "howler"; // <- global Howler for enumerating/fading

// Icons
import { FaSpotify, FaYoutube, FaInstagram } from "react-icons/fa";
import LinkButton from "../components/LinkButton";
import GhostLoadingBar from "../components/ghostLoadingBar";
import TarotCardSpread from "../components/FinalPage/TarotCardSpread";

const ICON_SIZE = 50;
const YT_IFRAME_ID = "finalpage-youtube";

// Load YT IFrame API once and resolve when ready
function loadYouTubeAPI() {
    return new Promise((resolve) => {
        if (window.YT && window.YT.Player) return resolve(window.YT);
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);

        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            prev?.();
            resolve(window.YT);
        };
    });
}

// Fade out any playing Howler sounds (safe, best-effort)
function fadeOutAllHowls(ms = 1500) {
    // Howler._howls is "private" but widely used in practice
    const list = Howler?._howls ?? [];
    list.forEach((h) => {
        try {
            if (h.playing()) {
                const from = h.volume();
                // If fade exists on this howl, use it; else just drop volume
                if (typeof h.fade === "function") {
                    h.fade(from, 0, ms);
                } else {
                    h.volume(0);
                }
            }
        } catch (_) {}
    });
}

const calcBarProgress = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 10, 6, 0, 0, 0, 0); // Nov 6
    const target = new Date(now.getFullYear(), 10, 21, 0, 0, 0, 0); // Nov 21

    // If we've passed Nov 21, progress = 1
    if (now >= target) return 1;

    // If it's before Oct 1, progress = 0
    if (now <= start) return 0;

    const progress = (now - start) / (target - start);
    return Math.min(Math.max(progress, 0), 1); // clamp to [0, 1]
};

const FinalPage = ({ style }) => {
    const { gameState } = useGameState();

    const [count, setCount] = useState(0);
    const [showLaylo, setShowLaylo] = useState(false);
    const [barProgress, setBarProgress] = useState(0);
    const ytPlayerRef = useRef(null);

    useEffect;

    useEffect(() => {
        let mounted = true;
        const fetchCount = async () => {
            const val = await getLetGoCount();
            if (mounted) setCount(val);
        };
        fetchCount();
        const interval = setInterval(fetchCount, 5000);

        setBarProgress(calcBarProgress());

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    // Mount Laylo after first paint (so its container is visible)
    useEffect(() => {
        const id = setTimeout(() => setShowLaylo(true), 0);
        return () => clearTimeout(id);
    }, []);

    // Attach YouTube IFrame API to our iframe to catch PLAYING
    useEffect(() => {
        let cancelled = false;
        let player;

        (async () => {
            const YT = await loadYouTubeAPI();
            if (cancelled) return;

            player = new YT.Player(YT_IFRAME_ID, {
                events: {
                    onStateChange: (e) => {
                        if (e?.data === YT.PlayerState.PLAYING) {
                            fadeOutAllHowls(1500);
                        }
                    },
                },
            });

            ytPlayerRef.current = player;
        })();

        return () => {
            cancelled = true;
            try {
                ytPlayerRef.current?.destroy?.();
            } catch {}
            ytPlayerRef.current = null;
        };
    }, []);

    const resultId = gameState.flags?.quizResult?.id
        ? gameState.flags.quizResult.id
        : null;

    // Format count with commas if >= 10000
    const formatCount = (n) =>
        typeof n === "number" && n >= 10000 ? n.toLocaleString() : n;

    // Build a YT URL with enablejsapi=1 & origin to satisfy the IFrame API
    const youtubeSrc = new URL("https://www.youtube.com/embed/pqbeMEHvadE");
    youtubeSrc.searchParams.set("enablejsapi", "1");
    youtubeSrc.searchParams.set("origin", window.location.origin);
    youtubeSrc.searchParams.set("rel", "0");
    youtubeSrc.searchParams.set("modestbranding", "1");
    youtubeSrc.searchParams.set("playsinline", "1");
    youtubeSrc.searchParams.set("si", "sZzmJsqha_A_AUuZ"); // keep your existing param if you want

    return (
        <div id="FinalPage" style={style}>
            <h1 className="typewriter">Final Results</h1>

            <div className="spirit-released typewriter">
                <span className="">
                    You released spirit{" "}
                    <span className="num">
                        #
                        {formatCount(
                            gameState?.flags?.soulReleased
                                ? gameState.flags.soulReleased
                                : count
                        )}
                    </span>
                </span>
                <div>
                    <span className="total">{formatCount(count)}</span>
                    <span> spirits have been released so far</span>
                </div>
                <GhostLoadingBar progress={barProgress} />
            </div>

            <hr />

            <div className="song-preview-container">
                <div className="text">
                    <h3 className="rift-title typewriter">RIFT</h3>
                    <span>Listen to the teaser</span>
                </div>

                {/* IMPORTANT: give the iframe a stable id and enablejsapi=1 + origin */}
                <iframe
                    id={YT_IFRAME_ID}
                    className="youtube"
                    width="100%"
                    height="auto"
                    src={youtubeSrc.toString()}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                />

                <div className="text">Presave here</div>
                <div className="laylo-container">
                    {showLaylo && (
                        <iframe
                            id="laylo-drop-f1a526de-0264-47bc-a2b2-257e19be0c67"
                            title="Laylo Drop"
                            loading="lazy"
                            frameBorder="0"
                            scrolling="no"
                            allow="web-share"
                            // If the SDK needs this exact casing, mirror it; otherwise React warns—lowercase also works:
                            // allowtransparency="true"
                            style={{
                                zIndex: 99999,
                                width: "100%",
                                height: 180, // explicit height so it never collapses
                                backgroundColor: "black",
                                display: "block",
                            }}
                            src="https://embed.laylo.com?dropId=f1a526de-0264-47bc-a2b2-257e19be0c67&color=ffffff&minimal=false&theme=dark&background=translucent&customTitle=PRESAVE%20%22RIFT%22"
                        />
                    )}
                </div>
            </div>

            <hr />

            {resultId && (
                <>
                    <div className="quiz-result">
                        <h3 className="typewriter">Quiz Result</h3>
                        <img
                            src={`/images/quiz/result_art/${resultId}.png`}
                            alt=""
                        />
                        <LinkButton to="/quiz">Take Again</LinkButton>
                    </div>
                    <hr />
                </>
            )}

            {gameState.flags?.tarotLastDrawnCards && (
                <>
                    <div className="tarot-result">
                        <h3 className="typewriter">Last Tarot Draw</h3>
                        <TarotCardSpread />
                        <LinkButton to="/tarot">Draw Again</LinkButton>
                    </div>
                    <hr />
                </>
            )}

            <div className="good-kid-socials">
                <img
                    className="gk-logo"
                    src="/images/goodkidlogo.webp"
                    alt="Good Kid"
                />
                <div className="social-text">
                    <span>Check out Good Kid on socials</span>
                    <span>for more music and projects</span>
                </div>
                <div className="social-buttons">
                    <a
                        href="https://open.spotify.com/artist/38SKxCyfrmNWqWunb9wGHP"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Good Kid on Spotify"
                    >
                        <FaSpotify size={ICON_SIZE} />
                    </a>
                    <a
                        href="https://www.youtube.com/@GoodKidband"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Good Kid on YouTube"
                    >
                        <FaYoutube size={ICON_SIZE} />
                    </a>
                    <a
                        href="https://www.instagram.com/goodkidband"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Good Kid on Instagram"
                    >
                        <FaInstagram size={ICON_SIZE} />
                    </a>
                </div>
            </div>

            <hr />

            <div className="symbol">
                <LinkButton to="/kit">Return to Kit</LinkButton>
                <img draggable={false} src="/images/symbol.webp" alt="" />
            </div>
        </div>
    );
};

export default FinalPage;

// KitPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Howl } from "howler";
import { useLocation } from "react-router-dom";

import { preloadImages } from "../utils/preloadAll";
import { useGameState } from "../context/GameStateContext";
import OuijaMenu from "../components/KitPage/OuijaMenu";
import ItemModal from "../components/KitPage/ItemModal";
import WaveText from "../components/WaveText";

// ------------------ Constants ------------------

const SOUND_TIMING = {
    THUMP_DELAY: 950,
    OUIJA_DELAY: 2400,
    BOX_OPEN_DELAY: 500,
};

const GLOW_OPACITY = {
    HIDDEN: "0",
    VISIBLE: "1",
    HOVERED: "0.8",
};

const itemDefinitions = {
    candles: {
        name: "Ritual Candles",
        description:
            "Ancient candles used in summoning rituals. Their flickering flames guide spirits from the other side.",
        imageSrc: "images/kit/full/candles.png",
        maxWidth: 300,
    },
    book: {
        name: "Grimoire",
        description:
            "A leather-bound tome used to identify what spirit one will become when they die.",
        imageSrc: "images/kit/full/book.png",
        maxWidth: 400,
        inspectLink: "/quiz",
    },
    skull: {
        name: "Beast Skull",
        description: "A myserious curio consulted in times of need",
        imageSrc: "images/kit/full/skull.png",
        maxWidth: 350,
        rotation: 0,
    },
    lighter: {
        name: "Silver Lighter",
        description: "An antique lighter. It is out of fuel.",
        imageSrc: "images/kit/full/lighter.png",
        maxHeight: 350,
        maxWidth: 150,
        rotation: -15,
    },
    knife: {
        name: "Ritual Dagger",
        description:
            "A ceremonial blade used in ancient rituals. Its edge remains eternally sharp.",
        imageSrc: "images/kit/full/knife.png",
        rotation: -45,
        maxHeight: 400,
        inspectLink: "/knife",
    },
    bottle: {
        name: "Empty Bottle",
        description: "A small plastic bottle. It is currently empty.",
        imageSrc: "images/kit/full/bottle.png",
        maxWidth: 220,
        rotation: 8,
    },
    note: {
        name: "Ancient Parchment",
        description:
            "A mysterious note written in an unknown language that seems to shift when you're not looking.",
        imageSrc: "images/kit/full/note.png",
        maxHeight: 500,
        maxWidth: 500,
    },
    cassette: {
        name: "Cassette Tape",
        description:
            "A cassette tape that contains audio imperative to the ritual.",
        imageSrc: "images/kit/full/cassette.png",
        maxWidth: 400,
    },
    cards: {
        name: "Tarot Cards",
        description:
            "A deck of tarot cards used to divine the future and communicate with spirits.",
        imageSrc: "images/kit/full/cards.png",
        maxHeight: 360,
        inspectLink: "/tarot",
        noFloat: true,
    },
};

// ------------------ Helpers ------------------

const setupHitPathInteraction = (path, group, glow, onClick) => {
    path.setAttribute("fill", "#000");
    path.setAttribute("fill-opacity", "0.001");
    path.style.pointerEvents = "all";
    path.style.cursor = "pointer";

    const enter = () => {
        if (glow) glow.style.opacity = GLOW_OPACITY.HOVERED;
    };
    const leave = () => {
        if (glow) glow.style.opacity = GLOW_OPACITY.HIDDEN;
    };
    const click = () => onClick?.();

    path.addEventListener("pointerenter", enter);
    path.addEventListener("pointerleave", leave);
    path.addEventListener("click", click);

    return () => {
        path.removeEventListener("pointerenter", enter);
        path.removeEventListener("pointerleave", leave);
        path.removeEventListener("click", click);
    };
};

const playSound = (src, volume = 1.0) => new Howl({ src: [src], volume });

// ------------------ Component ------------------
export default function KitPage() {
    const location = useLocation();
    const { gameState, updateGameState } = useGameState();
    const [ready, setReady] = useState(false);

    const [playIntroAnim, setPlayIntroAnim] = useState(
        () => !gameState.flags.kitIntroPlayed
    );
    const [ouijaVisible, setOuijaVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // refs for stage/svg and whisper layer
    const svgRef = useRef(null);
    const whisperLayerRef = useRef(null);

    // whisper state (only one at a time)
    const [whisper, setWhisper] = useState(null); // { key, text, x, y }
    const whisperHowlRef = useRef(
        new Howl({ src: ["/sounds/whisper1.mp3"], volume: 0.4 })
    );
    const whisperTimeoutRef = useRef(null);

    // ------------------ Preload ------------------

    // Decode all images before showing the stage to avoid pop-in
    useEffect(() => {
        const MENU_ASSETS = [
            "images/kit/menu/background.png",
            "images/kit/menu/candles_glow.png",
            "images/kit/menu/candles_normal.png",
            "images/kit/menu/book_glow.png",
            "images/kit/menu/book_normal.png",
            "images/kit/menu/skull_glow.png",
            "images/kit/menu/skull_normal.png",
            "images/kit/menu/lighter_glow.png",
            "images/kit/menu/lighter_normal.png",
            "images/kit/menu/knife_glow.png",
            "images/kit/menu/knife_normal.png",
            "images/kit/menu/bottle_glow.png",
            "images/kit/menu/bottle_normal.png",
            "images/kit/menu/note_glow.png",
            "images/kit/menu/note_normal.png",
            "images/kit/menu/cassette_glow.png",
            "images/kit/menu/cassette_normal.png",
            "images/kit/menu/cards_glow.png",
            "images/kit/menu/cards_normal.png",
            // full item art used in modal:
            ...Object.values(itemDefinitions).map((i) => i.imageSrc),
        ];

        let cancelled = false;
        (async () => {
            await preloadImages(MENU_ASSETS);
            if (!cancelled) setReady(true);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // ------------------ Intro SFX ------------------
    useEffect(() => {
        if (!playIntroAnim) return;

        const thumpSound = playSound("/sounds/thumps.mp3");
        const soundTimer = setTimeout(
            () => thumpSound.play(),
            SOUND_TIMING.THUMP_DELAY
        );
        const ouijaTimer = setTimeout(
            () => setOuijaVisible(true),
            SOUND_TIMING.OUIJA_DELAY
        );

        return () => {
            clearTimeout(soundTimer);
            clearTimeout(ouijaTimer);
        };
    }, [location, playIntroAnim]);

    const openBoxHandler = () => {
        const latchSound = playSound("/sounds/latch.mp3");
        setOuijaVisible(false);

        setTimeout(() => {
            setPlayIntroAnim(false);
            latchSound.play();
            updateGameState({
                flags: { ...gameState.flags, kitIntroPlayed: true },
            });
        }, SOUND_TIMING.BOX_OPEN_DELAY);
    };

    // ------------------ Skull whisper spawn ------------------

    const spawnSkullWhispers = useCallback(() => {
        const getSkullWhisper = () => {
            let whisper_pool = [
                "listen...",
                "the veil thins...",
                "something watches...",
                "release your sadness...",
            ];

            //not bottleCollected
            if (!gameState?.flags?.bottleCollected) {
                whisper_pool = whisper_pool.concat([
                    "the bottle must be filled...",
                    "you deny the knife it's purpose...",
                ]);
            }
            //not tarotIntroPlayed
            if (!gameState?.flags?.tarotIntroPlayed) {
                whisper_pool = whisper_pool.concat([
                    "consult the cards...",
                    "seek the tarot...",
                ]);
            }

            return whisper_pool[
                Math.floor(Math.random() * whisper_pool.length)
            ];
        };

        // prevent overlapping whispers
        if (whisper) return;

        const svg = svgRef.current;
        const layer = whisperLayerRef.current;
        if (!svg || !layer) return;

        // get skull anchor rect (prefer hit path, else group)
        const skullHit = svg.querySelector("#skull_hit_path");
        const skullGroup = svg.querySelector("#skull");
        const target = skullHit || skullGroup;
        if (!target) return;

        // SVG space -> screen rect
        const skullRect = target.getBoundingClientRect();
        const layerRect = layer.getBoundingClientRect();

        // position the whisper above the skull
        const x = skullRect.left + skullRect.width / 2 - layerRect.left;
        const y = skullRect.top - layerRect.top - 40; // top of skull

        // choose text
        const text = getSkullWhisper(gameState);

        // show whisper and play sound
        setWhisper({ key: Date.now(), text, x, y });
        whisperHowlRef.current.play();

        // auto-clear after CSS animation (keep in sync with CSS duration)
        clearTimeout(whisperTimeoutRef.current);
        whisperTimeoutRef.current = setTimeout(() => setWhisper(null), 2400);
    }, [gameState, whisper]);

    useEffect(() => {
        return () => clearTimeout(whisperTimeoutRef.current);
    }, []);

    // ------------------ SVG interactions wiring ------------------
    useEffect(() => {
        if (playIntroAnim || !ready) return;

        const svg = svgRef.current;
        if (!svg) return;

        const disposers = [];

        const handleItemClick = (itemId) => {
            // skull -> whisper
            if (itemId === "skull") {
                spawnSkullWhispers();
                return;
            }

            const def = itemDefinitions[itemId] || {
                name: itemId.charAt(0).toUpperCase() + itemId.slice(1),
                description: "A mysterious item from the spirit realm.",
                imageSrc: `images/kit/full/${itemId}.png`,
            };

            console.log(gameState);
            console.log(itemId);

            if (itemId == "bottle" && gameState.flags.bottleCollected) {
                def.name = "Bottle of Tears";
                def.imageSrc = `images/kit/full/${itemId}_full.png`;
                def.description =
                    "A bottle filled with your tears, ready for use in the ritual.";
            }

            setSelectedItem({
                id: itemId,
                name: def.name,
                description: def.description,
                imageSrc: def.imageSrc,
                maxWidth: def.maxWidth,
                maxHeight: def.maxHeight,
                rotation: def.rotation,
                inspectLink: def.inspectLink,
                noFloat: def.noFloat,
            });
        };

        // attach to all *_hit_path
        const hitPaths = Array.from(svg.querySelectorAll('[id$="_hit_path"]'));
        hitPaths.forEach((path) => {
            const group = path.closest("g");
            if (!group) return;
            const glow = group.querySelector('image[id$="_glow"]');
            const itemId = group.id;

            const dispose = setupHitPathInteraction(path, group, glow, () =>
                handleItemClick(itemId)
            );
            disposers.push(dispose);
        });

        const onSvgLeave = () => {
            svg.querySelectorAll('image[id$="_glow"]').forEach(
                (el) => (el.style.opacity = GLOW_OPACITY.HIDDEN)
            );
        };
        svg.addEventListener("pointerleave", onSvgLeave);

        return () => {
            svg.removeEventListener("pointerleave", onSvgLeave);
            disposers.forEach((d) => d && d());
        };
    }, [playIntroAnim, spawnSkullWhispers, gameState, ready]);

    // ------------------ Render ------------------
    if (!ready) {
        return <div className="loading"></div>;
    } else
        return (
            <div id="KitPage" className="kitpage-root">
                {/* Intro menu & falling image */}
                {playIntroAnim ? (
                    <>
                        <OuijaMenu
                            visible={ouijaVisible}
                            onClickHandler={openBoxHandler}
                        />
                        <img
                            className="kit falling"
                            src="images/kit/kitclosed.png"
                            alt=""
                        />
                    </>
                ) : (
                    <div className="kit-canvas">
                        {/* SVG stage */}
                        <svg
                            ref={svgRef}
                            id="stage"
                            xmlns="http://www.w3.org/2000/svg"
                            width="602.88"
                            height="550.8"
                            viewBox="0 0 602.88 550.8"
                            className="kit-svg"
                        >
                            <defs>
                                <style>
                                    {`.cls-1 { fill: none; }
                  [id$="_normal"] { 
                    opacity: 1; 
                    pointer-events: none;
                  }
                  [id$="_glow"] { 
                    opacity: 0; 
                    transition: opacity 0.2s ease;
                    pointer-events: none;
                  }`}
                                </style>
                            </defs>

                            <g id="background">
                                <image
                                    id="background_img"
                                    width="2438"
                                    height="2295"
                                    transform="translate(10.56) scale(.24)"
                                    href="images/kit/menu/background.png"
                                />
                            </g>

                            <g id="candles">
                                <image
                                    id="candles_glow"
                                    width="718"
                                    height="315"
                                    transform="translate(34.08 349.92) scale(.24)"
                                    href="images/kit/menu/candles_glow.png"
                                />
                                <image
                                    id="candles_normal"
                                    width="522"
                                    height="218"
                                    transform="translate(57.359 373.554) scale(.24)"
                                    href="images/kit/menu/candles_normal.png"
                                />
                                <polygon
                                    id="candles_hit_path"
                                    className="cls-1"
                                    points="169.466 425.184 182.61 385.819 180.452 384.255 178.44 382.868 177.332 381.111 176.038 381.503 173.259 382.353 171.624 383.073 169.466 384.255 149.064 424.792 137.621 425.184 160.115 382.811 160.769 379.084 157.304 375.749 149.195 375.749 113.492 425.184 109.7 424.922 131.54 378.626 130.428 377.122 125.72 376.076 120.293 376.403 84.328 425.772 82.628 425.772 110.092 380.784 108.392 377.907 103.684 374.637 99.76 373.656 57.387 425.249 169.466 425.184"
                                />
                            </g>

                            <g id="book">
                                <image
                                    id="book_glow"
                                    width="1196"
                                    height="487"
                                    transform="translate(188.4 314.64) scale(.24)"
                                    href="images/kit/menu/book_glow.png"
                                />
                                <image
                                    id="book_normal"
                                    width="999"
                                    height="371"
                                    transform="translate(212.16 339.6) scale(.24)"
                                    href="images/kit/menu/book_normal.png"
                                />
                                <polyline
                                    id="book_hit_path"
                                    className="cls-1"
                                    points="451.92 428.64 410.105 349.794 392.464 348.675 396.96 356.169 396.96 357.869 394.019 361.466 393.104 364.278 390.88 366.043 389.507 368.332 388.395 372.125 386.892 374.609 385.322 375.198 385.257 378.925 384.08 381.998 380.549 384.222 375.056 383.241 372.179 385.072 365.836 384.876 361.847 381.998 359.558 377.944 358.12 374.217 357.858 371.863 357.204 372.255 356.812 384.549 354.916 386.903 351.188 387.622 347.069 385.53 340.072 385.399 329.61 385.987 313.066 385.856 301.44 383.502 286.518 378.075 279.978 374.675 273.374 365.651 266.116 365.062 261.146 360.616 258.334 355.254 257.52 349.892 260.361 349.892 261.735 347.996 264.481 347.603 264.743 345.315 260.885 344.922 259.119 343.614 261.408 340.083 237.851 339.871 235.104 341.211 212.16 426.219 355.357 427.592 451.92 428.64"
                                />
                            </g>

                            <g id="skull">
                                <image
                                    id="skull_glow"
                                    width="780"
                                    height="468"
                                    transform="translate(233.52 300.72) scale(.24)"
                                    href="images/kit/menu/skull_glow.png"
                                />
                                <image
                                    id="skull_normal"
                                    width="581"
                                    height="264"
                                    transform="translate(257.52 325.68) scale(.24)"
                                    href="images/kit/menu/skull_normal.png"
                                />
                                <path
                                    id="skull_hit_path"
                                    className="cls-1"
                                    d="M357.204,372.255l-.392,12.293-1.896,2.354-3.727.719-4.12-2.092-6.997-.131-10.462.589-16.544-.131-11.626-2.354-14.922-5.427-6.539-3.4-6.604-9.024-7.258-.589-4.97-4.447-2.812-5.362-.814-5.362h2.841l1.373-1.896,2.746-.392.262-2.289-3.858-.392-1.766-1.308,2.289-3.531,4.054-3.531,5.885-4.316,8.043-2.485,6.474-3.27h9.743l3.989,1.242,7.062.327,7.193-1.569,10.397-.802h12.424l7.781.868,11.77,2.55,7.847,2.223,5.558.85,8.435,3.531,6.474,3.596,4.97,5.1,4.25,6.147,3.203,5.624v1.7l-2.941,3.596-.915,2.812-2.223,1.766-1.373,2.289-1.112,3.793-1.504,2.485-1.569.589-.065,3.727-1.177,3.073-3.531,2.223-1.962-.262-3.531-.719s-2.485,1.7-2.877,1.831-6.343-.196-6.343-.196l-3.989-2.877-2.289-4.054-1.439-3.727-.262-2.354-.654.392Z"
                                />
                            </g>

                            <g id="lighter">
                                <image
                                    id="lighter_glow"
                                    width="344"
                                    height="405"
                                    transform="translate(162.72 312.72) scale(.24)"
                                    href="images/kit/menu/lighter_glow.png"
                                />
                                <image
                                    id="lighter_normal"
                                    width="140"
                                    height="198"
                                    transform="translate(186.96 337.44) scale(.24)"
                                    href="images/kit/menu/lighter_normal.png"
                                />
                                <polygon
                                    id="lighter_hit_path"
                                    className="cls-1"
                                    points="189.691 384.418 216.632 384.96 218.855 383.568 220.56 352.442 219.901 351.592 220.097 347.799 218.92 346.099 219.313 344.072 219.77 342.11 219.247 340.149 216.632 338.383 213.624 338.383 212.16 339.233 212.16 337.44 198.976 337.44 199.107 341.914 198.388 341.26 197.015 340.999 196.426 340.214 193.026 340.28 190.018 342.961 189.691 348.388 190.541 349.565 189.102 350.807 186.96 380.821 188.645 381.345 189.102 383.306 189.691 384.418"
                                />
                            </g>

                            <g id="knife">
                                <image
                                    id="knife_glow"
                                    width="310"
                                    height="440"
                                    transform="translate(431.28 340.08) scale(.24)"
                                    href="images/kit/menu/knife_glow.png"
                                />
                                <image
                                    id="knife_normal"
                                    width="111"
                                    height="242"
                                    transform="translate(455.04 364.08) scale(.24)"
                                    href="images/kit/menu/knife_normal.png"
                                />
                                <polygon
                                    id="knife_hit_path"
                                    className="cls-1"
                                    points="475.315 396.417 477.931 388.112 480.285 379.35 481.266 375.84 481.68 371.83 478.498 367.776 473.877 364.637 470.28 364.08 463.872 365.357 459.949 371.503 458.837 379.023 458.249 384.908 458.249 390.27 459.556 394.39 458.249 395.502 456.091 396.155 455.04 397.92 455.502 401.321 460.603 404.525 470.28 422.16 473.681 419.107 476.231 410.803 476.689 406.029 478.454 405.245 479.762 404.656 480.416 403.545 480.939 402.825 480.416 400.994 479.304 399.36 475.315 396.417"
                                />
                            </g>

                            <g id="bottle">
                                <image
                                    id="bottle_glow"
                                    width="346"
                                    height="385"
                                    transform="translate(396 329.52) scale(.24)"
                                    href="images/kit/menu/bottle_glow.png"
                                />
                                <image
                                    id="bottle_normal"
                                    width="145"
                                    height="184"
                                    transform="translate(419.76 353.76) scale(.24)"
                                    href={
                                        gameState.flags.bottleCollected
                                            ? "images/kit/menu/full_bottle_normal.png"
                                            : "images/kit/menu/bottle_normal.png"
                                    }
                                />
                                <polygon
                                    id="bottle_hit_path"
                                    className="cls-1"
                                    points="449.486 394.553 450.124 372.386 450.467 367.825 454.56 366.305 454.56 358.654 447.279 355.515 443.928 355.434 432.746 354.976 425.815 354.976 422.088 356.48 420.453 358.36 419.833 363.058 423.052 366.109 422.954 379.154 427.809 386.854 434.185 397.545 439.285 397.545 445.221 397.07 449.486 394.553"
                                />
                            </g>

                            <g id="note">
                                <image
                                    id="note_glow"
                                    width="808"
                                    height="438"
                                    transform="translate(200.388 43.157) scale(.24)"
                                    href="images/kit/menu/note_glow.png"
                                />
                                <image
                                    id="note_normal"
                                    width="603"
                                    height="231"
                                    transform="translate(224.628 67.877) scale(.24)"
                                    href="images/kit/menu/note_normal.png"
                                />
                                <path
                                    id="note_hit_path"
                                    className="cls-1"
                                    d="M367.447,123.274l.343-48.65-46.002.589-25.551-.589-8.337-1.7-11.247-1.177s-11.362-.147-11.623,0-7.520-.572-7.520-.572l-6.67-2.158-11.901-.392h-11.051l-.719,1.308-2.092,1.177,1.308,25.568.262,10.528-.392,11.77,99.916,3.27,41.278,1.03Z"
                                />
                            </g>

                            <g id="cassette">
                                <image
                                    id="cassette_glow"
                                    width="480"
                                    height="295"
                                    transform="translate(364.505 54.023) scale(.24)"
                                    href="images/kit/menu/cassette_glow.png"
                                />
                                <image
                                    id="cassette_normal"
                                    width="278"
                                    height="190"
                                    transform="translate(388.745 78.743) scale(.24)"
                                    href="images/kit/menu/cassette_normal.png"
                                />
                                <polygon
                                    id="cassette_hit_path"
                                    className="cls-1"
                                    points="450.133 123.699 454.546 83.484 453.664 81.620 452.339 80.541 421.492 79.757 405.013 79.266 394.420 78.743 393.047 80.051 392.458 81.424 388.745 123.307 450.133 123.699"
                                />
                            </g>

                            <g id="cards">
                                <image
                                    id="cards_glow"
                                    width="476"
                                    height="416"
                                    transform="translate(120.678 40.681) scale(.228)"
                                    href="images/kit/menu/cards_glow.png"
                                />
                                <image
                                    id="cards_normal"
                                    width="269"
                                    height="235"
                                    transform="translate(143.724 64.406) scale(.228)"
                                    href="images/kit/menu/cards_normal.png"
                                />
                                <path
                                    id="cards_hit_path"
                                    className="cls-1"
                                    d="M204.298,117.895l.435-50.728s-5.221-.183-5.202-.229,0-2.345,0-2.345l-16.069,1.228s-9.089.163-9.253.196-19.682-.523-19.682-.523v3.237l-5.068.163.327,3.498-5.885,1.046,7.324,42.798,53.074,1.658"
                                />
                            </g>
                        </svg>

                        {/* Whisper layer (absolute over the SVG) */}
                        <div
                            ref={whisperLayerRef}
                            className="skull-whisper-layer"
                        >
                            {whisper && (
                                <span
                                    key={whisper.key}
                                    className="skull-whisper"
                                    style={{
                                        left: `${whisper.x}px`,
                                        top: `${whisper.y}px`,
                                    }}
                                    onAnimationEnd={() => setWhisper(null)}
                                >
                                    <WaveText intensity="lowMedium">
                                        {whisper.text}
                                    </WaveText>
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <ItemModal
                    selectedItem={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            </div>
        );
}

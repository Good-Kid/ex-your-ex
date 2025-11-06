const imageList = [
    // homepage [commented because this page is visited before preload]
    // "/images/homepage/flame.gif",
    // "/images/homepage/candle.png",
    // "/images/homepage/phone.png",
    // "/images/homepage/phoneanswered.png",

    // kit/full
    "/images/kit/full/candles.png",
    "/images/kit/full/book.png",
    "/images/kit/full/skull.png",
    "/images/kit/full/lighter.png",
    "/images/kit/full/knife.png",
    "/images/kit/full/bottle.png",
    "/images/kit/full/note.png",
    "/images/kit/full/cassette.png",
    "/images/kit/full/tarot.png",
    "/images/kit/full/bottle_full.png",

    // kit/menu
    "/images/kit/menu/background.png",
    "/images/kit/menu/candles_glow.png",
    "/images/kit/menu/candles_normal.png",
    "/images/kit/menu/book_glow.png",
    "/images/kit/menu/book_normal.png",
    "/images/kit/menu/skull_glow.png",
    "/images/kit/menu/skull_normal.png",
    "/images/kit/menu/lighter_glow.png",
    "/images/kit/menu/lighter_normal.png",
    "/images/kit/menu/knife_glow.png",
    "/images/kit/menu/knife_normal.png",
    "/images/kit/menu/bottle_glow.png",
    "/images/kit/menu/bottle_normal.png",
    "/images/kit/menu/full_bottle_normal.png",
    "/images/kit/menu/note_glow.png",
    "/images/kit/menu/note_normal.png",
    "/images/kit/menu/cassette_glow.png",
    "/images/kit/menu/cassette_normal.png",
    "/images/kit/menu/cards_glow.png",
    "/images/kit/menu/cards_normal.png",

    // kit
    "/images/kit/kitclosed.png",

    // knife/bottle
    "/images/knife/bottle/bottle01.png",
    "/images/knife/bottle/bottle02.png",
    "/images/knife/bottle/bottle03.png",
    "/images/knife/bottle/bottle04.png",
    "/images/knife/bottle/bottle05.png",
    "/images/knife/bottle/bottle06.png",
    "/images/knife/bottle/bottle07.png",

    // knife/onion
    "/images/knife/onion/onionchop00.png",
    "/images/knife/onion/onionchop01.png",
    "/images/knife/onion/onionchop02.png",
    "/images/knife/onion/onionchop03.png",
    "/images/knife/onion/onionchop04.png",
    "/images/knife/onion/onionchop05.png",
    "/images/knife/onion/onionchop06.png",
    "/images/knife/onion/onionchop07.png",

    // quiz
    "/images/quiz/book_closed.png",
    "/images/quiz/book_open.png",
    "/images/quiz/book_opening.gif",
    "/images/quiz/book_flip.gif",
];

let imagesPreloaded =
    (typeof window !== "undefined" &&
        sessionStorage.getItem("imagesPreloaded") === "1") ||
    false;

export function hasPreloadedImages() {
    return imagesPreloaded;
}

export async function preloadImages() {
    if (imagesPreloaded) return { already: true };

    await Promise.all(
        imageList.map(
            (src) =>
                new Promise((resolve) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = img.onerror = resolve; // cache hits will resolve fast
                })
        )
    );

    imagesPreloaded = true;

    sessionStorage.setItem("imagesPreloaded", "1");

    return { already: false };
}

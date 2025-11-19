const kitItemDefinitions = {
    cards: {
        name: "Tarot Cards",
        description:
            "Consult the cards to gain insight on your past, present, and future.",
        imageSrc: "/images/kit/full/tarot.webp",
        smallImageSrc: "/images/kit/small/tarot.webp",
        maxHeight: 360,
        inspectLink: "/tarot",
    },
    note: {
        name: "Note",
        description:
            "A mysterious note included with the kit. it has some pretty useful info!",
        imageSrc: "/images/kit/full/note.webp",
        maxHeight: 500,
        maxWidth: 500,
    },
    book: {
        name: "Grimoire",
        description:
            "Find out what awaits you in the afterlife by taking a walk through a mysterious house in the woods.",
        imageSrc: "/images/kit/full/book.webp",
        smallImageSrc: "/images/kit/small/book.webp",
        maxWidth: 400,
        inspectLink: "/quiz",
    },
    lighter: {
        name: "Silver Lighter",
        description:
            "An antique lighter. Used to light the candles during the ritual.",
        imageSrc: "/images/kit/full/lighter.webp",
        smallImageSrc: "/images/kit/small/lighter.webp",
        maxHeight: 350,
        maxWidth: 150,
        rotation: -15,
    },
    skull: {
        name: "Beast Skull",
        description: "A myserious curio consulted in times of need",
        imageSrc: "/images/kit/full/skull.webp",
        maxWidth: 350,
        rotation: 0,
    },
    knife: {
        name: "Ritual Dagger",
        description:
            "A ceremonial blade used in rituals. Its edge is very sharp.",
        imageSrc: "/images/kit/full/knife.webp",
        smallImageSrc: "/images/kit/small/knife.webp",
        rotation: -45,
        maxHeight: 400,
        inspectLink: "/knife",
    },
    cassette: {
        name: "Cassette Tape",
        description:
            "A cassette tape that contains audio imperative to the ritual.",
        imageSrc: "/images/kit/full/cassette.webp",
        smallImageSrc: "/images/kit/small/cassette.webp",
        maxWidth: 400,
        inspectLink: "/cassette",
    },
    bottle: {
        name: "Empty Bottle",
        description: "A small glass dropper bottle. It is currently empty.",
        imageSrc: "/images/kit/full/bottle.webp",
        smallImageSrc: "/images/kit/small/bottle.webp",
        maxHeight: 350,
        rotation: 8,
    },
    candles: {
        name: "Ritual Candles",
        description: "Basic candles used in summoning rituals.",
        imageSrc: "/images/kit/full/candles.webp",
        smallImageSrc: "/images/kit/small/candles.webp",
        maxWidth: 300,
    },
};

export default kitItemDefinitions;

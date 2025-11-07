const kitItemDefinitions = {
    cards: {
        name: "Tarot Cards",
        description:
            "Consult the cards to gain insight on your past, present, and future.",
        imageSrc: "/images/kit/full/tarot.png",
        smallImageSrc: "/images/kit/small/tarot.png",
        maxHeight: 360,
        inspectLink: "/tarot",
        noFloat: true,
    },
    note: {
        name: "Note",
        description:
            "A mysterious note included with the kit. it has some pretty useful info!",
        imageSrc: "/images/kit/full/note.png",
        maxHeight: 500,
        maxWidth: 500,
    },
    book: {
        name: "Grimoire",
        description:
            "Find out what awaits you in the afterlife by taking a walk through a mysterious house in the woods.",
        imageSrc: "/images/kit/full/book.png",
        smallImageSrc: "/images/kit/small/book.png",
        maxWidth: 400,
        inspectLink: "/quiz",
    },
    lighter: {
        name: "Silver Lighter",
        description:
            "An antique lighter. Used to light the candles during the ritual.",
        imageSrc: "/images/kit/full/lighter.png",
        smallImageSrc: "/images/kit/small/lighter.png",
        maxHeight: 350,
        maxWidth: 150,
        rotation: -15,
    },
    skull: {
        name: "Beast Skull",
        description: "A myserious curio consulted in times of need",
        imageSrc: "/images/kit/full/skull.png",
        maxWidth: 350,
        rotation: 0,
    },
    knife: {
        name: "Ritual Dagger",
        description:
            "A ceremonial blade used in rituals. Its edge is very sharp.",
        imageSrc: "/images/kit/full/knife.png",
        smallImageSrc: "/images/kit/small/knife.png",
        rotation: -45,
        maxHeight: 400,
        inspectLink: "/knife",
    },
    cassette: {
        name: "Cassette Tape",
        description:
            "A cassette tape that contains audio imperative to the ritual.",
        imageSrc: "/images/kit/full/cassette.png",
        smallImageSrc: "/images/kit/small/cassette.png",
        maxWidth: 400,
        inspectLink: "/cassette",
    },
    bottle: {
        name: "Empty Bottle",
        description: "A small glass dropper bottle. It is currently empty.",
        imageSrc: "/images/kit/full/bottle.png",
        smallImageSrc: "/images/kit/small/bottle.png",
        maxHeight: 350,
        rotation: 8,
    },
    candles: {
        name: "Ritual Candles",
        description: "Basic candles used in summoning rituals.",
        imageSrc: "/images/kit/full/candles.png",
        smallImageSrc: "/images/kit/small/candles.png",
        maxWidth: 300,
    },
};

export default kitItemDefinitions;

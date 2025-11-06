// src/data/ghostQuizData.js

/*
  2-AXIS QUIZ OVERVIEW

  Axis "voice"   → Quiet (-)  ↔  Loud (+)
  Axis "temper"  → Peaceful (-) ↔  Vengeful (+)

  We produce 16 outcomes by splitting each axis into 4 bands (4×4 grid).
*/

const ghostQuizData = {
    axes: {
        voice: { name: "Quiet–Loud", min: "Quiet", max: "Loud" },
        temper: { name: "Peaceful–Vengeful", min: "Peaceful", max: "Vengeful" },
    },

    // --- NEW ARCHETYPES (your list, normalized to ids) ---
    results: [
        {
            id: "sheetghost",
            name: "Sheet Ghost",
            description: "Gentle, simple, and shy—more peekaboo than peril.",
        },
        {
            id: "wisp",
            name: "Will 'O Wisp",
            description:
                "A calm flicker in the dark; presence more felt than seen.",
        },
        {
            id: "demon",
            name: "Demon",
            description:
                "Relentless will and scorching intent—nothing subtle here.",
        },
        {
            id: "beholder",
            name: "Beholder",
            description:
                "All-seeing and unblinking; judgment hums behind every gaze.",
        },
        {
            id: "poltergeist",
            name: "Poltergeist",
            description:
                "Noise, motion, mischief—rooms don’t stay quiet for long.",
        },
        {
            id: "haunteddoll",
            name: "Haunted Doll",
            description:
                "Sweet smile, sharp edges; innocence with strings attached.",
        },
        {
            id: "wraith",
            name: "Wraith",
            description:
                "A cold vow that lingers; grievance wrapped in silence.",
        },
        {
            id: "banshee",
            name: "Banshee",
            description: "A voice like a siren—warning or doom depends on you.",
        },
        {
            id: "hauntedpainting",
            name: "Haunted Painting",
            description:
                "A still scene with a living stare; memories trap and echo.",
        },
        {
            id: "reanimatedcorpse",
            name: "Reanimated Corpse",
            description: "Momentum without rest; a body that forgot to stop.",
        },
        {
            id: "shadow",
            name: "Shadow",
            description:
                "A shape that drinks the light; quiet, close, and watchful.",
        },
        {
            id: "residualghost",
            name: "Residual",
            description: "A loop of yesterday that never quite dissolves.",
        },
        {
            id: "forestspirit",
            name: "Forest Spirit",
            description:
                "Forest breath and wood-song; protective when respected.",
        },
        {
            id: "yurei",
            name: "Yurei",
            description:
                "Silk-silent and sorrow-bright; grievance turned to purpose.",
        },
        {
            id: "imp",
            name: "Imp",
            description:
                "Mischief with teeth; a spark that loves the powder keg.",
        },
        {
            id: "angel",
            name: "Angel",
            description: "Radiance with resolve; gentleness backed by thunder.",
        },
    ],

    /*
    STORY QUESTIONS (unchanged)
  */
    questions: [
        {
            id: 1,
            text: "One dark night, you find yourself lost in the woods.\n Through the trees, a cabin glows with pale light.\nWhat do you do?",
            imageSrc: "/images/quiz/question_art/house.png",
            answers: [
                {
                    text: "Quietly approach, wary of what might be within",
                    weights: { voice: -1.0, temper: -1.0 },
                },
                {
                    text: "Call out: 'Hello? Anyone there?'",
                    weights: { voice: +1.0, temper: +1.0 },
                },
            ],
        },
        {
            id: 2,
            text: "As you approach, you notice the door creek open\n You decide to go in.\n How do you enter?",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                {
                    text: "Push the door open gently, creeping inside",
                    weights: { voice: -1.0, temper: -1.0 },
                },
                {
                    text: "Kick the door open, better to scare than be scared",
                    weights: { voice: +1.0, temper: +1.0 },
                },
            ],
        },
        {
            id: 3,
            text: "Inside, dust coats the floor.\nCobwebs block your path.\nWhat do you do?",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                {
                    text: "Tear them down, they are in your way!",
                    weights: { voice: +0.5, temper: +1.0 },
                },
                {
                    text: "Crawl under them, avoiding them the best you can",
                    weights: { voice: -1.0, temper: -0.5 },
                },
            ],
        },
        {
            id: 4,
            text: "As you continue down the hall, you get the feeling something is watching you from the stairs.\n What do you do?",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                {
                    text: "Turn around, pretending that you didn't notice.",
                    weights: { voice: -1.0, temper: +0.5 },
                },
                {
                    text: 'Shout "Who\'s there?!"',
                    weights: { voice: +1.0, temper: +0.5 },
                },
            ],
        },
        {
            id: 5,
            text: "Suddenly, you hear footsteps coming from the opposite direction.\n What do you do?",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                {
                    text: "Find something to defend yourself",
                    weights: { voice: -0.0, temper: +1.0 },
                },
                {
                    text: "Hide under a nearby table",
                    weights: { voice: +0.0, temper: -1.0 },
                },
            ],
        },
        {
            id: 6,
            text: "As quickly as the sound came, it is gone.\n Ahead of you are two doors:\n The one on the left is cold to the touch. \n The one on the right spills light underneath.",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                {
                    text: "Open the left door",
                    weights: { voice: -1.0, temper: -0.0 },
                },
                {
                    text: "Open the right door",
                    weights: { voice: +1.0, temper: +0.0 },
                },
            ],
        },
        {
            id: 7,
            text: "Inside, you find a portrait, its eyes seem to follow you.\n You hear a voice in your head ask:\n 'What do you seek?'",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                {
                    text: '"A good story"',
                    weights: { voice: +0.5, temper: +0.5 },
                },
                {
                    text: '"A safe place"',
                    weights: { voice: -0.5, temper: -0.5 },
                },
            ],
        },
        {
            id: 8,
            text: "The floor opens to reveal a stairway.\n A voice below calls your name. \n What do you do?",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                {
                    text: "Go toward the voice.",
                    weights: { voice: +0.5, temper: +0.5 },
                },
                {
                    text: "Step back and run.",
                    weights: { voice: -0.5, temper: -0.5 },
                },
            ],
        },
        {
            id: 9,
            text: "You slip and fall down the steps.\n At the bottom, you find a mirror. Your reflection speaks, asking:\n 'What are you really?'",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                { text: "A Witness", weights: { voice: -1.0, temper: +1.0 } },
                { text: "A Judge", weights: { voice: +1.0, temper: -1.0 } },
            ],
        },
        {
            id: 10,
            text: "You step to your feet, but find you are chained to the ground.\n Your reflection begins to creep towards you, out of the mirror. \n What do you do?",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                {
                    text: "Pull on the chain, attempting to break it from the floor.",
                    weights: { voice: -1.0, temper: +1.0 },
                },
                {
                    text: "Plead with the spirit to let you live.",
                    weights: { voice: +1.0, temper: -1.0 },
                },
            ],
        },
        {
            id: 11,
            text: "As the spirit reaches your body, you feel it pulling you into itself.\n Do you accept this change?",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                { text: "Yes", weights: { voice: -1.0, temper: +1.0 } },
                { text: "No", weights: { voice: +1.0, temper: -1.0 } },
            ],
        },
        {
            id: 12,
            text: "You look back to see your body on the floor.\nWhat have you become?",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                {
                    text: "A quiet light fading to peace.",
                    weights: { voice: -1.0, temper: -1.0 },
                },
                {
                    text: "A whisper that never forgives.",
                    weights: { voice: -1.0, temper: +1.0 },
                },
                {
                    text: "A voice calling others to safety.",
                    weights: { voice: +1.0, temper: -1.0 },
                },
                {
                    text: "A scream that burns the dark away.",
                    weights: { voice: +1.0, temper: +1.0 },
                },
            ],
        },
    ],

    /*
    4×4 RESULT GRID
    Rows = voice band (0..3) from Very Quiet → Very Loud
    Cols = temper band (0..3) from Very Peaceful → Very Vengeful
    Values are IDs from results[] above (each used exactly once).
  */
    results4x4: [
        // Very Quiet
        ["reanimatedcorpse", "haunteddoll", "angel", "beholder"],
        // Quiet
        ["shadow", "hauntedpainting", "forestspirit", "wisp"],
        // Loud
        ["residualghost", "sheetghost", "poltergeist", "imp"],
        // Very Loud
        ["wraith", "yurei", "banshee", "demon"],
    ],
};

/* -------------------------- Helper Functions -------------------------- */

const SCALE = 1000; // store thousandths to avoid float drift
const toInt = (x = 0) => Math.round(x * SCALE);

/** Accumulate voice/temper scores as the user answers. */
export function scoreAnswers(prevScores, weights) {
    return {
        voice: (prevScores?.voice || 0) + toInt(weights?.voice || 0),
        temper: (prevScores?.temper || 0) + toInt(weights?.temper || 0),
    };
}

/** Compute the maximum achievable absolute weight on each axis. */
export function computeMaxWeights(questions) {
    let maxVoice = 0;
    let maxTemper = 0;
    questions.forEach((q) => {
        const maxQv = Math.max(
            0,
            ...q.answers.map((a) => Math.abs(a.weights?.voice || 0))
        );
        const maxQt = Math.max(
            0,
            ...q.answers.map((a) => Math.abs(a.weights?.temper || 0))
        );
        maxVoice += toInt(maxQv);
        maxTemper += toInt(maxQt);
    });
    return {
        maxVoice: Math.max(maxVoice, 1),
        maxTemper: Math.max(maxTemper, 1),
    };
}

/** Normalize raw integer scores to -1..+1 using maxima. */
export function normalizeScores(scores, maxima) {
    const nVoice = Math.max(
        -1,
        Math.min(1, scores.voice / (maxima.maxVoice || 1))
    );
    const nTemper = Math.max(
        -1,
        Math.min(1, scores.temper / (maxima.maxTemper || 1))
    );
    return { nVoice, nTemper };
}

/** Map a normalized value (-1..+1) into a 0..3 band index. */
export function bandIndex(v, thresholds = [-0.5, 0, 0.5]) {
    if (v < thresholds[0]) return 0; // Very low
    if (v < thresholds[1]) return 1; // Low
    if (v < thresholds[2]) return 2; // High
    return 3; // Very high
}

/** Pick the final result from a 4×4 grid of IDs. */
export function pickResult4x4({ nVoice, nTemper }, results4x4, allResults) {
    const row = bandIndex(nVoice);
    const col = bandIndex(nTemper);
    const id = results4x4[row][col];
    // eslint-disable-next-line no-unused-vars
    const result = allResults.find((r) => r.id === id) || {
        id,
        name: id,
        description: "",
    };
    return { id, ...result };
}

/** Convenience: compute a result from raw scores + questions + data. */
export function resultFromScores(scores, data = ghostQuizData) {
    const maxima = computeMaxWeights(data.questions);
    const { nVoice, nTemper } = normalizeScores(scores, maxima);
    console.log(
        "[DEBUG] nVoice:",
        nVoice.toFixed(3),
        "nTemper:",
        nTemper.toFixed(3)
    );
    return pickResult4x4({ nVoice, nTemper }, data.results4x4, data.results);
}

export default ghostQuizData;

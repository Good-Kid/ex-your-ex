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
            text: "You're walking home after a long day. Suddenly, you hear footsteps behind you.",
            imageSrc: "/images/quiz/question_art/q1.gif",
            answers: [
                {
                    text: "Keep walking at the same pace, listening carefully without turning around",
                    weights: { voice: -1.0, temper: 0.0 },
                },
                {
                    text: "Turn around immediately and say 'Can I help you?'",
                    weights: { voice: +1.0, temper: 0.0 },
                },
            ],
        },
        {
            id: 2,
            text: "When you look, no one is there. Afraid, you take a shortcut through the woods. It's getting darker. Your phone battery is at 2%.",
            imageSrc: "/images/quiz/question_art/q2.gif",
            answers: [
                {
                    text: "Turn off your phone to save battery and navigate by memory",
                    weights: { voice: -1.0, temper: 0.0 },
                },
                {
                    text: "Use the flashlight anyway — you need to see where you're going",
                    weights: { voice: +1.0, temper: 0.0 },
                },
            ],
        },
        {
            id: 3,
            text: "Before you get the chance, your phone dies! Through the trees, you see a faint light. It's a hotel you've never noticed before.",
            imageSrc: "/images/quiz/question_art/q3.gif",
            answers: [
                {
                    text: "Approach quietly, observing from the tree line first",
                    weights: { voice: -1.0, temper: 0.0 },
                },
                {
                    text: "Walk straight toward it and knock on the door",
                    weights: { voice: +1.0, temper: 0.0 },
                },
            ],
        },
        {
            id: 4,
            text: "You approach the entrance, when the hotel door slowly creaks open by itself. No one appears.",
            imageSrc: "/images/quiz/question_art/q4.gif",
            answers: [
                {
                    text: "Slip inside silently, barely touching the door",
                    weights: { voice: -1.0, temper: 0.0 },
                },
                {
                    text: "Push it wide open and call out 'Hello?'",
                    weights: { voice: +1.0, temper: 0.0 },
                },
            ],
        },
        {
            id: 5,
            text: 'The door slams shut behind you. A woman stands behind the front desk, staring at you with white, hollow eyes. Her nameplate reads "Jenny."',
            imageSrc: "/images/quiz/question_art/q5.gif",
            answers: [
                {
                    text: "Ask her if there's a place you can charge your phone",
                    weights: { voice: 0.0, temper: -1.0 },
                },
                {
                    text: "Don't make eye contact, back away slowly...",
                    weights: { voice: 0.0, temper: +1.0 },
                },
            ],
        },
        {
            id: 6,
            text: '"Welcome to the hotel," she says, reading the reservations. "Ah yes, I see here that you\'ll be staying with us for a long time." She points to a door behind the desk. "This way to your room."',
            imageSrc: "/images/quiz/question_art/q6.gif",
            answers: [
                {
                    text: "Follow Jenny through the door",
                    weights: { voice: 0.0, temper: -1.0 },
                },
                {
                    text: "No thanks, I think I'll find my own way",
                    weights: { voice: 0.0, temper: +1.0 },
                },
            ],
        },
        {
            id: 7,
            text: "Jenny waves you forward, as you find yourself in an endless hallway with endless doors and old photographs of guests lining the walls. In one of them, you see yourself.",
            imageSrc: "/images/quiz/question_art/q7.gif",
            answers: [
                {
                    text: "Reach out and touch your face in the photograph, remember...",
                    weights: { voice: 0.0, temper: +1.0 },
                },
                {
                    text: "Run — get as far from it as possible, this can't be real!",
                    weights: { voice: 0.0, temper: -1.0 },
                },
            ],
        },
        {
            id: 8,
            text: 'You reach the only open room — "501." On the bed lies dusty formalwear, as if waiting for you.',
            imageSrc: "/images/quiz/question_art/q8.gif",
            answers: [
                {
                    text: "Put on the outfit — maybe it will help you blend in.",
                    weights: { voice: 0.0, temper: +1.0 },
                },
                {
                    text: "It probably belongs to someone, leave it alone and look around the room.",
                    weights: { voice: 0.0, temper: -1.0 },
                },
            ],
        },
        {
            id: 9,
            text: "You're drawn to the window, but find a ballroom where woods should be. A dancer beckons. Suddenly you're there with someone who looks just like your first love—the one who broke your heart.",
            imageSrc: "/images/quiz/question_art/q9.gif",
            answers: [
                {
                    text: "Ask them why they left you",
                    weights: { voice: -1.0, temper: +1.0 },
                },
                {
                    text: "Just keep dancing, maybe this time it'll be different",
                    weights: { voice: +1.0, temper: -1.0 },
                },
            ],
        },
        {
            id: 10,
            text: 'Midnight strikes. Everyone vanishes—except them. "I\'m sorry. Follow me, I have more to tell you" They walk through a door revealing a staircase descending into darkness.',
            imageSrc: "/images/quiz/question_art/q10.gif",
            answers: [
                {
                    text: '"I forgive you, wait!" Run after them',
                    weights: { voice: -1.0, temper: +1.0 },
                },
                {
                    text: "Follow slowly, you're afraid of what they'll say",
                    weights: { voice: +1.0, temper: -1.0 },
                },
            ],
        },
        {
            id: 11,
            text: 'You find them halfway down the staircase. They turn to face you, reaching out their hand. "I never meant to hurt you," they say softly. "I need you to know—"',
            imageSrc: "/images/quiz/question_art/q11.gif",
            answers: [
                {
                    text: "Take their hand — you need to hear this",
                    weights: { voice: -1.0, temper: +1.0 },
                },
                {
                    text: '"Just tell me. Please."',
                    weights: { voice: +1.0, temper: -1.0 },
                },
            ],
        },
        {
            id: 12,
            text: "They step back. You reach and fall, tumbling down the stairs. Then—weightless, floating above yourself. They're gone. You'll never hear what they had to say.",
            imageSrc: "/images/quiz/question_art/q12.gif",
            answers: [
                {
                    text: "Swim back into your body, you still have more to say!",
                    weights: { voice: -1.0, temper: +1.0 },
                },
                {
                    text: "Float away — maybe you'll find them again",
                    weights: { voice: +1.0, temper: -1.0 },
                },
            ],
        },
        {
            id: 13,
            text: "Ding ... \"Welcome home.\" You're back in the lobby with Jenny. You realize — You're not leaving. What have you become?",
            imageSrc: "/images/quiz/question_art/q13.gif",
            answers: [
                {
                    text: "A fading glow that seeks eternal rest",
                    weights: { voice: -1.0, temper: -1.0 },
                },
                {
                    text: "A cold presence that never forgets a wrong",
                    weights: { voice: -1.0, temper: +1.0 },
                },
                {
                    text: "A gentle guide leading lost souls to safety",
                    weights: { voice: +1.0, temper: -1.0 },
                },
                {
                    text: "A fierce flame that burns away the darkness",
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

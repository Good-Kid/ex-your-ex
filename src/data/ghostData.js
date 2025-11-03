// src/data/ghostQuizData.js

/*
  2-AXIS QUIZ OVERVIEW

  Axis "voice"   → Quiet (-)  ↔  Loud (+)
  Axis "temper"  → Peaceful (-) ↔  Vengeful (+)

  We produce 16 outcomes by splitting each axis into 4 bands (4×4 grid).
  Helper functions:
   - scoreAnswers(...)       → accumulates voice/temper as the user answers
   - computeMaxWeights(...)  → used to normalize scores to -1..+1
   - normalizeScores(...)    → returns { nVoice, nTemper } normalized values
   - bandIndex(...)          → maps -1..+1 to 0..3 via thresholds
   - pickResult4x4(...)      → picks a result from a 4×4 matrix of IDs
*/

const ghostQuizData = {
    axes: {
        voice: { name: "Quiet–Loud", min: "Quiet", max: "Loud" },
        temper: { name: "Peaceful–Vengeful", min: "Peaceful", max: "Vengeful" },
    },

    // archetypes
    results: [
        {
            id: "deep_shadow",
            name: "Deep Shadow",
            description:
                "A heavy silence clings to you, as if something unseen waits in the dark corners of your mind.",
        },
        {
            id: "grave_echo",
            name: "Grave Echo",
            description:
                "Old regrets whisper through your thoughts, memories you can't quite bury echoing in the quiet.",
        },
        {
            id: "quiet_lantern",
            name: "Quiet Lantern",
            description:
                "A faint hope flickers, but its glow is haunted by the fear that comfort will slip away.",
        },
        {
            id: "gentle_guardian",
            name: "Gentle Guardian",
            description:
                "You feel watched over, yet the presence is restless—protective but never letting you rest.",
        },

        {
            id: "mist_phantom",
            name: "Mist Phantom",
            description:
                "Uncertainty drifts around you, a fog of doubt that never quite clears from your path.",
        },
        {
            id: "hushed_oracle",
            name: "Hushed Oracle",
            description:
                "A warning lingers at the edge of your thoughts, secrets half-spoken and never resolved.",
        },
        {
            id: "hearth_wisp",
            name: "Hearth Wisp",
            description:
                "Longing for warmth haunts you, as if something precious is missing from the heart of your home.",
        },
        {
            id: "steadfast_guardian",
            name: "Steadfast Guardian",
            description:
                "A stubborn worry stands guard, refusing to let go, keeping you vigilant even in peace.",
        },

        {
            id: "wandering_wraith",
            name: "Wandering Wraith",
            description:
                "Restlessness stalks you, a sense that something unfinished is always just out of reach.",
        },
        {
            id: "dusk_revenant",
            name: "Dusk Revenant",
            description:
                "A shadow of injustice lingers, fueling a quiet anger that refuses to fade with the light.",
        },
        {
            id: "bright_trickster",
            name: "Bright Trickster",
            description:
                "A mocking voice teases at your confidence, turning laughter into uncertainty.",
        },
        {
            id: "storm_poltergeist",
            name: "Storm Poltergeist",
            description:
                "Tension rattles through you, sudden and sharp, as if chaos is waiting to break loose.",
        },

        {
            id: "void_wraith",
            name: "Void Wraith",
            description:
                "An emptiness gnaws at you, a hollow feeling that something vital has slipped away.",
        },
        {
            id: "storm_banshee",
            name: "Storm Banshee",
            description:
                "A cry for release echoes inside, a warning that something must end before you can rest.",
        },
        {
            id: "tide_mariner",
            name: "Tide Mariner",
            description:
                "A pull from the past tugs at you, waves of nostalgia and loss washing over your present.",
        },
        {
            id: "aurora_trickster",
            name: "Aurora Trickster",
            description:
                "A restless energy flickers, coloring your thoughts with flashes of anxiety and daring.",
        },
    ],

    /*
    STORY QUESTIONS
    */
    questions: [
        {
            id: 1,
            text: "You’re lost in the dark woods.\n Through the trees, a house glows with pale light.\nWhat do you do?",
            imageSrc: "/images/quiz/question_art/house.png",
            answers: [
                {
                    text: "Approach quietly and keep out of sight.",
                    weights: { voice: -1.0, temper: -0.25 },
                },
                {
                    text: "Call out: 'Hello? Anyone there?'",
                    weights: { voice: +1.0, temper: -0.1 },
                },
            ],
        },
        {
            id: 2,
            text: "The door is half-open. You decide to go in. How do you approach?",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                {
                    text: "Push it gently, whispering an apology to the hinges.",
                    weights: { voice: -1.0, temper: -0.25 },
                },
                {
                    text: "Throw it wide — better to scare than be scared.",
                    weights: { voice: +1.0, temper: +0.25 },
                },
            ],
        },
        {
            id: 3,
            text: "Inside, dust coats the floor.\nA glass lies broken.\nWhat do you do?",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                {
                    text: "Pick up the pieces and tidy the room.",
                    weights: { voice: -0.25, temper: -1.0 },
                },
                {
                    text: "Kick the shards aside and let them clatter.",
                    weights: { voice: +0.75, temper: +0.5 },
                },
            ],
        },
        {
            id: 4,
            text: "You sense something watching from the stairs.\n You can feel its pain.\n What do you say?",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                {
                    text: "‘I’ll carry your pain as my own.’",
                    weights: { voice: -0.25, temper: -0.5 },
                },
                {
                    text: "‘Tell me what happened. I’ll make it right.’",
                    weights: { voice: +0.25, temper: +0.75 },
                },
            ],
        },
        {
            id: 5,
            text: "You hear the sudden creaking sound of footsteps rush overhead.\n What do you do?",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                {
                    text: "Stay still and wait for it to pass.",
                    weights: { voice: -0.75, temper: -0.25 },
                },
                {
                    text: "Shout, 'Show yourself!'",
                    weights: { voice: +1.0, temper: +0.25 },
                },
            ],
        },
        {
            id: 6,
            text: "As quickly as the sound came, it is gone.\n You decide to keep exploring.\n Where do you go?",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                {
                    text: "Up to the attic.",
                    weights: { voice: -0.25, temper: -0.5 },
                },
                {
                    text: "Down to the basement.",
                    weights: { voice: +0.25, temper: +0.75 },
                },
            ],
        },
        {
            id: 7,
            text: "You find a portrait, it's eyes seem to follow you.\n You hear a voice in your head ask:\n 'What do you seek?'",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                {
                    text: "To understand what is misunderstood.",
                    weights: { voice: -0.75, temper: +0.0 },
                },
                {
                    text: "To right what is wrong.",
                    weights: { voice: +0.75, temper: +0.5 },
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
                    weights: { voice: -0.5, temper: -0.5 },
                },
                {
                    text: "Step back and run.",
                    weights: { voice: +1.0, temper: +0.25 },
                },
            ],
        },
        {
            id: 9,
            text: "You slip and fall down the steps.\n At the bottom, you find a mirror. Your reflection speaks, asking:\n 'What are you really?'",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                { text: "A witness.", weights: { voice: -0.5, temper: -0.5 } },
                { text: "A judge.", weights: { voice: +0.5, temper: +1.0 } },
            ],
        },
        {
            id: 10,
            text: "The house collapses around you. As everything fades, you make a vow. What will you become?",
            imageSrc: "/images/quiz/question_art/circle.png",
            answers: [
                {
                    text: "A quiet light fading to peace.",
                    weights: { voice: -0.75, temper: -1.0 },
                },
                {
                    text: "A whisper that never forgives.",
                    weights: { voice: -0.25, temper: +0.75 },
                },
                {
                    text: "A voice calling others to safety.",
                    weights: { voice: +0.75, temper: -0.25 },
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
    Values are IDs that must exist in results[] above.
  */
    results4x4: [
        // voice: Very Quiet (row 0)
        ["deep_shadow", "grave_echo", "quiet_lantern", "gentle_guardian"],
        // voice: Quiet (row 1)
        ["mist_phantom", "hushed_oracle", "hearth_wisp", "steadfast_guardian"],
        // voice: Loud (row 2)
        [
            "wandering_wraith",
            "dusk_revenant",
            "bright_trickster",
            "storm_poltergeist",
        ],
        // voice: Very Loud (row 3)
        ["void_wraith", "storm_banshee", "tide_mariner", "aurora_trickster"],
    ],
};

/* -------------------------- Helper Functions -------------------------- */

const SCALE = 1000; // store thousandths to avoid float drift
const toInt = (x = 0) => Math.round(x * SCALE);

/**
 * Accumulate voice/temper scores as the user answers.
 * Internally store as integers (thousandths).
 */
export function scoreAnswers(prevScores, weights) {
    return {
        voice: (prevScores?.voice || 0) + toInt(weights?.voice || 0),
        temper: (prevScores?.temper || 0) + toInt(weights?.temper || 0),
    };
}

/**
 * Compute the maximum achievable absolute weight on each axis,
 * scaled to the same integer basis.
 */
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

/**
 * Normalize raw integer scores to -1..+1 using maxima from computeMaxWeights.
 */
export function normalizeScores(scores, maxima) {
    const nVoice = Math.max(
        -1,
        Math.min(1, scores.voice / (maxima.maxVoice || 1))
    );
    const nTemper = Math.max(
        -1,
        Math.min(1, scores.temper / (maxima.maxTemper || 1))
    );

    // round back to 3 decimals for stable thresholding
    return {
        nVoice: Math.round(nVoice * 1000) / 1000,
        nTemper: Math.round(nTemper * 1000) / 1000,
    };
}

/**
 * Convert a normalized value (-1..+1) into a 0..3 band index.
 */
export function bandIndex(v, thresholds = [-0.5, 0, 0.5]) {
    if (v < thresholds[0]) return 0; // Very low
    if (v < thresholds[1]) return 1; // Low
    if (v < thresholds[2]) return 2; // High
    return 3; // Very high
}

/**
 * Pick the final result from a 4×4 grid of IDs using normalized voice/temper.
 */
export function pickResult4x4({ nVoice, nTemper }, results4x4, allResults) {
    const row = bandIndex(nVoice);
    const col = bandIndex(nTemper);
    const id = results4x4[row][col];
    const result = allResults.find((r) => r.id === id) || {
        id,
        name: id,
        description: "",
    };
    return { id, ...result };
}

/**
 * Convenience: compute a result from raw scores + questions + data.
 */
export function resultFromScores(scores, data = ghostQuizData) {
    const maxima = computeMaxWeights(data.questions);
    const { nVoice, nTemper } = normalizeScores(scores, maxima);
    return pickResult4x4({ nVoice, nTemper }, data.results4x4, data.results);
}

/* ---------------------------- Public Export --------------------------- */

export default ghostQuizData;

/*
  QUICK USAGE (React)

  import ghostQuizData, {
    scoreAnswers,
    computeMaxWeights,
    normalizeScores,
    pickResult4x4,
    resultFromScores
  } from "@/data/ghostQuizData";

  const [scores, setScores] = useState({ voice: 0, temper: 0 });

  const onAnswer = (weights) => {
    setScores(prev => scoreAnswers(prev, weights));
    // advance question index...
  };

  // When finished:
  const result = resultFromScores(scores, ghostQuizData);
  // result = { id, name, description }
*/

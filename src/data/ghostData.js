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

    // 16 archetypes (IDs used by the 4×4 matrix below)
    results: [
        {
            id: "deep_shadow",
            name: "Deep Shadow",
            description:
                "Silent and unseen, you steady the world from the margins where night is thickest.",
        },
        {
            id: "grave_echo",
            name: "Grave Echo",
            description:
                "You answer with memory, binding the present to what should never be forgotten.",
        },
        {
            id: "quiet_lantern",
            name: "Quiet Lantern",
            description:
                "A soft glow in fearful places; your kindness speaks without a word.",
        },
        {
            id: "gentle_guardian",
            name: "Gentle Guardian",
            description:
                "You keep watch so others may rest, warding harm with patient care.",
        },

        {
            id: "mist_phantom",
            name: "Mist Phantom",
            description:
                "A presence felt more than seen, threading between breaths and mirrors.",
        },
        {
            id: "hushed_oracle",
            name: "Hushed Oracle",
            description:
                "Your signs are subtle but true; you tilt fate with a fingertip.",
        },
        {
            id: "hearth_wisp",
            name: "Hearth Wisp",
            description:
                "Warmth in the doorway and light in the kitchen—home follows where you drift.",
        },
        {
            id: "steadfast_guardian",
            name: "Steadfast Guardian",
            description:
                "Doors close, fires bank, storms break around you. You are refuge.",
        },

        {
            id: "wandering_wraith",
            name: "Wandering Wraith",
            description:
                "Roads remember your steps. You chase what’s unfinished with stubborn grace.",
        },
        {
            id: "dusk_revenant",
            name: "Dusk Revenant",
            description:
                "Oaths and debts bind you. You return for justice when the sky turns violet.",
        },
        {
            id: "bright_trickster",
            name: "Bright Trickster",
            description:
                "You teach through laughter; chaos becomes a lantern in your hands.",
        },
        {
            id: "storm_poltergeist",
            name: "Storm Poltergeist",
            description:
                "Doors slam, cupboards sing—your uproar clears the air like thunder.",
        },

        {
            id: "void_wraith",
            name: "Void Wraith",
            description:
                "Where you pass, the world holds its breath. Your will carves paths in darkness.",
        },
        {
            id: "storm_banshee",
            name: "Storm Banshee",
            description:
                "Your cry is a beacon and a warning; endings heed your call.",
        },
        {
            id: "tide_mariner",
            name: "Tide Mariner",
            description:
                "You carry the sea’s rhythm—pulling, guiding, and returning what was lost.",
        },
        {
            id: "aurora_trickster",
            name: "Aurora Trickster",
            description:
                "Color and clamor, joke and joy—you spark courage where fear once lived.",
        },
    ],

    /*
    STORY QUESTIONS (6)
    Two answers each. Each answer adds weights { voice, temper }.
    Narrative: woods → house → inside → presence → choice → death.
  */
    questions: [
        {
            id: 1,
            text: "An unfortunate turn, you find yourself lost in the woods.\n Night presses close, and through the trees, a lone house breathes a pale light.\n What do you do?",
            answers: [
                {
                    text: "Approach quietly, concealing your presence",
                    weights: { voice: -1.0, temper: -0.25 },
                }, // Quiet, Peace-leaning
                {
                    text: "Call out: 'Hello? Is anyone there?'",
                    weights: { voice: +1.0, temper: -0.1 },
                }, // Loud, slightly Peace
            ],
        },
        {
            id: 2,
            text: "As you approach the house, you find the door stands ajar.\n Creeping to the threshold, you decide to enter.\n How do you do it?",
            answers: [
                {
                    text: "Ease the door open, whispering an apology to the hinges.",
                    weights: { voice: -1.0, temper: -0.25 },
                }, // Quiet, Peace
                {
                    text: "Throw the door wide—better to startle than be startled.",
                    weights: { voice: +1.0, temper: +0.25 },
                }, // Loud, Venge-tinge
            ],
        },
        {
            id: 3,
            text: "Inside, dust remembers footsteps not your own.\n A glass lies shattered.\n What do you do?",
            answers: [
                {
                    text: "Gather the pieces; set the room back to how it was.",
                    weights: { voice: -0.25, temper: -1.0 },
                }, // Quiet, Peaceful repair
                {
                    text: "Sweep the shards aside; letting them clatter against the baseboards",
                    weights: { voice: +0.75, temper: +0.5 },
                }, // Loud, assertive
            ],
        },
        {
            id: 4,
            text: "After a moment, you feel it.\n A presence watches from the stairwell.\n It remembers a wrong. What do you offer?",
            answers: [
                {
                    text: "A solemn vow: 'I will carry your pain as my own'",
                    weights: { voice: -0.25, temper: -0.5 },
                },
                {
                    text: "A sharp promise: 'Name them. I’ll make it even.'",
                    weights: { voice: +0.25, temper: +0.75 },
                },
            ],
        },
        {
            id: 5,
            text: "The stairs groan.\n Something moves above.\n How do you respond?",
            answers: [
                {
                    text: "Hold your ground, wait for it to pass.",
                    weights: { voice: -0.75, temper: -0.25 },
                }, // Very Quiet, Peace
                {
                    text: "Demand in shout: 'Show yourself!'",
                    weights: { voice: +1.0, temper: +0.25 },
                }, // Loud, firm
            ],
        },
        {
            id: 6,
            text: "The presence dissipates without response.\n you creep further into the house. Do you go up, or down?",
            answers: [
                {
                    text: "Up, into the attic",
                    weights: { voice: -0.25, temper: -0.5 },
                },
                {
                    text: "Down, into the basement",
                    weights: { voice: +0.25, temper: +0.75 },
                },
            ],
        },
        {
            id: 7,
            text: "In the dark, a portrait stares down at you — the eyes are not still.\n It speaks without sound: 'Why do you press deeper? What do you seek?'\n How do you respond?",
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
            text: "The floorboards split, revealing a hidden stair.\n From below, a voice calls your name.\n What do you do?",
            answers: [
                {
                    text: "Approach the place from which you are bid.",
                    weights: { voice: -0.5, temper: -0.5 },
                },
                {
                    text: "Back away, it's time to run.",
                    weights: { voice: +1.0, temper: +0.25 },
                },
            ],
        },
        {
            id: 9,
            text: "An unseen hand pushes you down the stairs\n At the bottom, you find a mirror cracked through its center.\n Your reflection flickers between yourself and another.\n It asks: 'What are you, really?'",
            answers: [
                {
                    text: "a Witness",
                    weights: { voice: -0.5, temper: -0.5 },
                },
                {
                    text: "a Judge",
                    weights: { voice: +0.5, temper: +1.0 },
                },
            ],
        },
        {
            id: 10,
            text: "A beam splits, bringing the house down upon your head.\n As you fade away, you make a vow. \n What will you become?",
            answers: [
                {
                    text: "A quiet light fading into peace.",
                    weights: { voice: -0.75, temper: -1.0 },
                }, // Quiet + Peaceful
                {
                    text: "A whisper that never forgives.",
                    weights: { voice: -0.25, temper: +0.75 },
                }, // Quiet + Vengeful
                {
                    text: "A voice calling others to safety.",
                    weights: { voice: +0.75, temper: -0.25 },
                }, // Loud + Peaceful
                {
                    text: "A scream that sets the dark ablaze.",
                    weights: { voice: +1.0, temper: +1.0 },
                }, // Loud + Vengeful
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

/**
 * Accumulate voice/temper scores as the user answers.
 * Call with the chosen answer's { voice, temper } weights each time.
 */
export function scoreAnswers(prevScores, weights) {
    return {
        voice: (prevScores?.voice || 0) + (weights?.voice || 0),
        temper: (prevScores?.temper || 0) + (weights?.temper || 0),
    };
}

/**
 * Compute the maximum achievable absolute weight on each axis.
 * Useful for normalizing the final scores to a common -1..+1 range.
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
        maxVoice += maxQv;
        maxTemper += maxQt;
    });
    return {
        maxVoice: Math.max(maxVoice, 1),
        maxTemper: Math.max(maxTemper, 1),
    };
}

/**
 * Normalize raw scores to -1..+1 using maxima from computeMaxWeights.
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
    return { nVoice, nTemper };
}

/**
 * Convert a normalized value (-1..+1) into a 0..3 band index.
 * You can tweak thresholds to taste.
 */
export function bandIndex(v, thresholds = [-0.5, 0, 0.5]) {
    if (v < thresholds[0]) return 0; // Very low
    if (v < thresholds[1]) return 1; // Low
    if (v < thresholds[2]) return 2; // High
    return 3; // Very high
}

/**
 * Pick the final result from a 4×4 grid of IDs using normalized voice/temper.
 * Returns the full result object (id, name, description).
 */
export function pickResult4x4({ nVoice, nTemper }, results4x4, allResults) {
    const row = bandIndex(nVoice); // voice: Quiet→Loud
    const col = bandIndex(nTemper); // temper: Peaceful→Vengeful
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
 * Example:
 *   const maxima = computeMaxWeights(ghostQuizData.questions);
 *   const normalized = normalizeScores(scores, maxima);
 *   const result = resultFromScores(scores, ghostQuizData);
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

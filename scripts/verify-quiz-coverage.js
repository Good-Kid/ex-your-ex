// scripts/verifyQuizCoverage.mjs
// Usage:
//   node scripts/verifyQuizCoverage.mjs
//   node scripts/verifyQuizCoverage.mjs --one          # print one path per result
//   node scripts/verifyQuizCoverage.mjs --limit 3      # cap examples stored per ID (default: 1 when --one, else 5)

import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

// --- Resolve project root and import your quiz data/helpers ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust this import path if your data file lives elsewhere:
const dataModule = await import(
    path.resolve(__dirname, "../src/data/quizData.js")
);
const {
    default: ghostQuizData,
    scoreAnswers,
    computeMaxWeights,
    normalizeScores,
    pickResult4x4,
} = dataModule;

// ---------- CLI flags ----------
const argv = process.argv.slice(2);
const WANT_ONE_PATH = argv.includes("--one");
const limitIdx = argv.indexOf("--limit");
const EXAMPLE_LIMIT = WANT_ONE_PATH
    ? 1
    : limitIdx >= 0
    ? Math.max(1, parseInt(argv[limitIdx + 1], 10) || 5)
    : 5;

// ---------- Helpers ----------
const QUESTIONS = ghostQuizData.questions;
const GRID = ghostQuizData.results4x4;
const ALL_RESULTS = ghostQuizData.results;

// Pretty label per answer index: 0->A, 1->B, 2->C, 3->D
const letter = (i) => String.fromCharCode("A".charCodeAt(0) + i);

// Get the display name for an ID
const nameForId = (id) => ALL_RESULTS.find((r) => r.id === id)?.name || id;

// Compute final result ID from raw scores (using same logic as your app)
const maxima = computeMaxWeights(QUESTIONS);
function resultIdFromScores(scores) {
    const { nVoice, nTemper } = normalizeScores(scores, maxima);
    const res = pickResult4x4({ nVoice, nTemper }, GRID, ALL_RESULTS);
    return res.id;
}

// ---------- DFS over all answer paths ----------
const counts = new Map(); // id -> count
const examples = new Map(); // id -> array of example path strings
const visitedOnce = new Set(); // fast exit when WANT_ONE_PATH and we already found a path for this id

function addExample(id, pathStr) {
    if (!examples.has(id)) examples.set(id, []);
    const list = examples.get(id);
    if (list.length < EXAMPLE_LIMIT) list.push(pathStr);
}

function dfs(qIndex, scores, pathSoFar) {
    if (qIndex >= QUESTIONS.length) {
        // leaf -> compute result
        const id = resultIdFromScores(scores);
        counts.set(id, (counts.get(id) || 0) + 1);

        // Store example(s)
        addExample(id, pathSoFar.join(", "));

        // If we only need one per result, we can track and optionally short-circuit
        if (WANT_ONE_PATH) visitedOnce.add(id);
        return;
    }

    const q = QUESTIONS[qIndex];
    const numAnswers = q.answers.length;

    for (let a = 0; a < numAnswers; a++) {
        // If --one and we already have at least one path for *all* 16 IDs, stop early
        if (WANT_ONE_PATH && visitedOnce.size === 16) return;

        const ans = q.answers[a];
        const nextScores = scoreAnswers(scores, ans.weights);
        const nextPath = pathSoFar.concat(`${q.id}${letter(a)}`);

        dfs(qIndex + 1, nextScores, nextPath);
    }
}

// Run traversal
dfs(0, { voice: 0, temper: 0 }, []);

// ---------- Report ----------
const allIds = GRID.flat(); // 16 ids in the grid order
const reachable = allIds.filter((id) => counts.has(id));
const missing = allIds.filter((id) => !counts.has(id));

console.log(`Reachable IDs: ${reachable.length} of ${allIds.length}`);
if (missing.length) {
    console.log("Missing:", JSON.stringify(missing, null, 2));
} else {
    console.log("✅ All 16 archetypes are reachable.");
}

console.log("\nCounts per ID (how many paths land there):");
const pad = (s, n) => (s + " ".repeat(n)).slice(0, n);
const maxNameLen = Math.max(...allIds.map((id) => nameForId(id).length), 6);
for (const id of allIds) {
    const nm = nameForId(id);
    const c = counts.get(id) || 0;
    console.log(`${pad(nm, maxNameLen)}  ${String(c).padStart(6)}`);
}

// When --one is requested, print one example path for each result
if (WANT_ONE_PATH) {
    console.log("\nOne path per result (A/B/C/D trail):");
    for (const id of allIds) {
        const list = examples.get(id) || [];
        const path = list[0] || "(not found)";
        console.log(`- ${nameForId(id)} [${id}]: ${path}`);
    }
} else {
    // Otherwise show up to EXAMPLE_LIMIT examples for each id (useful for debugging balance)
    console.log(`\nExample paths (up to ${EXAMPLE_LIMIT} each):`);
    for (const id of allIds) {
        const list = examples.get(id) || [];
        const label = `${nameForId(id)} [${id}]`;
        if (list.length === 0) {
            console.log(`- ${label}: (none)`);
        } else {
            console.log(`- ${label}:`);
            list.forEach((p, i) => console.log(`   ${i + 1}. ${p}`));
        }
    }
}

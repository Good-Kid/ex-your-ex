#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const sharp = require("sharp");

// ---- CONFIG ----
const PROJECT_ROOT = process.cwd();
const IMAGES_DIR = path.resolve(PROJECT_ROOT, "public", "images");
const DEFAULT_QUALITY = 85; // lossy quality for tarot and quiz result art
const OVERWRITE_EXISTING = true;
const DELETE_ORIGINAL = true;
const CONCURRENCY = 4;

// ---- helpers ----
function isPngFile(filePath) {
    return path.extname(filePath).toLowerCase() === ".png";
}

async function* walk(dir) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const d of entries) {
        const res = path.resolve(dir, d.name);
        if (d.isDirectory()) yield* walk(res);
        else yield res;
    }
}

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function getFileSize(filePath) {
    try {
        const stat = await fsp.stat(filePath);
        return stat.size;
    } catch {
        return 0;
    }
}

async function convertOne({ inputPath, outputPath, lossless }) {
    const before = await getFileSize(inputPath);
    await fsp.mkdir(path.dirname(outputPath), { recursive: true });

    const pipeline = sharp(inputPath);
    if (lossless) {
        await pipeline.webp({ lossless: true }).toFile(outputPath);
    } else {
        await pipeline.webp({ quality: DEFAULT_QUALITY }).toFile(outputPath);
    }

    const after = await getFileSize(outputPath);
    const saved = before - after;
    const percent = before > 0 ? (saved / before) * 100 : 0;

    if (DELETE_ORIGINAL) {
        await fsp.unlink(inputPath).catch((err) => {
            console.warn(`⚠️ Could not delete ${inputPath}: ${err.message}`);
        });
    }

    return { before, after, saved, percent };
}

async function mapLimit(items, limit, iterator) {
    const results = [];
    let i = 0;
    const workers = new Array(Math.min(limit, items.length))
        .fill(null)
        .map(async () => {
            while (i < items.length) {
                const idx = i++;
                results[idx] = await iterator(items[idx], idx);
            }
        });
    await Promise.all(workers);
    return results;
}

// ---- main ----
(async function main() {
    try {
        await fsp.access(IMAGES_DIR);
    } catch {
        console.error(`❌ Directory not found: ${IMAGES_DIR}`);
        process.exit(1);
    }

    const allPngs = [];
    for await (const file of walk(IMAGES_DIR)) {
        if (isPngFile(file)) allPngs.push(file);
    }

    if (!allPngs.length) {
        console.log("No .png files found under /public/images.");
        process.exit(0);
    }

    const jobs = allPngs.map((inputPath) => {
        const rel = path.relative(PROJECT_ROOT, inputPath);
        // lossy if in tarot or quiz/result_art
        const isLossy = /images[\\/](tarot|quiz[\\/]result_art)/i.test(rel);
        const lossless = !isLossy;
        const outputPath = path.join(
            path.dirname(inputPath),
            `${path.basename(inputPath, ".png")}.webp`
        );
        return { inputPath, outputPath, lossless };
    });

    const filtered = [];
    for (const job of jobs) {
        if (!OVERWRITE_EXISTING) {
            try {
                await fsp.access(job.outputPath);
                console.log(
                    `↷ Skipping (exists): ${path.relative(
                        PROJECT_ROOT,
                        job.outputPath
                    )}`
                );
                continue;
            } catch {}
        }
        filtered.push(job);
    }

    console.log(
        `Converting ${filtered.length} image(s) under ${path.relative(
            PROJECT_ROOT,
            IMAGES_DIR
        )}...\n`
    );

    let ok = 0,
        fail = 0;
    let totalBefore = 0,
        totalAfter = 0;
    const start = Date.now();

    await mapLimit(filtered, CONCURRENCY, async (job) => {
        const relIn = path.relative(PROJECT_ROOT, job.inputPath);
        const relOut = path.relative(PROJECT_ROOT, job.outputPath);
        const mode = job.lossless ? "lossless" : `lossy(q=${DEFAULT_QUALITY})`;

        try {
            const { before, after, saved, percent } = await convertOne(job);
            totalBefore += before;
            totalAfter += after;
            ok++;

            const savedStr =
                saved > 0
                    ? `(-${formatSize(saved)}, -${percent.toFixed(1)}%)`
                    : "(no size saved)";
            console.log(
                `✅ ${mode.padEnd(18)} ${relIn} → ${relOut} ${savedStr}`
            );
        } catch (err) {
            fail++;
            console.error(`❌ Failed: ${relIn}\n   ${err.message}`);
        }
    });

    const totalSaved = totalBefore - totalAfter;
    const totalPercent = totalBefore > 0 ? (totalSaved / totalBefore) * 100 : 0;
    const time = ((Date.now() - start) / 1000).toFixed(1);

    console.log(`\n🧮 Summary:`);
    console.log(`  Converted: ${ok} succeeded, ${fail} failed`);
    console.log(`  Total Before: ${formatSize(totalBefore)}`);
    console.log(`  Total After : ${formatSize(totalAfter)}`);
    console.log(
        `  Saved       : ${formatSize(totalSaved)} (${totalPercent.toFixed(
            1
        )}% smaller)`
    );
    if (DELETE_ORIGINAL)
        console.log("  🗑️  Original PNGs deleted after conversion.");
    console.log(`  ⏱️  Done in ${time}s`);
})();

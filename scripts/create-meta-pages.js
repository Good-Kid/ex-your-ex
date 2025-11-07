// scripts/emit-pages.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

// ------------ CONFIG: add as many pages as you want ------------
const SITE = "https://website.com";
const PAGES = [
    {
        path: "quiz",
        title: "Exorcise Your Ex — Personality Quiz",
        description: "What kind of ghost will you be when you die?",
        // image: "/images/og/quiz.png", // can be absolute or relative
        // Optional extras:
        canonical: "/quiz",
    },
];

// example

// {
//     path: "quiz",
//     title: "Exorcise Your Ex — Personality Quiz",
//     description: "What kind of ghost will you be when you die?",
//     image: "/images/og/quiz.png",        // can be absolute or relative
//     // Optional extras:
//     canonical: "/quiz",
//     twitterCard: "summary_large_image",
//     extraMeta: [
//       // name/property pairs
//       { property: "og:type", content: "website" },
//       { name: "theme-color", content: "#000000" },
//     ],
//   },

// ---------------------------------------------------------------

const ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const DIST = resolve(ROOT, "dist");
const SRC_INDEX = resolve(DIST, "index.html");

// Helpers
const absUrl = (u) => (u?.startsWith("http") ? u : new URL(u, SITE).href);

function upsertTag(html, regex, newTag) {
    if (regex.test(html)) return html.replace(regex, newTag);
    return html.replace("</head>", `  ${newTag}\n</head>`);
}

function setOrAddMeta(html, { name, property, content }) {
    const tag = name
        ? `<meta name="${name}" content="${content}"/>`
        : `<meta property="${property}" content="${content}"/>`;
    const rx = name
        ? new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, "i")
        : new RegExp(`<meta\\s+property=["']${property}["'][^>]*>`, "i");
    return upsertTag(html, rx, tag);
}

let baseHtml = await readFile(SRC_INDEX, "utf8");

for (const page of PAGES) {
    const url = absUrl(page.canonical ?? `/${page.path}`);
    const img = absUrl(page.image);

    let html = baseHtml;

    // Title
    html = upsertTag(
        html,
        /<title>[\s\S]*?<\/title>/i,
        `<title>${page.title}</title>`
    );

    // Description
    html = upsertTag(
        html,
        /<meta\s+name=["']description["'][^>]*>/i,
        `<meta name="description" content="${page.description}"/>`
    );

    // Canonical
    if (page.canonical) {
        html = upsertTag(
            html,
            /<link\s+rel=["']canonical["'][^>]*>/i,
            `<link rel="canonical" href="${url}"/>`
        );
    }

    // Open Graph basics
    html = setOrAddMeta(html, { property: "og:title", content: page.title });
    html = setOrAddMeta(html, {
        property: "og:description",
        content: page.description,
    });
    html = setOrAddMeta(html, { property: "og:url", content: url });
    html = setOrAddMeta(html, { property: "og:image", content: img });
    html = setOrAddMeta(html, { property: "og:type", content: "website" });

    // Twitter
    html = setOrAddMeta(html, {
        name: "twitter:card",
        content: page.twitterCard || "summary_large_image",
    });
    html = setOrAddMeta(html, { name: "twitter:title", content: page.title });
    html = setOrAddMeta(html, { name: "twitter:image", content: img });

    // Extra meta
    for (const m of page.extraMeta ?? []) {
        html = setOrAddMeta(html, m);
    }

    // Ensure folder and write
    const outDir = resolve(DIST, page.path);
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, "index.html"), html, "utf8");
    console.log(`✔ Emitted /${page.path}/index.html`);
}

console.log("✔ All static meta pages emitted.");

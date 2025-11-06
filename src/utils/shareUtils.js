// src/utils/shareUtils.js

// ---------- helpers ----------

export function getShareUrl(slug, base = window.location.origin) {
    const url = new URL(`/share/${slug}`, base);
    url.searchParams.set("utm_source", "native-share"); // generic source
    url.searchParams.set("utm_campaign", "ghost-quiz");
    url.searchParams.set("utm_content", slug); // the result id
    return url.toString();
}

// Builds a friendly title from your quizResult
export const getResultTitle = (quizResult) =>
    quizResult?.name || quizResult?.title || quizResult?.id || "My Result";

// Fetch the PNG and turn it into a File so native share can include it
export async function getResultImageFile(imgUrl, filename = "result.png") {
    const res = await fetch(imgUrl, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch result image");
    const blob = await res.blob();
    const type = blob.type || "image/png";
    return new File(
        [blob],
        filename.endsWith(".png") ? filename : `${filename}.png`,
        { type }
    );
}

// Simple client-side download fallback
export async function downloadUrlAsFile(imgUrl, filename = "result.png") {
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
}

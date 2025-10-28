// utils/preloadAll.js
export async function preloadImages(urls) {
    const tasks = urls.map((src) => {
        const img = new Image();
        img.decoding = "async";
        img.loading = "eager"; // hint for LCP-ish assets
        img.src = src;

        // Prefer decode() (no layout thrash). Fallback to onload.
        return img.decode
            ? img.decode().catch(() => {}) // swallow decode quirks, fall back on paint
            : new Promise((resolve, reject) => {
                  img.onload = () => resolve();
                  img.onerror = () =>
                      reject(new Error(`Failed to load ${src}`));
              });
    });

    // Even if a couple fail, don't block rendering forever.
    try {
        await Promise.all(tasks);
    } catch {
        // ignore; we’ll still proceed
    }
}

// src/utils/preloadImage.js
export async function preloadImage(src) {
    if (!src) return;
    const img = new Image();
    img.src = src;
    try {
        await img.decode();
    } catch {
        // swallow errors if the image fails
    }
}

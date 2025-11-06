export default function safePlayAudio(soundSrc) {
    // Only play if Howler and its context are available and running
    if (
        window.Howler &&
        window.Howler.ctx &&
        window.Howler.ctx.state === "running"
    ) {
        const sound = new window.Howl({ src: [soundSrc] });
        sound.play();
    }
    // If not running, do nothing (don't queue the sound)
}

export async function waitForHowler() {
    await new Promise((resolve) => {
        if (typeof Howl !== "undefined" && Howl.prototype.play) {
            resolve();
        } else {
            const checkHowler = setInterval(() => {
                if (typeof Howl !== "undefined" && Howl.prototype.play) {
                    clearInterval(checkHowler);
                    resolve();
                }
            }, 50);
        }
    });
}

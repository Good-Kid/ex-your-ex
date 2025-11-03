// utils/useSequence.js
import { useEffect, useRef } from "react";

export function useSequence(steps, deps = []) {
    const timers = useRef([]);
    useEffect(() => {
        let elapsed = 0;
        steps.forEach(({ delay = 0, run }) => {
            elapsed += delay;
            const id = setTimeout(run, elapsed);
            timers.current.push(id);
        });
        return () => {
            timers.current.forEach(clearTimeout);
            timers.current = [];
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}

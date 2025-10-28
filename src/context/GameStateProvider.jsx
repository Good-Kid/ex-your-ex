import React, { useMemo, useState } from "react";
import { GameStateContext } from "./GameStateContext";

export default function GameStateProvider({ children }) {
    // Load initial state from localStorage if available
    const defaultState = {
        flags: { introSeen: false },
    };

    const [gameState, setGameState] = useState(() => {
        try {
            const saved = localStorage.getItem("gameState");
            return saved ? JSON.parse(saved) : defaultState;
        } catch {
            return defaultState;
        }
    });

    // Save gameState to localStorage whenever it changes
    React.useEffect(() => {
        localStorage.setItem("gameState", JSON.stringify(gameState));
    }, [gameState]);

    const updateGameState = (updates) => {
        setGameState((prev) => ({ ...prev, ...updates }));
    };

    const value = useMemo(() => ({ gameState, updateGameState }), [gameState]);

    return (
        <GameStateContext.Provider value={value}>
            {children}
        </GameStateContext.Provider>
    );
}

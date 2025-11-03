import React, { useState, useEffect } from "react";
import { GameStateContext } from "./GameStateContext.jsx";

export default function GameStateProvider({ children }) {
    const defaultState = {
        flags: {},
    };

    // Load from localStorage if available
    const [gameState, setGameState] = useState(() => {
        const saved = localStorage.getItem("gameStateFlags");
        if (saved) {
            return { flags: JSON.parse(saved) };
        }

        return defaultState;
    });

    // Save flags to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("gameStateFlags", JSON.stringify(gameState.flags));
    }, [gameState.flags]);

    const updateGameState = (flagUpdates) => {
        setGameState((prev) => ({
            ...prev,
            flags: {
                ...prev.flags,
                ...flagUpdates,
            },
        }));
    };

    return (
        <GameStateContext.Provider value={{ gameState, updateGameState }}>
            {children}
        </GameStateContext.Provider>
    );
}

import React, { createContext, useContext } from "react";

export const GameStateContext = createContext(null);

export function useGameState() {
    const ctx = useContext(GameStateContext);
    if (!ctx)
        throw new Error("useGameState must be used within <GameStateProvider>");
    return ctx;
}

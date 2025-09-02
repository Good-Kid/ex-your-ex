const FlickerEffect = ({ position, isEnabled }) => {
    return (
        <div
            style={{
                position: "absolute",
                ...position,
                display: isEnabled ? "default" : "none",
                width: "240px", // Default width for flicker effect
                height: "240px", // Default height for flicker effect
                borderRadius: "50%",
                background:
                    "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0) 70%)",
                animation: "flicker 1.5s infinite",
                zIndex: 0, // Ensure it is behind the candle
            }}
        ></div>
    );
};

export default FlickerEffect;

const CursorZone = ({
    cursorImage,
    debug = false,
    position,
    size,
    onClick,
    disabled = false, // New prop to disable functionality
}) => {
    return (
        <div
            style={{
                position: "absolute",
                ...position,
                ...size,
                border: debug ? `2px solid red` : undefined,
                cursor: disabled ? "default" : `url(${cursorImage}) 0 89, auto`, // Disable cursor change
                pointerEvents: disabled ? "none" : "auto", // Disable interactions
                zIndex: 2, // Ensure it is in front of the candle
            }}
            onClick={disabled ? undefined : onClick} // Disable click handler
        ></div>
    );
};

export default CursorZone;

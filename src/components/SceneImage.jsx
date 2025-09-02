// A reusable absolutely-centered, offsettable, interactive image component
export default function SceneImage({
    src,
    alt,
    x = 0,
    y = 0,
    style = {},
    size,
    ...props
}) {
    const computedStyle = {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        width: size ? size : "50px",
        height: "auto",
        pointerEvents: "auto",
        ...style,
    };
    return <img src={src} alt={alt} style={computedStyle} {...props} />;
}

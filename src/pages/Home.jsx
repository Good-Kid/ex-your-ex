import SceneImage from "../components/SceneImage.jsx";

export default function Home() {
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <img
                src="/images/phone.webp"
                alt="Phone"
                style={{ width: "500px", height: "auto" }}
            />
        </div>
    );
}

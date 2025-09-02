import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";

export default function CameraRouter() {
    return (
        <>
            <nav
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    display: "flex",
                    gap: 16,
                    justifyContent: "center",
                    padding: 24,
                    zIndex: 10,
                }}
            >
                <Link
                    style={{
                        color: "white",
                        background: "none",
                        border: "1px solid white",
                        padding: "8px 16px",
                        borderRadius: 4,
                        cursor: "pointer",
                        textDecoration: "none",
                    }}
                    to="/"
                >
                    Home
                </Link>
                <Link
                    style={{
                        color: "white",
                        background: "none",
                        border: "1px solid white",
                        padding: "8px 16px",
                        borderRadius: 4,
                        cursor: "pointer",
                        textDecoration: "none",
                    }}
                    to="/about"
                >
                    About
                </Link>
            </nav>
            <div
                style={{
                    position: "relative",
                    minHeight: "100vh",
                    width: "100vw",
                    overflow: "hidden",
                }}
            >
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </div>
        </>
    );
}

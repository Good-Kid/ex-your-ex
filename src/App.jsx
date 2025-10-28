import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EntryPage from "./pages/EntryPage";
import AboutPage from "./pages/AboutPage";
import KitPage from "./pages/KitPage";
import TarotPage from "./pages/TarotPage";
import QuizPage from "./pages/QuizPage";
import GameStateProvider from "./context/GameStateProvider";
import KnifePage from "./pages/KnifePage";

function App() {
    return (
        <GameStateProvider>
            <div
                className="scanlines"
                style={{
                    display: "flex",
                    minWidth: "100vw",
                    minHeight: "100vh",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: "100%",
                        maxWidth: "100vw",
                        maxHeight: "100vh",
                        margin: "auto",
                    }}
                >
                    <div className="vignette"></div>
                    <Router>
                        <Routes>
                            <Route path="/" element={<EntryPage />} />
                            <Route path="/kit" element={<KitPage />} />
                            <Route path="/tarot" element={<TarotPage />} />
                            <Route path="/quiz" element={<QuizPage />} />
                            <Route path="/knife" element={<KnifePage />} />
                            <Route path="/about" element={<AboutPage />} />
                        </Routes>
                    </Router>
                </div>
            </div>
        </GameStateProvider>
    );
}

export default App;

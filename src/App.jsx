import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GameStateProvider from "./context/GameStateProvider";
import EntryPage from "./pages/EntryPage";
import KitPage from "./pages/KitPage";
import TarotPage from "./pages/TarotPage";
import QuizPage from "./pages/QuizPage";
import KnifePage from "./pages/KnifePage";
import CassettePage from "./pages/CasettePage";
import GalleryPage from "./pages/GalleryPage";

function App() {
    return (
        <GameStateProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<EntryPage />} />
                    <Route path="/kit" element={<KitPage />} />
                    <Route path="/tarot" element={<TarotPage />} />
                    <Route path="/tarot/gallery" element={<GalleryPage />} />
                    <Route path="/quiz" element={<QuizPage />} />
                    <Route path="/knife" element={<KnifePage />} />
                    <Route path="/cassette" element={<CassettePage />} />
                </Routes>
            </Router>
        </GameStateProvider>
    );
}

export default App;

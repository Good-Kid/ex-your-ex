import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GameStateProvider from "./context/GameStateProvider";
import EntryPage from "./pages/EntryPage";
import KitPage from "./pages/KitPage";
import TarotPage from "./pages/TarotPage";
import QuizPage from "./pages/QuizPage";
import KnifePage from "./pages/KnifePage";
import CassettePage from "./pages/CasettePage";
import GalleryPage from "./pages/GalleryPage";
import RitualPage from "./pages/RitualPage";
import FinalPage from "./pages/FinalPage";
import { HelmetProvider } from "react-helmet-async";
import TestPage from "./pages/TestPage";
import AnalyticsPageViewLogger from "./components/AnalyticsPageViewLogger";

function App() {
    return (
        <HelmetProvider>
            <GameStateProvider>
                <Router>
                    <AnalyticsPageViewLogger />
                    <Routes>
                        <Route path="/" element={<EntryPage />} />
                        <Route path="/kit" element={<KitPage />} />
                        <Route path="/tarot" element={<TarotPage />} />
                        <Route
                            path="/tarot/gallery"
                            element={<GalleryPage />}
                        />
                        <Route path="/quiz" element={<QuizPage />} />
                        <Route path="/knife" element={<KnifePage />} />
                        <Route path="/cassette" element={<CassettePage />} />
                        <Route path="/ritual" element={<RitualPage />} />
                        <Route path="/final" element={<FinalPage />} />
                        <Route path="/test" element={<TestPage />} />
                    </Routes>
                </Router>
            </GameStateProvider>
        </HelmetProvider>
    );
}

export default App;

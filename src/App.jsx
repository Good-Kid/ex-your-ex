import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import "./scanlines.css";

function App() {
    return (
        <div className="scanlines">
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;

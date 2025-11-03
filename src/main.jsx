import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./reset.css";
import "./index.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <div className="vignette"></div>
        <div className="scanlines"></div>

        <App />
    </StrictMode>
);

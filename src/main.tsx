import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { TasteProfileProvider } from "./contexts/TasteProfileContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TasteProfileProvider>
      <App />
    </TasteProfileProvider>
  </StrictMode>
);

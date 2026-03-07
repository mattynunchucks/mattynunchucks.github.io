import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import UniverseGame from "./UniverseGame";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UniverseGame />
  </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { oasiz } from "@oasiz/sdk";
import App from "./App";

// enableAppSimulator is injected at runtime by the Oasiz platform shell.
// Cast to avoid TypeScript errors when the SDK typings are behind the runtime version.
(oasiz as unknown as { enableAppSimulator?: (opts: object) => void }).enableAppSimulator?.({
  device: "iphone-11",
  orientation: "portrait",
  leaderboard: false,
  backButton: true,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

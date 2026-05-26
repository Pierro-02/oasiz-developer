import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { oasiz } from "@oasiz/sdk";
import App from "./App";

if (import.meta.env.DEV) {
  oasiz.enableAppSimulator({
    device: "iphone-17-pro-max",
    orientation: "portrait",
    frame: true,
    leaderboardVisible: false,
    // @ts-expect-error backButton is a valid runtime option not yet in the type definitions
    backButton: true,
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

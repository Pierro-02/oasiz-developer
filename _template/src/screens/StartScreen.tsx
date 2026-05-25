import { useState } from "react";
import type { GameSettings } from "../types";
import type { MusicManager } from "../audio/MusicManager";
import { SettingsModal } from "../components/SettingsModal";

interface StartScreenProps {
  safeAreaTop: number;
  settings: GameSettings;
  musicManager: MusicManager | null;
  onToggleSetting: (key: keyof GameSettings) => (e: React.MouseEvent<HTMLButtonElement>) => void;
  onPlaySolo: () => void;
  onPlayFriend: () => void;
  onJoinRoom: (code: string) => void;
}

// Takes the larger of the JS platform value (includes Oasiz chrome) and CSS env (device notch)
function safeTop(jsValue: number, extra = 0): string {
  return `calc(max(${jsValue}px, var(--safe-top)) + ${extra}px)`;
}

export function StartScreen({
  safeAreaTop, settings, onToggleSetting,
  onPlaySolo, onPlayFriend, onJoinRoom,
}: StartScreenProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [joinCode, setJoinCode]         = useState("");

  return (
    <main className="screen start-screen" style={{ paddingTop: safeTop(safeAreaTop, 60) }}>
      {showSettings && (
        <SettingsModal
          settings={settings}
          onToggle={onToggleSetting}
          onClose={() => setShowSettings(false)}
        />
      )}

      <button
        className="settings-btn"
        type="button"
        style={{ top: safeTop(safeAreaTop, 12) }}
        onClick={() => setShowSettings(true)}
        aria-label="Settings"
      >
        &#9881;
      </button>

      <h1 className="game-title">{{GAME_TITLE}}</h1>

      <div className="menu-buttons">
        <button type="button" className="btn-primary" onClick={onPlaySolo}>
          Play Solo
        </button>
        <button type="button" className="btn-secondary" onClick={onPlayFriend}>
          Play With Friend
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", width: "min(280px, 80vw)", marginTop: "0.5rem" }}>
        <input
          type="text"
          placeholder="Room code"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value.toUpperCase())}
          maxLength={6}
          style={{
            flex: 1, padding: "0.75rem", borderRadius: "0.5rem",
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#f0ede8", fontFamily: "inherit", fontSize: "1rem", outline: "none",
          }}
        />
        <button
          type="button"
          className="btn-secondary"
          style={{ flexShrink: 0 }}
          disabled={joinCode.length < 4}
          onClick={() => { if (joinCode.length >= 4) onJoinRoom(joinCode); }}
        >
          Join
        </button>
      </div>
    </main>
  );
}

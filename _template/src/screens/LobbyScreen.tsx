import { useEffect, useState } from "react";
import { getParticipants, getState, onPlayerJoin } from "playroomkit";
import type { GameSettings } from "../types";
import type { MusicManager } from "../audio/MusicManager";
import type { PlayroomTransport } from "../network/PlayroomTransport";
import { SettingsModal } from "../components/SettingsModal";
import { openInviteModal, onBack } from "../platform/oasizBridge";

interface PlayerInfo {
  id: string;
  name: string;
  isHostPlayer: boolean;
  ready: boolean;
}

interface LobbyScreenProps {
  transport: PlayroomTransport;
  roomCode: string;
  amHost: boolean;
  safeAreaTop: number;
  settings: GameSettings;
  musicManager: MusicManager | null;
  onToggleSetting: (key: keyof GameSettings) => (e: React.MouseEvent<HTMLButtonElement>) => void;
  onGameStart: () => void;
  onLeave: () => void;
}

function getPlayers(): PlayerInfo[] {
  const raw = getParticipants();
  const all = (Array.isArray(raw) ? raw : Object.values(raw)) as { id: string }[];
  return all.map((p, i) => ({
    id: p.id,
    name: `Player ${i + 1}`,
    isHostPlayer: i === 0,
    ready: (getState(`ready:${p.id}`) as boolean) ?? false,
  }));
}

// Safe area helper: takes the larger of the JS value (platform chrome) and CSS env (device notch)
function safeTop(jsValue: number, extra = 0): string {
  return `calc(max(${jsValue}px, var(--safe-top)) + ${extra}px)`;
}

export function LobbyScreen({
  transport, roomCode, amHost, safeAreaTop, settings,
  onToggleSetting, onGameStart, onLeave,
}: LobbyScreenProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [players, setPlayers]           = useState<PlayerInfo[]>(getPlayers);
  const [iAmReady, setIAmReady]         = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const refreshPlayers = () => setPlayers(getPlayers());

  useEffect(() => onBack(() => setConfirmLeave(true)), []);

  useEffect(() => {
    const off = onPlayerJoin(() => refreshPlayers());
    const interval = window.setInterval(refreshPlayers, 500);
    return () => { off(); clearInterval(interval); };
  }, []);

  // Guest: watch for host starting
  useEffect(() => {
    if (amHost) return;
    const interval = window.setInterval(() => {
      if ((getState("game:started") as boolean) === true) onGameStart();
    }, 300);
    return () => clearInterval(interval);
  }, [amHost, onGameStart]);

  const toggleReady = () => {
    const next = !iAmReady;
    setIAmReady(next);
    transport.setReady(next);
  };

  const handleStart = () => {
    transport.startGame();
    onGameStart();
  };

  const guests   = players.filter(p => !p.isHostPlayer);
  // Always require at least one other player AND that player must be ready
  const canStart = amHost && guests.length > 0 && guests.every(p => p.ready);

  const startLabel = !amHost        ? undefined
    : guests.length === 0           ? "Waiting for opponent..."
    : !guests.every(p => p.ready)   ? "Waiting for players to ready up..."
    :                                  "Start Game";

  return (
    <main className="screen lobby-screen" style={{ paddingTop: safeTop(safeAreaTop, 60) }}>
      {confirmLeave && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p className="confirm-text">Leave the room?</p>
            <div className="confirm-actions">
              <button type="button" className="btn-danger" onClick={onLeave}>Leave</button>
              <button type="button" className="btn-secondary" onClick={() => setConfirmLeave(false)}>Stay</button>
            </div>
          </div>
        </div>
      )}
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

      <h2 className="lobby-title">Waiting Room</h2>

      <div className="room-code-box">
        <span className="room-code-label">Room Code</span>
        <span className="room-code-value">{roomCode}</span>
        {/* Opens platform invite sheet — auto-modal suppressed in PlayroomTransport.create() */}
        <button
          type="button"
          className="btn-secondary"
          style={{ fontSize: "0.75rem", padding: "0.3rem 0.75rem", marginTop: "0.25rem" }}
          onClick={openInviteModal}
        >
          Invite Friend
        </button>
      </div>

      <div className="player-list">
        {players.map(p => (
          <div key={p.id} className="player-row">
            <span className="player-name">{p.name}</span>
            <span className={`player-badge ${p.isHostPlayer ? "badge-host" : p.ready ? "badge-ready" : "badge-wait"}`}>
              {p.isHostPlayer ? "Host" : p.ready ? "Ready" : "Waiting"}
            </span>
          </div>
        ))}
        {players.length < 2 && (
          <div className="player-row" style={{ opacity: 0.35, fontStyle: "italic" }}>
            <span className="player-name">Waiting for opponent...</span>
          </div>
        )}
      </div>

      <div className="lobby-actions">
        {amHost ? (
          <button
            type="button"
            className="btn-primary"
            disabled={!canStart}
            onClick={handleStart}
          >
            {startLabel}
          </button>
        ) : (
          <button
            type="button"
            className={iAmReady ? "btn-secondary" : "btn-primary"}
            onClick={toggleReady}
          >
            {iAmReady ? "Cancel Ready" : "Ready Up"}
          </button>
        )}
        <button type="button" className="btn-danger" onClick={onLeave}>
          Leave Room
        </button>
      </div>
    </main>
  );
}

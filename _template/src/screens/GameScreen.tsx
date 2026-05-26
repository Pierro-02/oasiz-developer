import { useEffect, useState } from "react";
import type { GameSettings } from "../types";
import type { MusicManager } from "../audio/MusicManager";
import type { SoundManager } from "../audio/SoundManager";
import type { PlayroomTransport } from "../network/PlayroomTransport";
import { gameplayStart, gameplayStop, onBack } from "../platform/oasizBridge";

interface GameScreenProps {
  transport?: PlayroomTransport;
  amHost?: boolean;
  safeAreaTop: number;
  settings: GameSettings;
  soundManager: SoundManager | null;
  musicManager: MusicManager | null;
  onToggleSetting: (key: keyof GameSettings) => (e: React.MouseEvent<HTMLButtonElement>) => void;
  onGameEnd: () => void;
}

export function GameScreen({
  safeAreaTop,
  onGameEnd,
  // When wiring your game controller, destructure:
  //   transport, amHost, settings, soundManager, musicManager, onToggleSetting
}: GameScreenProps) {
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => {
    gameplayStart();
    const offBack = onBack(() => setConfirmLeave(true));
    return () => { gameplayStop(); offBack(); };
  }, []);

  // TODO: Replace the tap-to-end placeholder with your real game controller.
  //
  // const containerRef = useRef<HTMLDivElement>(null);
  // useEffect(() => {
  //   if (!containerRef.current) return;
  //   const game = new {{GAME_PASCAL}}Controller(containerRef.current, {
  //     transport, amHost, settings, soundManager, onGameEnd,
  //   });
  //   return () => game.destroy();
  // }, []);

  return (
    <main className="screen game-screen">
      {confirmLeave && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p className="confirm-text">Leave the game?</p>
            <p className="confirm-sub">Your progress will be lost.</p>
            <div className="confirm-actions">
              <button type="button" className="btn-danger" onClick={onGameEnd}>Leave</button>
              <button type="button" className="btn-secondary" onClick={() => setConfirmLeave(false)}>Stay</button>
            </div>
          </div>
        </div>
      )}

      <div className="hud-top" style={{ paddingTop: `calc(max(${safeAreaTop}px, var(--safe-top)) + 8px)` }}>
        {/* HUD elements go here */}
      </div>

      {/* Tap-to-end placeholder — replace with your game canvas */}
      <div
        className="game-area"
        onPointerDown={onGameEnd}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        <p className="game-placeholder">
          Tap anywhere to end
        </p>
      </div>
    </main>
  );
}

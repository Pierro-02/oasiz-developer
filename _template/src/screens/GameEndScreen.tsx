import { useEffect, useRef } from "react";
import type { GameSettings } from "../types";
import { gameplayStop, onBack } from "../platform/oasizBridge";

interface GameEndScreenProps {
  safeAreaTop: number;
  settings: GameSettings;
  onToggleSetting: (key: keyof GameSettings) => (e: React.MouseEvent<HTMLButtonElement>) => void;
  // Extend this with winner info, scores, etc. as needed
  winner?: string;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export function GameEndScreen({
  safeAreaTop, winner, onPlayAgain, onMainMenu,
}: GameEndScreenProps) {
  // Ref pattern avoids stale closure — onPlayAgain identity may change between renders
  const onPlayAgainRef = useRef(onPlayAgain);
  useEffect(() => { onPlayAgainRef.current = onPlayAgain; }, [onPlayAgain]);

  useEffect(() => { gameplayStop(); }, []);
  useEffect(() => onBack(() => onPlayAgainRef.current()), []);

  return (
    <main className="screen game-end-screen" style={{ paddingTop: `calc(max(${safeAreaTop}px, var(--safe-top)) + 20px)` }}>
      <p className="end-result">{winner ?? "Game Over"}</p>

      <div className="end-actions">
        <button type="button" className="btn-primary" onClick={onPlayAgain}>
          Play Again
        </button>
        <button type="button" className="btn-secondary" onClick={onMainMenu}>
          Main Menu
        </button>
      </div>
    </main>
  );
}

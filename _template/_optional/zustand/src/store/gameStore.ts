import { create } from "zustand";

// Global game state store — extend with your game-specific state.
// Access in any component: const { score } = useGameStore();

interface GameState {
  score: number;
  round: number;

  setScore: (score: number) => void;
  addScore: (delta: number) => void;
  nextRound: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  round: 1,

  setScore: (score) => set({ score }),
  addScore: (delta) => set(s => ({ score: s.score + delta })),
  nextRound: ()     => set(s => ({ round: s.round + 1 })),
  reset: ()         => set({ score: 0, round: 1 }),
}));

import type { PlayroomTransport } from "./network/PlayroomTransport";

export type AppPhase =
  | { kind: "splash" }
  | { kind: "menu" }
  | { kind: "playroom_connecting"; joinRoomCode?: string }
  | { kind: "lobby"; transport: PlayroomTransport; roomCode: string; amHost: boolean }
  | { kind: "playing"; transport?: PlayroomTransport; amHost?: boolean }
  | { kind: "game_end"; transport?: PlayroomTransport; amHost?: boolean };

export interface GameSettings {
  music: boolean;
  fx: boolean;
  haptics: boolean;
}

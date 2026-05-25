import {
  isHost, RPC, myPlayer, getState, setState,
  onPlayerJoin, getParticipants, getRoomCode,
} from "playroomkit";
import { shareRoomCode } from "../platform/oasizBridge";

type EventHandler = (data: unknown, senderId: string) => void;

// getParticipants() returns Record<string, PlayerState> or PlayerState[] depending on playroomkit version.
function players(): { id: string }[] {
  const p = getParticipants();
  return (Array.isArray(p) ? p : Object.values(p)) as { id: string }[];
}

export class PlayroomTransport {
  private readonly _roomCode: string;
  private readonly _amHost: boolean;
  private readonly _myIndex: number;
  private readonly _eventHandlers = new Map<string, Set<EventHandler>>();
  private readonly _cleanups: Array<() => void> = [];
  private _disposed = false;

  private constructor(roomCode: string, amHost: boolean, myIndex: number) {
    this._roomCode = roomCode;
    this._amHost   = amHost;
    this._myIndex  = myIndex;
  }

  static async create(): Promise<PlayroomTransport> {
    const roomCode = getRoomCode() ?? "----";
    const amHost   = isHost();
    const all      = players();
    const myId     = myPlayer().id;
    const myIndex  = Math.max(0, all.findIndex(p => p.id === myId));

    const t = new PlayroomTransport(roomCode, amHost, myIndex);
    // inviteOverride: true — suppress the platform's auto-invite modal.
    // The lobby screen provides its own "Invite Friend" button instead.
    shareRoomCode(roomCode, true);
    return t;
  }

  get roomCode(): string  { return this._roomCode; }
  get amHost():   boolean { return this._amHost; }
  get myIndex():  number  { return this._myIndex; }

  get playerCount(): number { return players().length; }

  // ── Lobby ready state ──────────────────────────────────────────

  setReady(ready: boolean): void {
    setState(`ready:${myPlayer().id}`, ready);
  }

  isReady(playerId: string): boolean {
    return (getState(`ready:${playerId}`) as boolean) ?? false;
  }

  allGuestsReady(): boolean {
    const all = players();
    const hostId = all[0]?.id;
    return all.filter(p => p.id !== hostId).every(p => this.isReady(p.id));
  }

  onPlayersChanged(cb: () => void): () => void {
    const off = onPlayerJoin(() => cb());
    this._cleanups.push(off);
    return off;
  }

  // ── Game lifecycle signals (host only) ────────────────────────

  startGame(): void {
    if (!this._amHost) return;
    setState("game:started", true);
    setState("game:ended", false);
  }

  resetLobby(): void {
    if (!this._amHost) return;
    setState("game:started", false);
    setState("game:ended", false);
    for (const p of players()) {
      setState(`ready:${p.id}`, false);
    }
  }

  onGameStart(cb: () => void): () => void {
    return this.on("game:lifecycle", (data) => {
      if ((data as { event: string })?.event === "start") cb();
    });
  }

  // ── Generic event bus ─────────────────────────────────────────

  send(type: string, data?: unknown): void {
    if (this._disposed) return;
    RPC.call(type, data ?? null, RPC.Mode.ALL);
  }

  sendToHost(type: string, data?: unknown): void {
    if (this._disposed) return;
    RPC.call(type, data ?? null, RPC.Mode.HOST);
  }

  on(type: string, handler: EventHandler): () => void {
    if (!this._eventHandlers.has(type)) {
      this._eventHandlers.set(type, new Set());
      const off = RPC.register(type, async (data: unknown, state: unknown) => {
        const senderId = (state as { id: string }).id;
        this._eventHandlers.get(type)?.forEach(h => h(data, senderId));
      });
      this._cleanups.push(off);
    }
    const handlers = this._eventHandlers.get(type)!;
    handlers.add(handler);
    return () => { handlers.delete(handler); };
  }

  // ── Lifecycle ─────────────────────────────────────────────────

  disconnect(): void {
    if (this._disposed) return;
    this._disposed = true;
    shareRoomCode(null);
    this._cleanups.forEach(fn => { try { fn(); } catch { /* ignore */ } });
    this._eventHandlers.clear();
  }
}

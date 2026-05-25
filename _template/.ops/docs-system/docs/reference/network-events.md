# Network Event Contract — {{GAME_TITLE}}

All multiplayer communication goes through `PlayroomTransport` in `src/network/PlayroomTransport.ts`.

## Transport API

```typescript
transport.send(type: string, data?: unknown): void       // broadcast to all
transport.sendToHost(type: string, data?: unknown): void // to host only
transport.on(type: string, handler: (data, senderId) => void): () => void
```

## Built-in Signals (managed by transport)

| State key | Set by | Value | Meaning |
|-----------|--------|-------|---------|
| `game:started` | Host | `true` / `false` | Lobby → Game transition |
| `game:ended` | Host | `true` / `false` | Game is over |
| `ready:<playerId>` | Each player | `true` / `false` | Player ready state |

These are polled every 300ms in `LobbyScreen`. Do not set them directly from game logic — use `transport.startGame()` and `transport.resetLobby()`.

## Game Event Naming Convention

Prefix all game events with the game name to avoid collisions:

```
{{GAME_NAME}}:<category>:<action>
```

Examples:
```
{{GAME_NAME}}:player:move
{{GAME_NAME}}:game:score
{{GAME_NAME}}:game:state
```

## Host-Authoritative Pattern

The host runs the authoritative simulation and broadcasts state snapshots. Guests apply received state locally.

```typescript
// Host — after each physics step or turn:
if (amHost) {
  transport.send("{{GAME_NAME}}:game:state", {
    seq: stepCount,
    // ... game state
  });
}

// All players (including host via ALL mode):
transport.on("{{GAME_NAME}}:game:state", (data, senderId) => {
  if (senderId !== hostId) return; // only trust host
  applyState(data as GameStatePayload);
});
```

## Turn-Based Pattern

```typescript
// Current player sends their move:
transport.send("{{GAME_NAME}}:player:move", { action: "draw", cardId: 5 });

// All players apply it:
transport.on("{{GAME_NAME}}:player:move", (data) => {
  const { action, cardId } = data as MovePayload;
  gameEngine.applyMove(action, cardId);
});
```

## Cleanup

Always unsubscribe in component/controller cleanup:

```typescript
const offMove = transport.on("{{GAME_NAME}}:player:move", handler);
// ... in cleanup:
offMove();
```

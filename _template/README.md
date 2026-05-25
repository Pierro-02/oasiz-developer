# {{GAME_TITLE}}

A game for the [Oasiz](https://oasiz.ai) platform, scaffolded with `bun run create-game`.

## Quick start

```bash
bun install      # first time only
bun run dev      # dev server at http://localhost:5173
bun run build    # outputs dist/index.html (single-file bundle)
bun run typecheck
```

Upload to the platform from the **repo root**:

```bash
bun run upload {{GAME_NAME}}              # build + upload
bun run upload {{GAME_NAME}} --skip-build # use existing dist/
bun run upload {{GAME_NAME}} --dry-run    # verify without uploading
```

---

## Adding your game logic

Everything lives in `src/`. The entry point is `src/main.tsx` → `src/App.tsx`.

### 1. Create your game controller

```
src/game/{{GAME_PASCAL}}Controller.ts
```

Your controller receives a container `div`, manages the canvas/rendering loop, and calls `onGameEnd()` when the round is over.

### 2. Wire it into GameScreen

Open `src/screens/GameScreen.tsx` and replace the tap-to-end placeholder:

```tsx
// Uncomment and fill in:
const containerRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (!containerRef.current) return;
  const game = new {{GAME_PASCAL}}Controller(containerRef.current, {
    transport, amHost, settings, soundManager, onGameEnd,
  });
  return () => game.destroy();
}, []);
```

### 3. Submit the score

Call this once at game over inside your controller:

```typescript
import { oasiz } from "@oasiz/sdk";
oasiz.submitScore(score);
```

---

## Screen flow

```
splash → menu → (playroom_connecting) → lobby → playing → game_end
                                                         ↑ Play Again
                                              menu ←─────┘ Main Menu
```

The `AppPhase` discriminated union in `src/types.ts` drives everything. `src/App.tsx` owns all transitions.

---

## Multiplayer

`PlayroomTransport` (`src/network/PlayroomTransport.ts`) is a thin event bus on top of PlayroomKit. Use it inside your controller:

```typescript
// Host broadcasts a game event to all players
transport.send("hit", { x: 42, y: 100 });

// All players receive it
const off = transport.on("hit", (data, senderId) => {
  const { x, y } = data as { x: number; y: number };
});

// Clean up in destroy()
off();
```

- `transport.amHost` — true on the host client, use it to run authoritative logic
- `transport.myIndex` — 0 for host, 1 for guest (useful for assigning player sides)
- `transport.playerCount` — total connected players

The lobby handles ready-up and `transport.startGame()` automatically. Call `transport.resetLobby()` (via `onPlayAgain`) to reuse the room without reconnecting.

---

## Audio

Drop sound files into `assets/` (processed from `audio-src/` via `bun run audio:process`).

**SFX** — `src/audio/SoundManager.ts`

```typescript
soundManager.play("hit");   // plays assets/hit.mp3
soundManager.play("score");
```

**Music** — `src/audio/MusicManager.ts` — handles autoplay unlock and pause/resume automatically. Pass the file path in the constructor or via `setTrack()`.

---

## Platform integration

All Oasiz SDK calls are wrapped in `src/platform/oasizBridge.ts` so they no-op safely in local dev.

| What | How |
|------|-----|
| Haptic feedback | `triggerHaptic("medium")` |
| Pause / resume | `onPause(cb)` / `onResume(cb)` — wired in App.tsx |
| Back button | `onBack(cb)` — registered per-screen, see each `Screen.tsx` |
| Safe area top | `getSafeAreaTop()` — passed as `safeAreaTop` prop to every screen |
| Persist progress | `oasiz.saveGameState(obj)` / `oasiz.loadGameState()` |

Score normalisation — call once during init (in `main.tsx`):

```typescript
oasiz.emitScoreConfig({
  anchors: [
    { raw: 10,  normalized: 100 },
    { raw: 50,  normalized: 400 },
    { raw: 150, normalized: 700 },
    { raw: 400, normalized: 950 },
  ],
});
```

Adjust the anchors to match your game's score distribution.

---

## Thumbnail

Replace `thumbnail/thumbnail.png` with your own custom thumnail before uploading. The upload script picks it up automatically.

---

## Project structure

```
src/
├── main.tsx                       Entry point — simulator + React root
├── App.tsx                        AppPhase state machine
├── App.css                        All global styles
├── types.ts                       AppPhase, GameSettings
├── platform/oasizBridge.ts        Oasiz SDK wrapper
├── network/PlayroomTransport.ts   PlayroomKit adapter
├── audio/
│   ├── SoundManager.ts            One-shot SFX (Howler)
│   └── MusicManager.ts            Looping music (Howler)
├── boot/preloadAssets.ts          Asset preloader (runs during splash)
├── components/SettingsModal.tsx   Gear-icon settings modal
└── screens/
    ├── SplashScreen.tsx
    ├── StartScreen.tsx
    ├── LobbyScreen.tsx
    ├── GameScreen.tsx             ← wire your game here
    └── GameEndScreen.tsx
```

---

## Deeper reference

- **Monorepo conventions** — `../CLAUDE.md`
- **Full technical requirements** — `../Agents.md`
- **PlayroomKit docs** — https://docs.joinplayroom.com
- **Live docs for this game** — `.ops/docs-system/INDEX.md`

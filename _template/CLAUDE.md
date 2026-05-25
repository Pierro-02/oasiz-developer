# Claude Runbook — {{GAME_TITLE}}

## Repo-Level Rules

Monorepo-wide conventions for Oasiz SDK usage, responsive game UI, settings flows, score submission, lifecycle hooks, and shared audio tooling live in `../CLAUDE.md`.

Read that file before making platform, build, or gameplay-related changes.

## Project Context

Project folder: `{{GAME_NAME}}/`
Docs root: `{{GAME_NAME}}/.ops/docs-system/`
Source of truth: `.ops/docs-system/INDEX.md`

## Commit Rule

Always use Conventional Commits:

- `feat:` — new gameplay feature
- `fix:` — bug fix
- `refactor:` — structural change, no behaviour change
- `docs:` — docs or CLAUDE.md only
- `chore:` — build, deps, tooling

## Architecture

```
src/
├── main.tsx                      # Entry — Oasiz simulator + React root
├── App.tsx                       # AppPhase state machine
├── App.css                       # All global styles (Exo 2 + Kodchasan fonts)
├── types.ts                      # AppPhase, GameSettings
├── platform/oasizBridge.ts       # Oasiz SDK wrapper (safe-area, haptics, lifecycle)
├── network/PlayroomTransport.ts  # PlayroomKit adapter (lobby, ready, events)
├── audio/
│   ├── SoundManager.ts           # One-shot SFX via Howler
│   └── MusicManager.ts           # Looping music via Howler
├── components/SettingsModal.tsx  # Mandatory gear-icon settings (music/fx/haptics)
└── screens/
    ├── SplashScreen.tsx          # Oasiz logo — auto-advances after ~2s
    ├── StartScreen.tsx           # Main menu — solo / play friend / join code
    ├── LobbyScreen.tsx           # Room code, player ready states, host start
    ├── GameScreen.tsx            # Mount your game controller here
    └── GameEndScreen.tsx         # Winner + Play Again / Main Menu
```

## AppPhase Flow

```
splash → menu
menu → playroom_connecting → lobby → playing → game_end → lobby (Play Again)
                                                         → menu (Main Menu)
menu → playing (solo, no transport)
```

## Adding Your Game

1. Create a game controller class (e.g. `src/game/{{GAME_PASCAL}}Controller.ts`)
2. Mount it inside `GameScreen.tsx` using `useEffect` + a container `ref`
3. Call `onGameEnd()` when the game finishes
4. Pass `transport` and `amHost` to the controller for multiplayer logic
5. Use `transport.send(type, data)` / `transport.on(type, handler)` for game events
6. Call `oasiz.submitScore(score)` at game over

## Score Config

Call once during init (in `main.tsx` or `App.tsx`):

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

Adjust anchors to match your game's score distribution.

## Multiplayer Pattern

```typescript
// Host sends an event to all players:
transport.send("myGame:event", { type: "hit", value: 42 });

// All players (including sender) receive it:
const off = transport.on("myGame:event", (data, senderId) => {
  const payload = data as { type: string; value: number };
  // handle event
});
// Call off() in cleanup to unsubscribe

// Host starts the game (guests auto-detect via polling in LobbyScreen):
transport.startGame();

// After game ends, go back to lobby (room is preserved):
transport.resetLobby();  // called inside App.tsx handleReturnToLobby
```

## Live Docs Channel

`.ops/docs-system/**` is the live documentation channel.

After any structural change, update the relevant docs and append an entry to `.ops/docs-system/CHANGELOG.md`.

To sync docs after a significant change, invoke the docsync skill:

```
Skill("docsync")
```

Fallback: read `.ops/docs-system/DOCSYNC_PROMPT.md` and follow it manually.

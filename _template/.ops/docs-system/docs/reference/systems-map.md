# Systems Map — {{GAME_TITLE}}

Current file ownership and system boundaries.

## Entry Points

| File | Role |
|------|------|
| `src/main.tsx` | React root, Oasiz simulator init |
| `src/App.tsx` | AppPhase state machine — owns screen routing |
| `index.html` | HTML shell + CSS custom properties for safe area |

## Platform Layer

| File | Exports |
|------|---------|
| `src/platform/oasizBridge.ts` | `getSafeAreaTop`, `getPlatformRoomCode`, `shareRoomCode`, `openInviteModal`, `gameplayStart/Stop`, `triggerHaptic`, `onPause/Resume/Back` |

## Network Layer

| File | Role |
|------|------|
| `src/network/PlayroomTransport.ts` | PlayroomKit adapter — lobby ready system, generic event bus, game start/reset signals |

## Boot Layer

| File | Role |
|------|------|
| `src/boot/preloadAssets.ts` | Fetches images and audio into browser cache during splash screen; non-fatal on failure |

## Audio Layer

| File | Role |
|------|------|
| `src/audio/SoundManager.ts` | One-shot SFX via Howler, `register(id, src)` / `play(id)` |
| `src/audio/MusicManager.ts` | Looping background music via Howler, autoplay unlock handling |

## UI Layer

| File | Role |
|------|------|
| `src/components/SettingsModal.tsx` | Gear-icon modal — music/fx/haptics toggles |
| `src/screens/SplashScreen.tsx` | Oasiz logo, auto-advances after ~2s |
| `src/screens/StartScreen.tsx` | Main menu — solo / play friend / join code |
| `src/screens/LobbyScreen.tsx` | Room code, player list, ready states, host start |
| `src/screens/GameScreen.tsx` | Game controller mount point + HUD |
| `src/screens/GameEndScreen.tsx` | Winner display, Play Again / Main Menu |

## Game Layer (to be added)

| File | Role |
|------|------|
| `src/game/{{GAME_PASCAL}}Controller.ts` | Game loop, rendering, rules — mounts into `GameScreen` |

## Types

| File | Exports |
|------|---------|
| `src/types.ts` | `AppPhase` (discriminated union), `GameSettings` |

## Optional Modules

| Path | Included if |
|------|-------------|
| `src/store/gameStore.ts` | Zustand selected at scaffold |
| `src/game/PhaserScene.ts` | Phaser 3 selected at scaffold |
| `src/game/ThreeScene.ts` | Three.js selected at scaffold |

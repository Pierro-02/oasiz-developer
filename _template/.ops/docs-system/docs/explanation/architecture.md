# Architecture — {{GAME_TITLE}}

## AppPhase State Machine

`App.tsx` drives the entire game with a single `AppPhase` discriminated union. Each phase maps to exactly one screen.

```
splash
  └─▶ menu
        ├─▶ playing (solo — no transport)
        │     └─▶ game_end ─▶ menu
        └─▶ playroom_connecting
              └─▶ lobby (transport created here)
                    └─▶ playing (transport passed through)
                          └─▶ game_end
                                ├─▶ lobby (Play Again — room persists, transport reused)
                                └─▶ menu  (Main Menu — transport.disconnect())
```

**Why a discriminated union?** Each phase carries exactly the data that phase needs. `playing` carries `transport?` and `amHost?`. Accessing `transport` in `splash` is a type error — the compiler enforces valid state. No null checks scattered through the code.

## Transport Lifecycle

`PlayroomTransport` is created once in `playroom_connecting` and passed through `lobby → playing → game_end`. It is only destroyed when the user leaves to the main menu. This preserves the PlayroomKit room across game sessions — players don't need to reconnect for a rematch.

**Why not put transport in React state?** It is a mutable class instance, not serialisable data. It lives in the `AppPhase` union entries rather than a separate `useRef` so phase transitions atomically carry both the phase change and the transport reference.

## Screen / Controller Separation

Screens (`src/screens/`) are pure React — they manage UI state and call callbacks. The game controller (`src/game/`) is a plain TypeScript class mounted into `GameScreen` via `useEffect`. It owns the canvas, animation loop, and physics — it knows nothing about React.

This separation means:
- The game controller can be tested without React
- Screens can be iterated without touching game logic
- The same controller can be driven by `LocalTransport` (solo) or `PlayroomTransport` (online)

## OasizBridge Pattern

All Oasiz SDK calls are wrapped in `src/platform/oasizBridge.ts` with try/catch guards. This means every function works in local dev (where the SDK is not injected) without crashing. The simulator provides mock implementations.

## Audio Unlock Strategy

Browsers block audio autoplay until a user gesture. The `MusicManager` attempts `play()` on mount (succeeds on the Oasiz platform which patches autoplay policy), then retries on every `pointerdown` until the audio context is unlocked. The `isUnlocked` flag prevents `onResume` from triggering a rejected play on initial platform load.

# How to Add Game Logic

The template provides the full screen flow and multiplayer plumbing. Your game logic lives entirely inside `GameScreen.tsx` — mounted as a controller class on a container element.

## 1. Create a controller

```
src/game/{{GAME_PASCAL}}Controller.ts
```

```typescript
export class {{GAME_PASCAL}}Controller {
  private container: HTMLElement;

  constructor(container: HTMLElement, opts: {
    transport?: PlayroomTransport;
    amHost?: boolean;
    onGameEnd: () => void;
  }) {
    this.container = container;
    // mount canvas, start loop, wire transport events
  }

  destroy(): void {
    // cancel animation frame, remove event listeners
  }
}
```

## 2. Mount it in GameScreen

```typescript
// src/screens/GameScreen.tsx
const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!containerRef.current) return;
  const ctrl = new {{GAME_PASCAL}}Controller(containerRef.current, {
    transport,
    amHost,
    onGameEnd,
  });
  return () => ctrl.destroy();
}, []); // empty deps — controller owns its own lifecycle
```

Add the container div to the JSX:

```tsx
<div className="game-area">
  <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
</div>
```

## 3. Submit score at game end

```typescript
import { oasiz } from "@oasiz/sdk";
oasiz.submitScore(finalScore);
// then call onGameEnd()
```

## 4. Wire multiplayer events

```typescript
// Host sends authoritative state
transport?.send("game:state", { score, phase });

// All players receive
transport?.on("game:state", (data) => {
  const { score, phase } = data as { score: number; phase: string };
  // apply to local simulation
});
```

See `network-events.md` for the event naming convention.

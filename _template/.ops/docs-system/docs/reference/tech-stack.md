# Tech Stack — {{GAME_TITLE}}

## Runtime Dependencies

| Package | Version | Why |
|---------|---------|-----|
| `@oasiz/sdk` | ^1.6.2 | Platform integration — score submission, haptics, safe area, lifecycle |
| `playroomkit` | ^0.0.96 | Multiplayer — room management, state sync, RPC |
| `react` / `react-dom` | ^19.2.5 | UI layer — screen state machine, settings, HUD |
| `howler` | ^2.2.4 | Audio — SFX and music playback, autoplay unlock handling |

### Optional (selected at scaffold)

| Package | Why |
|---------|-----|
| `zustand` | Global game state outside React component tree |
| `phaser` | 2D game rendering — scenes, sprites, physics via Arcade/Matter |
| `three` | 3D rendering — WebGL renderer, scene graph |

## Build Tooling

| Tool | Version | Why |
|------|---------|-----|
| `vite` | ^8.0.10 | Dev server + bundler. `base: "./"` required for correct asset paths in the inlined build |
| `vite-plugin-singlefile` | ^2.3.3 | Inlines all JS, CSS, and assets into a single `dist/index.html` — required by Oasiz platform |
| `@vitejs/plugin-react` | ^6.0.1 | JSX transform + Fast Refresh |
| `typescript` | ~6.0.2 | Strict type checking (`erasableSyntaxOnly`, `noUnusedLocals`) |
| `bun` | runtime | Package manager and script runner |

## Key Config Decisions

- **`base: "./"`** — assets referenced with relative paths so the inlined HTML works when opened directly from disk or served from any subdirectory.
- **`viteSingleFile`** — no CDN dependencies, no multi-file deploy, one file per game.
- **`erasableSyntaxOnly: true`** — strips type-only syntax cleanly, compatible with TS 6.x strip-types mode.
- **`noUnusedLocals / noUnusedParameters`** — enforced to keep the codebase clean.

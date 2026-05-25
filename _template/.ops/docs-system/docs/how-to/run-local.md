# How to Run Locally

## Prerequisites

- Bun installed (`bun --version`)
- Node 20+ (for Vite compatibility)

## Steps

```bash
cd {{GAME_NAME}}
bun install          # first time only
bun run dev          # starts Vite at http://localhost:5173
```

The Oasiz simulator launches automatically — it renders an iPhone 11 frame in the browser so you see the game at mobile resolution with the platform chrome (back button, safe area) overlaid.

## Verify

- Page loads without console errors
- Splash screen plays (~2s) then transitions to the Start screen
- Settings gear opens the modal with Music / FX / Haptics toggles
- "Play With Friend" button starts the PlayroomKit connection flow

## Build

```bash
bun run build        # outputs dist/index.html (single inlined file)
```

A silent exit means success. Open `dist/index.html` directly in a browser to verify the bundle.

## Upload

From the repo root:

```bash
bun run upload {{GAME_NAME}}
```

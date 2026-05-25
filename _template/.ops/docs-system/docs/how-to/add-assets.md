# How to Add Game Assets

## Asset folder structure

```
{{GAME_NAME}}/
  assets/
    images/       ← PNG/SVG/WebP sprites and UI art
    sfx/          ← processed OGG sound effects
    music/        ← processed MP3/OGG music tracks
    models/       ← OBJ/MTL or GLB 3D models (if using Three.js)
    fonts/        ← WOFF2 font files (prefer Google Fonts CDN)
```

## Importing assets in Vite

### Images / SVG

```typescript
import logoUrl from "../../assets/images/logo.png?url";
// logoUrl is a string path — use as <img src={logoUrl} />
```

For inline SVG data:

```typescript
import iconSrc from "../../assets/images/icon.svg?raw";
// iconSrc is the SVG string — use dangerouslySetInnerHTML
```

### JSON data

```typescript
import levelData from "../../assets/levels/level1.json";
```

### Binary / raw files (OBJ, custom formats)

Add to `vite.config.ts` if you need raw binary:

```typescript
import { defineConfig } from "vite";
assetsInclude: ["**/*.obj", "**/*.bin"]
```

Then import as URL:

```typescript
import modelUrl from "../../assets/models/thing.obj?url";
```

## Preloading assets

`src/boot/preloadAssets.ts` is already wired into `SplashScreen` via the `preload` prop in `App.tsx`. The animation and loading run in parallel — `onComplete` fires only when both have finished.

To add assets, edit the `IMAGES` and `AUDIO` arrays at the top of `preloadAssets.ts`:

```typescript
// src/boot/preloadAssets.ts
import bgUrl    from "../../assets/images/bg.png?url";
import hitUrl   from "../../assets/sfx/hit.ogg?url";

const IMAGES = [bgUrl];
const AUDIO  = [hitUrl];
```

Failed loads are non-fatal — a missing asset logs an error but does not block startup.

## Single-file build constraint

`vite-plugin-singlefile` inlines all imported assets into `dist/index.html`. Keep total asset weight under ~15 MB to avoid slow load on mobile. Audio files are the main risk — use OGG at quality 4 (≈128 kbps equivalent) and MP3 at 128 kbps.

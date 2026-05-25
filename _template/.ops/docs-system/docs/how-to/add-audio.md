# How to Add Audio

## Audio pipeline overview

```
audio-src/          ← master files (MP3/WAV, gitignored or committed separately)
    ↓  bun run audio:process (from repo root)
assets/
  sfx/              ← processed OGG files for sound effects
  music/            ← processed MP3/OGG for background music
```

## 1. Install ffmpeg (repo root, one-time)

```bash
bun run ffmpeg:install
bun run ffprobe:install
```

## 2. Create audio source config

Create `audio-src/` and `audio.process.config.json` in the game folder:

```json
{
  "tasks": [
    {
      "input": "audio-src/hit.wav",
      "output": "assets/sfx/hit.ogg",
      "format": "ogg",
      "quality": 4
    },
    {
      "input": "audio-src/music-main.mp3",
      "output": "assets/music/main.mp3",
      "format": "mp3",
      "bitrate": "128k"
    }
  ]
}
```

Then from the repo root:

```bash
bun run audio:process -- --config {{GAME_NAME}}/audio.process.config.json
```

## 3. Register SFX

In your game controller or `App.tsx`:

```typescript
const sound = SoundManager.create();
sound.register("hit",    "/assets/sfx/hit.ogg",    0.8);
sound.register("potted", "/assets/sfx/potted.ogg", 1.0);

// Play
sound.play("hit");
```

## 4. Set music track

```typescript
const music = new MusicManager();
music.setTrack("/assets/music/main.mp3", 0.5); // src, volume
music.play(); // call after first user gesture if autoplay blocked
```

## 5. Respect settings

Both managers check their enabled state automatically. Wire settings toggles in `App.tsx`:

```typescript
useEffect(() => { sound.setFxEnabled(settings.fx); },    [settings.fx]);
useEffect(() => { music.setMusicEnabled(settings.music); }, [settings.music]);
```

This is already done in the template `App.tsx` — just pass your managers via the `soundRef` / `musicRef`.

## Haptics alongside audio

Pair significant sounds with haptics for game feel:

```typescript
import { triggerHaptic } from "../platform/oasizBridge";

sound.play("hit");
triggerHaptic("medium");  // light | medium | heavy | success | error
```

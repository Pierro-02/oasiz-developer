// Add assets to preload here. They are fetched in parallel during the splash screen
// so the game is ready the moment the player reaches the Start screen.
//
// Example:
//   import bgUrl from "../../assets/images/bg.png?url";
//   IMAGES.push(bgUrl);

const IMAGES: string[] = [
  // "/assets/images/logo.png",
];

const AUDIO: string[] = [
  // "/assets/sfx/hit.ogg",
  // "/assets/music/main.mp3",
];

function loadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload  = () => resolve();
    img.onerror = () => resolve(); // non-fatal — missing asset shouldn't block startup
    img.src = src;
  });
}

function loadAudio(src: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.oncanplaythrough = () => resolve();
    audio.onerror          = () => resolve();
    audio.src = src;
    audio.load();
  });
}

export async function preloadAssets(): Promise<void> {
  await Promise.all([
    ...IMAGES.map(loadImage),
    ...AUDIO.map(loadAudio),
  ]);
}

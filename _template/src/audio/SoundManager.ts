import { Howl } from "howler";

export class SoundManager {
  private sounds = new Map<string, Howl>();
  private fxEnabled = true;

  static create(): SoundManager { return new SoundManager(); }

  register(id: string, src: string, volume = 1): void {
    this.sounds.set(id, new Howl({ src: [src], volume, preload: true }));
  }

  play(id: string): void {
    if (!this.fxEnabled) return;
    this.sounds.get(id)?.play();
  }

  setFxEnabled(enabled: boolean): void { this.fxEnabled = enabled; }

  dispose(): void {
    this.sounds.forEach(s => s.unload());
    this.sounds.clear();
  }
}

import { Howl } from "howler";

export class MusicManager {
  private track: Howl | null = null;
  private musicEnabled = true;
  private _isUnlocked  = false;

  get isUnlocked(): boolean { return this._isUnlocked; }

  setTrack(src: string, volume = 0.5): void {
    this.track?.unload();
    this.track = new Howl({ src: [src], loop: true, volume });
  }

  play(): void {
    if (!this.musicEnabled || !this.track) return;
    const id = this.track.play();
    if (id !== undefined) this._isUnlocked = true;
  }

  stop(): void { this.track?.stop(); }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (enabled) this.play(); else this.stop();
  }

  dispose(): void {
    this.track?.unload();
    this.track = null;
  }
}

import Phaser from "phaser";

// Starter Phaser scene. Rename and extend as needed.
// Mount with: new Phaser.Game({ scene: [MainScene], ... }) inside GameScreen.

export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  preload(): void {
    // this.load.image("bg", "/assets/bg.png");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2, "{{GAME_TITLE}}", {
        fontSize: "32px",
        color: "#f0ede8",
        fontFamily: "Exo 2, sans-serif",
      })
      .setOrigin(0.5);
  }

  update(_time: number, _delta: number): void {
    // Game loop
  }
}

export function createPhaserGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width:  window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#0a0814",
    scene: [MainScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  });
}

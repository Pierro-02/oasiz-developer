#!/usr/bin/env bun
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join } from "path";
import * as readline from "readline/promises";

const ROOT = join(import.meta.dirname, "..");
const TEMPLATE_DIR = join(ROOT, "_template");
const OPTIONAL_DIR = join(TEMPLATE_DIR, "_optional");

async function ask(rl: readline.Interface, q: string): Promise<string> {
  return (await rl.question(q)).trim();
}

async function confirm(rl: readline.Interface, q: string, def = false): Promise<boolean> {
  const hint = def ? "[Y/n]" : "[y/N]";
  const a = (await rl.question(`  ${q} ${hint}: `)).trim().toLowerCase();
  return a ? a.startsWith("y") : def;
}

function toTitle(kebab: string): string {
  return kebab.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function toPascal(kebab: string): string {
  return kebab.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

const BINARY_EXTS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico",
  ".woff", ".woff2", ".ttf", ".otf",
  ".mp3", ".ogg", ".wav", ".flac", ".aac",
  ".mp4", ".webm",
]);

function isBinary(filename: string): boolean {
  const dot = filename.lastIndexOf(".");
  return dot !== -1 && BINARY_EXTS.has(filename.slice(dot).toLowerCase());
}

function processFile(content: string, vars: Record<string, string>): string {
  let out = content;
  for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{{${k}}}`, v);
  return out;
}

function copyDir(src: string, dest: string, vars: Record<string, string>): void {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    if (entry === "_optional") continue;
    const s = join(src, entry);
    const d = join(dest, entry);
    if (statSync(s).isDirectory()) {
      copyDir(s, d, vars);
    } else if (isBinary(entry)) {
      writeFileSync(d, readFileSync(s));
    } else {
      writeFileSync(d, processFile(readFileSync(s, "utf-8"), vars), "utf-8");
    }
  }
}

function copyOptional(module: string, gameDir: string, vars: Record<string, string>): void {
  const src = join(OPTIONAL_DIR, module);
  if (existsSync(src)) copyDir(src, gameDir, vars);
}

async function main(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("\n╔═══════════════════════════════╗");
  console.log("║     Oasiz Game Creator v1     ║");
  console.log("╚═══════════════════════════════╝\n");

  let gameName = "";
  while (!gameName) {
    const input = await ask(rl, "  Game folder name (kebab-case, e.g. laser-tennis): ");
    if (/^[a-z][a-z0-9-]*$/.test(input)) {
      gameName = input;
    } else {
      console.log("  Use lowercase letters, numbers, hyphens. Must start with a letter.\n");
    }
  }

  const gameDir = join(ROOT, gameName);
  if (existsSync(gameDir)) {
    console.log(`\n  Folder "${gameName}" already exists. Aborting.\n`);
    rl.close();
    process.exit(1);
  }

  console.log("\n  Base: React 19 + PlayroomKit + Oasiz SDK + Howler (always included)\n");

  const useZustand = await confirm(rl, "Include Zustand for global state?");
  const usePhaser  = await confirm(rl, "Include Phaser 3 for 2D rendering?");
  const useThree   = await confirm(rl, "Include Three.js for 3D rendering?");

  rl.close();

  const vars: Record<string, string> = {
    GAME_NAME:   gameName,
    GAME_TITLE:  toTitle(gameName),
    GAME_PASCAL: toPascal(gameName),
  };

  console.log(`\n  Creating ${gameName}/...`);
  copyDir(TEMPLATE_DIR, gameDir, vars);

  if (useZustand) copyOptional("zustand", gameDir, vars);
  if (usePhaser)  copyOptional("phaser",  gameDir, vars);
  if (useThree)   copyOptional("three",   gameDir, vars);

  // Trim package.json to only selected optional deps
  const pkgPath = join(gameDir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  if (!useZustand) delete pkg.dependencies["zustand"];
  if (!usePhaser)  delete pkg.dependencies["phaser"];
  if (!useThree) {
    delete pkg.dependencies["three"];
    delete pkg.devDependencies["@types/three"];
  }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");

  console.log("  Installing dependencies...\n");
  const proc = Bun.spawn(["bun", "install"], { cwd: gameDir, stdout: "inherit", stderr: "inherit" });
  const code = await proc.exited;

  if (code !== 0) {
    console.log("\n  bun install failed. Check errors above.");
    process.exit(code);
  }

  const stack = ["React + PlayroomKit + Oasiz SDK",
    useZustand ? "Zustand" : null,
    usePhaser  ? "Phaser 3" : null,
    useThree   ? "Three.js" : null,
  ].filter(Boolean).join(", ");

  console.log(`\n  Done! Stack: ${stack}`);
  console.log(`\n  cd ${gameName} && bun run dev\n`);
}

main().catch((err: unknown) => { console.error(err); process.exit(1); });

import { oasiz, onBackButton } from "@oasiz/sdk";
import * as _sdkModule from "@oasiz/sdk";

// getViewportInsets is exported by @oasiz/sdk at runtime but may be absent from
// TypeScript typedefs in some versions. Access it via the module namespace to avoid
// import errors while still using it when available.
type GetViewportInsets = () => { pixels: { top: number } };
const _getViewportInsets = (_sdkModule as unknown as Record<string, unknown>)["getViewportInsets"] as GetViewportInsets | undefined;

export function getSafeAreaTop(): number {
  // Platform SDK — includes Oasiz chrome (back button, leaderboard bar)
  try {
    const px = _getViewportInsets?.()?.pixels?.top ?? 0;
    if (px > 0) return px;
  } catch { /* not on platform */ }
  // CSS env fallback — device notch only, no platform chrome
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--safe-top").trim();
    const m = /^([\d.]+)px$/.exec(raw);
    const v = m ? (parseFloat(m[1]) || 0) : 0;
    if (v > 0) return v;
  } catch { /* ignore */ }
  return 0;
}

export function getPlatformRoomCode(): string | null {
  const code = oasiz.roomCode;
  if (typeof code !== "string") return null;
  const n = code.trim();
  return n.length > 0 ? n : null;
}

export function getPlatformPlayerName(): string | null {
  const name = oasiz.playerName;
  if (typeof name !== "string") return null;
  const n = name.trim();
  return n.length > 0 ? n : null;
}

type ShareRoomCodeFn = (code: string | null, opts?: { inviteOverride?: boolean }) => void;

// inviteOverride: true tells the platform NOT to auto-show its invite modal.
// Use this when your UI provides its own invite button.
export function shareRoomCode(code: string | null, inviteOverride = false): void {
  (oasiz.shareRoomCode as ShareRoomCodeFn)(code, inviteOverride ? { inviteOverride: true } : undefined);
}

export function openInviteModal(): void {
  try {
    const b = oasiz as unknown as { openInviteModal?: () => void };
    if (b.openInviteModal) { b.openInviteModal(); return; }
    const w = window as unknown as Record<string, unknown>;
    const fn = w["openInviteModal"] ?? w["openRoomInvite"] ?? w["openInvite"];
    if (typeof fn === "function") (fn as () => void)();
  } catch { /* not on platform */ }
}

export function gameplayStart(): void {
  try { (oasiz as unknown as { gameplayStart?: () => void }).gameplayStart?.(); } catch { /* ignore */ }
}

export function gameplayStop(): void {
  try { (oasiz as unknown as { gameplayStop?: () => void }).gameplayStop?.(); } catch { /* ignore */ }
}

export function triggerHaptic(type: "light" | "medium" | "heavy" | "success" | "error"): void {
  oasiz.triggerHaptic(type);
}

export function onPause(cb: () => void): () => void  { return oasiz.onPause(cb); }
export function onResume(cb: () => void): () => void { return oasiz.onResume(cb); }
export function onBack(cb: () => void): () => void   { return onBackButton(cb); }

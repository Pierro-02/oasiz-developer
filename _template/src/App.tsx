import { startTransition, useEffect, useRef, useState } from "react";
import { oasiz } from "@oasiz/sdk";
import { insertCoin, getRoomCode, isHost } from "playroomkit";
import "./App.css";
import type { AppPhase, GameSettings } from "./types";
import { SoundManager } from "./audio/SoundManager";
import { MusicManager } from "./audio/MusicManager";
import { PlayroomTransport } from "./network/PlayroomTransport";
import { getSafeAreaTop, getPlatformRoomCode, onPause, onResume, onBack } from "./platform/oasizBridge";
import { preloadAssets } from "./boot/preloadAssets";
import { SplashScreen } from "./screens/SplashScreen";
import { StartScreen } from "./screens/StartScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { GameScreen } from "./screens/GameScreen";
import { GameEndScreen } from "./screens/GameEndScreen";

const SETTINGS_KEY = "{{GAME_NAME}}-settings";

const DEFAULT_SETTINGS: GameSettings = { music: true, fx: true, haptics: true };

function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const p = JSON.parse(raw) as Partial<GameSettings>;
    return {
      music:   p.music   ?? DEFAULT_SETTINGS.music,
      fx:      p.fx      ?? DEFAULT_SETTINGS.fx,
      haptics: p.haptics ?? DEFAULT_SETTINGS.haptics,
    };
  } catch { return DEFAULT_SETTINGS; }
}

function getInitialPhase(): AppPhase {
  const code = getPlatformRoomCode();
  return code ? { kind: "playroom_connecting", joinRoomCode: code } : { kind: "splash" };
}

export default function App() {
  const [phase, setPhase]           = useState<AppPhase>(getInitialPhase);
  const [settings, setSettings]     = useState<GameSettings>(loadSettings);
  const [safeAreaTop]               = useState(getSafeAreaTop);
  const soundRef                    = useRef<SoundManager | null>(null);
  const musicRef                    = useRef<MusicManager | null>(null);
  const lastToggle                  = useRef(0);

  // Prevent platform back from exiting during screen transitions
  useEffect(() => onBack(() => {}), []);

  // Back during connecting: cancel and return to menu
  useEffect(() => {
    if (phase.kind !== "playroom_connecting") return;
    return onBack(() => startTransition(() => setPhase({ kind: "menu" })));
  }, [phase]);

  // Audio managers — created once, outlive screen transitions
  useEffect(() => {
    const sound = SoundManager.create();
    const music = new MusicManager();
    soundRef.current = sound;
    musicRef.current = music;

    music.play();
    const retry = () => { if (!music.isUnlocked) music.play(); };
    document.addEventListener("pointerdown", retry);

    const offPause  = onPause(()  => music.stop());
    const offResume = onResume(() => { if (music.isUnlocked) music.play(); });

    return () => {
      document.removeEventListener("pointerdown", retry);
      offPause(); offResume();
      sound.dispose(); music.dispose();
      soundRef.current = null; musicRef.current = null;
    };
  }, []);

  useEffect(() => { soundRef.current?.setFxEnabled(settings.fx); },    [settings.fx]);
  useEffect(() => { musicRef.current?.setMusicEnabled(settings.music); }, [settings.music]);
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);

  // PlayroomKit connection
  useEffect(() => {
    if (phase.kind !== "playroom_connecting") return;
    const joinCode = phase.joinRoomCode;
    let cancelled = false;

    async function connect() {
      try {
        await insertCoin({ skipLobby: true, maxPlayersPerRoom: 2, ...(joinCode ? { roomCode: joinCode } : {}) });
        if (cancelled) return;

        const transport = await PlayroomTransport.create();
        if (cancelled) { transport.disconnect(); return; }

        startTransition(() =>
          setPhase({ kind: "lobby", transport, roomCode: getRoomCode() ?? "----", amHost: isHost() }),
        );
      } catch (err) {
        if (!cancelled) {
          console.error("[{{GAME_PASCAL}}] Connection failed:", err);
          startTransition(() => setPhase({ kind: "menu" }));
        }
      }
    }

    void connect();
    return () => { cancelled = true; };
  }, [phase]);

  const toggleSetting = (key: keyof GameSettings) =>
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault(); e.stopPropagation();
      const now = Date.now();
      if (now - lastToggle.current < 300) return;
      lastToggle.current = now;
      setSettings(prev => {
        const next = { ...prev, [key]: !prev[key] };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        return next;
      });
      if (settings.haptics) oasiz.triggerHaptic("light");
    };

  const handleReturnToLobby = () => {
    const t = phase.kind === "playing" || phase.kind === "game_end" ? phase.transport : undefined;
    if (!t) { setPhase({ kind: "menu" }); return; }
    t.resetLobby();
    startTransition(() =>
      setPhase({ kind: "lobby", transport: t, roomCode: getRoomCode() ?? "----", amHost: isHost() }),
    );
  };

  const handleLeaveToMenu = () => {
    const t = phase.kind === "playing" || phase.kind === "game_end" ? phase.transport : undefined;
    t?.disconnect();
    setPhase({ kind: "menu" });
  };

  // ── Render ────────────────────────────────────────────────────────

  if (phase.kind === "splash") {
    return <SplashScreen onComplete={() => setPhase({ kind: "menu" })} preload={preloadAssets} />;
  }

  if (phase.kind === "menu") {
    return (
      <StartScreen
        safeAreaTop={safeAreaTop}
        settings={settings}
        musicManager={musicRef.current}
        onToggleSetting={toggleSetting}
        onPlaySolo={() => setPhase({ kind: "playing" })}
        onPlayFriend={() => setPhase({ kind: "playroom_connecting" })}
        onJoinRoom={(code) => setPhase({ kind: "playroom_connecting", joinRoomCode: code })}
      />
    );
  }

  if (phase.kind === "playroom_connecting") {
    return (
      <main className="screen connecting-screen">
        <p className="connecting-label">Connecting...</p>
      </main>
    );
  }

  if (phase.kind === "lobby") {
    return (
      <LobbyScreen
        transport={phase.transport}
        roomCode={phase.roomCode}
        amHost={phase.amHost}
        safeAreaTop={safeAreaTop}
        settings={settings}
        musicManager={musicRef.current}
        onToggleSetting={toggleSetting}
        onGameStart={() =>
          startTransition(() =>
            setPhase({ kind: "playing", transport: phase.transport, amHost: phase.amHost }),
          )
        }
        onLeave={handleLeaveToMenu}
      />
    );
  }

  if (phase.kind === "playing") {
    return (
      <GameScreen
        transport={phase.transport}
        amHost={phase.amHost}
        safeAreaTop={safeAreaTop}
        settings={settings}
        soundManager={soundRef.current}
        musicManager={musicRef.current}
        onToggleSetting={toggleSetting}
        onGameEnd={() =>
          startTransition(() =>
            setPhase({ kind: "game_end", transport: phase.transport, amHost: phase.amHost }),
          )
        }
      />
    );
  }

  // game_end
  return (
    <GameEndScreen
      safeAreaTop={safeAreaTop}
      settings={settings}
      onToggleSetting={toggleSetting}
      onPlayAgain={handleReturnToLobby}
      onMainMenu={handleLeaveToMenu}
    />
  );
}

import { useEffect, useRef, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
  // Optional async preload — runs in parallel with the animation.
  // onComplete fires only when BOTH the minimum display time AND preload have finished.
  preload?: () => Promise<void>;
}

export function SplashScreen({ onComplete, preload }: SplashScreenProps) {
  const [phase, setPhase] = useState<"hidden" | "visible" | "out">("hidden");
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    let cancelled = false;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => {
      const id = window.setTimeout(() => { if (!cancelled) fn(); }, ms);
      timers.push(id);
    };

    // Minimum display time (2s) — resolves via a flag checked by the settle function
    let animDone = false;
    let loadDone = false;

    const settle = () => {
      if (animDone && loadDone && !cancelled) onCompleteRef.current();
    };

    after(80,   () => setPhase("visible"));
    after(1600, () => setPhase("out"));
    after(2050, () => { animDone = true; settle(); });

    // Asset preload — resolves independently
    const assetLoad = preload ? preload() : Promise.resolve();
    void assetLoad.then(() => { loadDone = true; settle(); });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className={`screen splash-screen splash-${phase}`}>
      <div className="splash-logo">
        OASIZ<span className="splash-tm">TM</span>
      </div>
      <p className="splash-tagline">An <strong>OASIZ</strong> Classic</p>
    </main>
  );
}

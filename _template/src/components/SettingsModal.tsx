import type { GameSettings } from "../types";

interface SettingsModalProps {
  settings: GameSettings;
  onToggle: (key: keyof GameSettings) => (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClose: () => void;
}

export function SettingsModal({ settings, onToggle, onClose }: SettingsModalProps) {
  return (
    <div className="settings-backdrop" onClick={onClose}>
      <section className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <div>
            <p className="settings-eyebrow">Controls</p>
            <h2>Settings</h2>
          </div>
          <button type="button" className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }} onClick={onClose}>
            Close
          </button>
        </div>
        <div className="toggle-grid">
          {(["fx", "music", "haptics"] as const).map(key => (
            <button key={key} type="button" className={`toggle-row${settings[key] ? " active" : ""}`} onClick={onToggle(key)}>
              <span className="toggle-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              <span className="toggle-value">{settings[key] ? "On" : "Off"}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

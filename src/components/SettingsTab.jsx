import { CIV_UNLOCK_MINDS, CIV_ERAS } from "../data/civilisation";
import { ECHO_THRESHOLD } from "../data/elements";
import { fmt, fmtTime } from "../utils/format";

export default function SettingsTab({
  theme, darkMode, setDarkMode, fontScale, setFontScale,
  autopilot, setAutopilot, autopilotRunning, autopilotResults, autopilotProgress,
  simClickRate, setSimClickRate,
  handleExportSave, loadStatus,
  onShowLoadModal, onShowDeleteConfirm,
}) {
  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <div style={{ fontSize: "0.65rem", color: theme.textDim, letterSpacing: "0.18em", marginBottom: "16px" }}>⚙ SETTINGS</div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        {/* Dark mode */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a1020", border: "1px solid #1a2a40", borderRadius: "6px", padding: "10px 14px" }}>
          <span style={{ fontSize: "0.6rem", letterSpacing: "0.1em" }}>DARK MODE</span>
          <button onClick={() => setDarkMode(m => !m)} style={{ background: darkMode ? "#c77dff22" : "transparent", border: `1px solid ${darkMode ? "#c77dff" : "#4a3a6a"}`, borderRadius: "4px", color: darkMode ? "#c77dff" : "#7a5aaa", padding: "4px 12px", cursor: "pointer", fontSize: "0.58rem", fontFamily: "'Courier New', monospace" }}>{darkMode ? "ON" : "OFF"}</button>
        </div>

        {/* Font size */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a1020", border: "1px solid #1a2a40", borderRadius: "6px", padding: "10px 14px" }}>
          <span style={{ fontSize: "0.6rem", letterSpacing: "0.1em" }}>FONT SIZE</span>
          <div style={{ display: "flex", gap: "6px" }}>
            {[0.85, 1, 1.15].map(s => (
              <button key={s} onClick={() => setFontScale(s)} style={{ background: fontScale === s ? "#4d96ff22" : "transparent", border: `1px solid ${fontScale === s ? "#4d96ff" : "#2a3a50"}`, borderRadius: "4px", color: fontScale === s ? "#4d96ff" : "#4a5a70", padding: "4px 10px", cursor: "pointer", fontSize: "0.58rem", fontFamily: "'Courier New', monospace" }}>
                {s === 0.85 ? "S" : s === 1 ? "M" : "L"}
              </button>
            ))}
          </div>
        </div>

        {/* Autopilot simulation */}
        <div style={{ background: "#080c18", border: "1px solid #1a2a40", borderRadius: "6px", padding: "10px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: autopilot ? "10px" : "0" }}>
            <div>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.1em" }}>AUTOPILOT SIMULATION</div>
              <div style={{ fontSize: "0.52rem", color: theme.textFaint, marginTop: "2px" }}>Simulate a full run and measure milestone times</div>
            </div>
            <button
              onClick={() => { setAutopilot(a => !a); }}
              disabled={autopilotRunning}
              style={{
                background: autopilot ? "#4d96ff22" : "transparent",
                border: `1px solid ${autopilot ? "#4d96ff" : "#2a3a50"}`,
                borderRadius: "4px", color: autopilot ? "#4d96ff" : "#4a5a70",
                padding: "4px 12px", cursor: autopilotRunning ? "not-allowed" : "pointer",
                fontSize: "0.58rem", fontFamily: "'Courier New', monospace",
              }}>{autopilot ? "ON" : "OFF"}</button>
          </div>

          {autopilot && (
            <>
              {/* Click rate */}
              <div style={{ marginBottom: "10px" }}>
                <div style={{ fontSize: "0.52rem", color: theme.textFaint, letterSpacing: "0.1em", marginBottom: "6px" }}>
                  CLICKS/SEC — {simClickRate < 1 ? `1 click every ${fmt(1 / simClickRate)}s` : `${simClickRate}/sec`}
                </div>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {[0.1, 0.25, 0.5, 1, 2, 5, 10].map(r => (
                    <button key={r} onClick={() => setSimClickRate(r)}
                      style={{
                        background: simClickRate === r ? "#4d96ff22" : "transparent",
                        border: `1px solid ${simClickRate === r ? "#4d96ff" : "#1a2a40"}`,
                        borderRadius: "4px", color: simClickRate === r ? "#4d96ff" : "#3a4a60",
                        padding: "3px 7px", cursor: "pointer", fontSize: "0.52rem",
                        fontFamily: "'Courier New', monospace",
                      }}>
                      {r < 1 ? `1/${Math.round(1 / r)}s` : `${r}/s`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Running indicator */}
              {autopilotRunning && autopilotProgress && (
                <div style={{ fontSize: "0.55rem", color: "#4d96ff88", letterSpacing: "0.1em", marginTop: "4px" }}>
                  ⏳ {autopilotProgress.phase} — {fmtTime(autopilotProgress.elapsed)} simulated
                </div>
              )}

              {/* Results */}
              {autopilotResults && !autopilotRunning && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                  <div style={{ fontSize: "0.5rem", color: theme.textFaint, letterSpacing: "0.12em", marginBottom: "2px" }}>
                    SIMULATION RESULTS — {autopilotResults.clickRate < 1 ? `1 click every ${fmt(1 / autopilotResults.clickRate)}s` : `${autopilotResults.clickRate}/sec`}
                    {autopilotResults.capped && <span style={{ color: "#ff6b6b88" }}> (48h cap reached)</span>}
                  </div>
                  <div style={{ fontSize: "0.5rem", color: "#3a4a5a", padding: "4px 6px", background: "#080c14", borderRadius: "4px", marginBottom: "4px" }}>
                    sim end: {fmt(autopilotResults.quarksAtEnd)} quarks · {fmt(autopilotResults.mindsAtEnd)} peak minds · {fmtTime(autopilotResults.simElapsed)} simulated
                  </div>
                  {[
                    { label: "First Prestige",        desc: `${fmt(ECHO_THRESHOLD)} lifetime Quarks`,      time: autopilotResults.firstPrestige, color: "#ff6b6b", icon: "✨" },
                    { label: "Civ Unlock Visible",    desc: `${fmt(CIV_UNLOCK_MINDS * 0.5)} peak Minds`,  time: autopilotResults.civVisible,    color: "#c4a35a", icon: "👁" },
                    { label: "Civilisation Unlocked", desc: `${fmt(CIV_UNLOCK_MINDS)} peak Minds`,        time: autopilotResults.civUnlock,     color: "#6bcb77", icon: "🏕" },
                  ].map(({ label, desc, time, color, icon }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a0f1a", border: `1px solid ${color}22`, borderRadius: "5px", padding: "7px 10px" }}>
                      <div>
                        <div style={{ fontSize: "0.6rem", color, fontWeight: "bold" }}>{icon} {label}</div>
                        <div style={{ fontSize: "0.5rem", color: theme.textFaint, marginTop: "1px" }}>{desc}</div>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: time ? color : "#3a4a5a", fontWeight: "bold", textAlign: "right" }}>
                        {time ? fmtTime(time) : "not reached"}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => { setAutopilot(false); setTimeout(() => setAutopilot(true), 50); }}
                    style={{ background: "transparent", border: "1px solid #2a3a50", borderRadius: "4px", color: "#4a5a70", padding: "5px", cursor: "pointer", fontSize: "0.52rem", letterSpacing: "0.1em", fontFamily: "'Courier New', monospace", marginTop: "2px" }}>
                    ↺ RE-RUN SIMULATION
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Save/Load/Delete */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button onClick={handleExportSave} style={{ background: "#0a1a10", border: "1px solid #6bcb7788", borderRadius: "6px", color: "#6bcb77", padding: "12px 20px", cursor: "pointer", fontSize: "0.65rem", letterSpacing: "0.14em", fontFamily: "'Courier New', monospace", textAlign: "left" }}>
          <div>💾 SAVE FILE</div>
          <div style={{ fontSize: "0.52rem", color: "#6bcb7788", marginTop: "3px" }}>Export your save to a text file</div>
        </button>
        <button onClick={onShowLoadModal} style={{ background: "#0a1020", border: "1px solid #4d96ff88", borderRadius: "6px", color: "#4d96ff", padding: "12px 20px", cursor: "pointer", fontSize: "0.65rem", letterSpacing: "0.14em", fontFamily: "'Courier New', monospace", textAlign: "left" }}>
          <div>📂 LOAD FILE</div>
          <div style={{ fontSize: "0.52rem", color: "#4d96ff88", marginTop: "3px" }}>Load from a file or paste save text</div>
        </button>
        {loadStatus && (
          <div style={{ fontSize: "0.57rem", color: loadStatus.ok ? "#6bcb77" : "#ff6b6b", letterSpacing: "0.08em", textAlign: "center", padding: "4px" }}>
            {loadStatus.ok ? "✓" : "✗"} {loadStatus.msg}
          </div>
        )}
        <div style={{ borderTop: "1px solid #1a2a40", marginTop: "8px", paddingTop: "8px" }}>
          <button onClick={onShowDeleteConfirm} style={{ width: "100%", background: "#1a0808", border: "1px solid #ff6b6b88", borderRadius: "6px", color: "#ff6b6b", padding: "12px 20px", cursor: "pointer", fontSize: "0.65rem", letterSpacing: "0.14em", fontFamily: "'Courier New', monospace", textAlign: "left" }}>
            <div>🗑 DELETE SAVE</div>
            <div style={{ fontSize: "0.52rem", color: "#ff6b6b88", marginTop: "3px" }}>Permanently erase all progress</div>
          </button>
        </div>
      </div>

      <div style={{ fontSize: "0.5rem", color: theme.textFaint, letterSpacing: "0.12em", textAlign: "center", marginTop: "20px" }}>
        AUTO-SAVES EVERY 5 SECONDS · OFFLINE PROGRESS UP TO 4 HOURS
      </div>
    </div>
  );
}

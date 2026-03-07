import { ECHO_THRESHOLD } from "../data/elements";
import { prestigeMultiplier } from "../game/stats";
import { fmt } from "../utils/format";

export default function PrestigeTab({
  state, pMult, prestigePreview, canPrestige, theme,
  doPrestige, showPrestigeConfirm, setShowPrestigeConfirm,
}) {
  return (
    <div style={{ maxWidth: "540px", margin: "0 auto" }}>
      <div style={{
        background: "#0d0820", border: "1px solid #c77dff44", borderRadius: "8px",
        padding: "16px", marginBottom: "16px", fontSize: "0.62rem",
      }}>
        <div style={{ color: "#c77dff", fontSize: "0.72rem", letterSpacing: "0.2em", marginBottom: "10px" }}>✨ PRESTIGE</div>
        <div style={{ color: theme.textDim, marginBottom: "12px", lineHeight: 1.7 }}>
          Reset all resources and converters. Gain Echoes based on lifetime Quarks earned, which permanently multiply all production.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          {[
            { val: fmt(state.totalQuarksEarned), label: "LIFETIME QUARKS", color: "#ff6b6b" },
            { val: `+${prestigePreview}`,         label: "ON PRESTIGE",     color: "#aaeeff" },
            { val: `×${pMult.toFixed(2)}`,        label: "CURRENT MULT",    color: "#c77dff" },
          ].map(({ val, label, color }) => (
            <div key={label} style={{ background: "#0a1020", border: "1px solid #1a2a40", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "0.86rem", color, fontWeight: "bold" }}>{val}</div>
              <div style={{ fontSize: "0.46rem", color: theme.textFaint, letterSpacing: "0.1em", marginTop: "2px" }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: "0.58rem", color: theme.textDim, marginBottom: "12px" }}>
          <div>• Echoes = <span style={{ color: "#c77dff" }}>floor(log₂(lifetime Quarks ÷ {fmt(ECHO_THRESHOLD)}))</span></div>
          <div>• Each Echo = <span style={{ color: "#6bcb77" }}>+10% global production</span></div>
          <div style={{ marginTop: "6px", padding: "8px", background: "#0a1020", borderRadius: "5px" }}>
            <div style={{ color: "#aaeeff" }}>Current bonus: <strong>×{pMult.toFixed(2)}</strong> ({state.totalEchoesEarned || 0} total echoes)</div>
            {prestigePreview > 0 && (
              <div style={{ color: "#c77dff", marginTop: "2px" }}>
                After prestige: <strong>×{prestigeMultiplier((state.totalEchoesEarned || 0) + prestigePreview).toFixed(2)}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: "#080d18", border: "1px solid #1a2a40", borderRadius: "6px", padding: "10px 14px", fontSize: "0.6rem", color: theme.textDim, marginBottom: "14px" }}>
        Lifetime Quarks: <span style={{ color: "#ff6b6b" }}>{fmt(state.totalQuarksEarned)}</span>
        {" → "}<span style={{ color: "#c77dff" }}>{prestigePreview} Echoes</span>
        {!canPrestige && <span style={{ color: "#3a4a5a", marginLeft: "8px" }}>(need {fmt(ECHO_THRESHOLD)} Quarks)</span>}
      </div>

      {!showPrestigeConfirm ? (
        <button onClick={() => canPrestige && setShowPrestigeConfirm(true)} disabled={!canPrestige} style={{
          width: "100%", borderRadius: "8px", padding: "14px",
          background: canPrestige ? "#c77dff18" : "transparent",
          border: `2px solid ${canPrestige ? "#c77dff" : "#2a1a4a"}`,
          color: canPrestige ? "#c77dff" : "#2a1a4a",
          cursor: canPrestige ? "pointer" : "not-allowed",
          fontSize: "0.72rem", letterSpacing: "0.22em",
          fontFamily: "'Courier New', monospace",
        }}>
          ✨ INITIATE PRESTIGE {!canPrestige ? `(need ${fmt(ECHO_THRESHOLD)} Quarks)` : `(+${prestigePreview} Echoes)`}
        </button>
      ) : (
        <div style={{ background: "#1a0a2a", border: "2px solid #c77dff", borderRadius: "8px", padding: "18px", textAlign: "center" }}>
          <div style={{ color: "#c77dff", fontSize: "0.78rem", letterSpacing: "0.2em", marginBottom: "8px" }}>CONFIRM PRESTIGE?</div>
          <div style={{ color: "#7755aa", fontSize: "0.6rem", marginBottom: "14px" }}>
            All resources &amp; converters reset. You gain {prestigePreview} Echoes → ×{prestigeMultiplier((state.totalEchoesEarned || 0) + prestigePreview).toFixed(2)} production.
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={doPrestige} style={{ background: "#c77dff33", border: "1px solid #c77dff", borderRadius: "5px", color: "#c77dff", padding: "8px 22px", cursor: "pointer", fontSize: "0.62rem", letterSpacing: "0.15em", fontFamily: "'Courier New', monospace" }}>YES, PRESTIGE</button>
            <button onClick={() => setShowPrestigeConfirm(false)} style={{ background: "transparent", border: "1px solid #2a3a50", borderRadius: "5px", color: "#4466aa", padding: "8px 22px", cursor: "pointer", fontSize: "0.62rem", letterSpacing: "0.15em", fontFamily: "'Courier New', monospace" }}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  );
}

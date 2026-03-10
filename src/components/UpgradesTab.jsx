import { UPGRADES } from "../data/upgrades";
import { ELEMENTS } from "../data/elements";
import { universeOverclockCost } from "../game/stats";
import { fmt } from "../utils/format";

export default function UpgradesTab({
  state, stats, theme,
  showPurchased, setShowPurchased,
  buyUpgrade, buyUniverseOverclock,
}) {
  const sections = [
    { label: "⚛ QUARK UPGRADES", accentColor: "#ff6b6b", upgrades: UPGRADES.filter(up => up.cost[0] > 0 && up.cost[1] === 0 && !up.requiresTier).sort((a, b) => a.cost[0] - b.cost[0]) },
    { label: "🔗 CHAIN UPGRADES", accentColor: "#6bcb77", upgrades: UPGRADES.filter(up => up.requiresTier).sort((a, b) => a.cost[0] - b.cost[0]) },
    { label: "✨ ECHO UPGRADES",  accentColor: "#c77dff", upgrades: UPGRADES.filter(up => up.cost[1] > 0) },
  ];

  const allBought = UPGRADES.every(up => state.purchasedUpgrades.includes(up.id));
  const ocCount   = state.universeOverclockCount || 0;
  const ocCost    = universeOverclockCost(ocCount);
  const ocAfford  = state.echoes >= ocCost;

  return (
    <div>
      <div style={{ fontSize: "0.58rem", color: theme.textDim, marginBottom: "10px", letterSpacing: "0.1em", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>
          PERMANENT BOOSTS —{" "}
          <span style={{ color: "#ff6b6b" }}>{fmt(state.amounts[0])} Quarks</span>
          {" · "}
          <span style={{ color: "#c77dff" }}>{state.echoes} Echoes ✨</span>
        </span>
        <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", whiteSpace: "nowrap", marginLeft: "12px" }}>
          <input type="checkbox" checked={showPurchased} onChange={e => setShowPurchased(e.target.checked)} style={{ accentColor: "#c77dff", cursor: "pointer" }} />
          <span style={{ fontSize: "0.5rem", letterSpacing: "0.08em" }}>SHOW OWNED</span>
        </label>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {sections.map(({ label, accentColor, upgrades }) => {
          const visible = upgrades.filter(up => {
            const owned = state.purchasedUpgrades.includes(up.id);
            if (owned && !showPurchased) return false;
            if (up.requiresTier && state.converters[up.requiresTier] < 1) return false;
            if (up.requiresCiv && !state.civUnlocked) return false;
            return true;
          });
          if (visible.length === 0) return null;

          return (
            <div key={label}>
              <div style={{ fontSize: "0.5rem", color: accentColor, letterSpacing: "0.18em", marginBottom: "8px", paddingBottom: "5px", borderBottom: `1px solid ${accentColor}22` }}>
                {label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {visible.map(up => {
                  const owned     = state.purchasedUpgrades.includes(up.id);
                  const [costQ, costE] = up.cost;
                  const canAfford = state.amounts[0] >= costQ && state.echoes >= costE;
                  const tierColor = up.tier === -1 ? "#c77dff" : (up.tier >= 0 ? ELEMENTS[up.tier]?.color : "#fff");
                  return (
                    <div key={up.id} style={{
                      display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center",
                      background: owned ? "#0a0c10" : (canAfford ? "#0d1525" : "#090c14"),
                      border: `1px solid ${owned ? "#1a2030" : (canAfford ? tierColor + "66" : "#1a2030")}`,
                      borderRadius: "6px", padding: "8px 12px", gap: "10px",
                      opacity: owned ? 0.45 : 1,
                    }}>
                      <div>
                        <div style={{ fontSize: "0.67rem", fontWeight: "bold", color: owned ? "#445" : tierColor }}>{up.name} {owned && "✓"}</div>
                        <div style={{ fontSize: "0.58rem", color: owned ? "#445" : "#6699bb", marginTop: "2px" }}>{up.desc}</div>
                        <div style={{ fontSize: "0.54rem", color: theme.textDim, marginTop: "3px" }}>
                          Cost:
                          {costQ > 0 && <span style={{ color: "#ff6b6b88" }}> {fmt(costQ)} Quarks</span>}
                          {costQ > 0 && costE > 0 && " +"}
                          {costE > 0 && <span style={{ color: "#c77dff88" }}> {costE} Echoes ✨</span>}
                        </div>
                      </div>
                      {!owned && (
                        <button onClick={() => buyUpgrade(up.id)} disabled={!canAfford} style={{
                          background: canAfford ? tierColor + "22" : "transparent",
                          border: `1px solid ${canAfford ? tierColor : "#1a2a30"}`,
                          borderRadius: "5px", color: canAfford ? tierColor : "#2a3a40",
                          padding: "6px 12px", cursor: canAfford ? "pointer" : "not-allowed",
                          fontSize: "0.58rem", letterSpacing: "0.1em", whiteSpace: "nowrap",
                          fontFamily: "'Courier New', monospace",
                        }}>UNLOCK</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {allBought && (
          <div>
            <div style={{ fontSize: "0.5rem", color: "#e8c44a", letterSpacing: "0.18em", marginBottom: "8px", paddingBottom: "5px", borderBottom: "1px solid #e8c44a22" }}>
              ⚡ OVERCLOCKS
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center",
              background: ocAfford ? "#1a1a0a" : "#0d0d0a",
              border: `1px solid ${ocAfford ? "#e8c44a88" : "#2a2a1a"}`,
              borderRadius: "6px", padding: "10px 12px", gap: "10px",
            }}>
              <div>
                <div style={{ fontSize: "0.67rem", fontWeight: "bold", color: ocAfford ? "#e8c44a" : "#5a5a2a" }}>⚡ Quantum Overclock #{ocCount + 1}</div>
                <div style={{ fontSize: "0.58rem", color: "#6688aa", marginTop: "2px" }}>All universe production ×{(Math.pow(1.1, ocCount + 1)).toFixed(2)} total (+10%)</div>
                <div style={{ fontSize: "0.54rem", color: theme.textDim, marginTop: "3px" }}>
                  Cost: <span style={{ color: "#c77dff88" }}>{ocCost} Echoes ✨</span>
                  {ocCount > 0 && <span style={{ color: theme.textFaint, marginLeft: "8px" }}>purchased {ocCount}×</span>}
                </div>
              </div>
              <button onClick={buyUniverseOverclock} disabled={!ocAfford} style={{
                background: ocAfford ? "#e8c44a22" : "transparent",
                border: `1px solid ${ocAfford ? "#e8c44a" : "#2a2a1a"}`,
                borderRadius: "5px", color: ocAfford ? "#e8c44a" : "#3a3a2a",
                padding: "6px 12px", cursor: ocAfford ? "pointer" : "not-allowed",
                fontSize: "0.58rem", letterSpacing: "0.1em", whiteSpace: "nowrap",
                fontFamily: "'Courier New', monospace",
              }}>BOOST</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

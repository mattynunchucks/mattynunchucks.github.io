import { CIV_TIERS, CIV_ERAS, CIV_BASE_RATE } from "../data/civilisation";
import { civConverterCost, civMaxConverters } from "../game/converters";
import { calcCivMindBonus } from "../game/stats";
import { fmt } from "../utils/format";

export default function CivilisationTab({ state, theme, buyCivConverter, dismissEra }) {
  const civMindBonus = calcCivMindBonus(state.totalCultureEver || 0);
  const cultureRate  = CIV_TIERS.reduce((sum, _, i) =>
    sum + (state.civConverters[i] > 0 ? state.civConverters[i] * CIV_BASE_RATE * Math.pow(1.5, i) : 0), 0
  );
  const nextEra = CIV_ERAS.find(e => !(state.firedEras || []).includes(e.id));

  return (
    <div>
      {/* Era notification banner */}
      {state.pendingEra && (() => {
        const era = state.pendingEra;
        return (
          <div style={{
            background: "linear-gradient(90deg, #1a1005, #100c02)",
            border: "1px solid #c4a35a88", borderRadius: "8px",
            padding: "12px 14px", marginBottom: "12px",
            animation: "discoveryPulse 0.4s ease-out",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{era.emoji}</span>
                <div>
                  <div style={{ fontSize: "0.6rem", color: "#c4a35a", letterSpacing: "0.18em", marginBottom: "3px" }}>✦ NEW ERA</div>
                  <div style={{ fontSize: "0.72rem", color: "#eef4ff", fontWeight: "bold", marginBottom: "5px" }}>{era.title}</div>
                  <div style={{ fontSize: "0.57rem", color: "#9aaabb", lineHeight: 1.6, fontStyle: "italic" }}>{era.flavour}</div>
                  <div style={{ fontSize: "0.52rem", color: "#6bcb77", marginTop: "6px", letterSpacing: "0.08em" }}>
                    ▲ Mind production +{Math.round(civMindBonus * 100)}% total from civilisation
                  </div>
                </div>
              </div>
              <button onClick={dismissEra} style={{
                background: "transparent", border: "1px solid #c4a35a44",
                borderRadius: "4px", color: "#c4a35a88", padding: "3px 8px",
                cursor: "pointer", fontSize: "0.55rem", whiteSpace: "nowrap",
                fontFamily: "'Courier New', monospace", flexShrink: 0,
              }}>UNDERSTOOD</button>
            </div>
          </div>
        );
      })()}

      {/* Culture stats bar */}
      <div style={{ background: "#0e0b05", border: "1px solid #2a2010", borderRadius: "6px", padding: "10px 14px", marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "0.6rem", color: "#c4a35a", letterSpacing: "0.14em" }}>🎭 CULTURE</span>
          <span style={{ fontSize: "0.6rem", color: "#a08840" }}>{fmt(state.culture || 0)} ({cultureRate > 0 ? `+${fmt(cultureRate)}/s` : "idle"})</span>
        </div>
        {civMindBonus > 0 && (
          <div style={{ fontSize: "0.55rem", color: "#6bcb77", marginBottom: "8px" }}>
            ✦ Mind production +{Math.round(civMindBonus * 100)}%
          </div>
        )}
        {nextEra && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "0.52rem", color: "#8a7030" }}>{nextEra.emoji} Next: {nextEra.title}</span>
              <span style={{ fontSize: "0.52rem", color: "#6a5020" }}>{fmt(state.totalCultureEver || 0)} / {fmt(nextEra.at)}</span>
            </div>
            <div style={{ height: "4px", background: "#1a1208", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "3px",
                width: `${Math.min(100, ((state.totalCultureEver || 0) / nextEra.at) * 100)}%`,
                background: "linear-gradient(90deg, #8a6020, #c4a35a)",
                transition: "width 0.4s ease",
              }} />
            </div>
          </>
        )}
        {!nextEra && (state.firedEras || []).length === CIV_ERAS.length && (
          <div style={{ fontSize: "0.55rem", color: "#c4a35a" }}>✦ All eras unlocked — the modern age dawns</div>
        )}
      </div>

      {/* Civ tier rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {CIV_TIERS.map((tier, i) => {
          const convCount    = state.civConverters[i] || 0;
          const cap          = civMaxConverters(i, state.civConverters);
          const cost         = civConverterCost(i, convCount);
          const payAmount    = i === 0 ? state.amounts[8] : (state.civAmounts[i - 1] || 0);
          const canAfford    = payAmount >= cost && convCount < cap;
          const atCap        = convCount >= cap && cap !== Infinity;
          const ownAmount    = state.civAmounts[i] || 0;
          const rate         = convCount > 0 ? convCount * CIV_BASE_RATE * Math.pow(1.5, i) : 0;
          const isLocked     = i > 0 && (state.civConverters[i - 1] || 0) === 0;
          const producesName = i === 0 ? "Culture" : tier.name;
          const costsName    = i === 0 ? "Minds" : CIV_TIERS[i - 1].name;

          return (
            <div key={tier.id} style={{
              display: "grid", gridTemplateColumns: "2rem 1fr auto",
              alignItems: "center", gap: "10px",
              background: isLocked ? "#080808" : (canAfford ? "#120f06" : "#0d0b05"),
              border: `1px solid ${isLocked ? "#111" : (canAfford ? tier.color + "55" : "#2a2010")}`,
              borderRadius: "7px", padding: "9px 12px",
              opacity: isLocked ? 0.35 : 1,
            }}>
              <div style={{ fontSize: "1.3rem", textAlign: "center" }}>{tier.emoji}</div>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontSize: "0.67rem", fontWeight: "bold", color: tier.color }}>{tier.name}</span>
                  <span style={{ fontSize: "0.48rem", color: "#6a5828" }}>{tier.desc}</span>
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "3px", alignItems: "baseline" }}>
                  <span style={{ fontSize: "0.58rem", color: "#b8900a" }}>
                    {fmt(ownAmount)} <span style={{ color: "#7a6020", fontSize: "0.5rem" }}>{producesName}</span>
                  </span>
                  {rate > 0 && <span style={{ fontSize: "0.52rem", color: "#7a6020" }}>+{fmt(rate)}/s</span>}
                </div>
                <div style={{ fontSize: "0.5rem", color: "#5a4818", marginTop: "2px" }}>
                  {`Cost: ${fmt(cost)} ${costsName}`}
                  {i > 0 && cap !== Infinity && ` · cap: ${cap}`}
                  {i > 0 && <span style={{ color: "#4a3808" }}> · have: {fmt(payAmount)}</span>}
                </div>
              </div>
              <button
                onClick={() => buyCivConverter(i)}
                disabled={!canAfford || atCap}
                style={{
                  background: atCap ? "transparent" : (canAfford ? tier.color + "22" : "transparent"),
                  border: `1px solid ${atCap ? "#2a2010" : (canAfford ? tier.color : "#3a2a10")}`,
                  borderRadius: "5px",
                  color: atCap ? "#3a2a10" : (canAfford ? tier.color : "#4a3a18"),
                  padding: "5px 10px", cursor: canAfford && !atCap ? "pointer" : "not-allowed",
                  fontSize: "0.55rem", letterSpacing: "0.1em", whiteSpace: "nowrap",
                  fontFamily: "'Courier New', monospace", minWidth: "64px", textAlign: "center",
                }}>
                {atCap ? `${convCount}/${cap}` : (canAfford ? `+1 (${convCount})` : `${convCount}`)}
              </button>
            </div>
          );
        })}
      </div>

      {/* Era history */}
      {(state.firedEras || []).length > 0 && (
        <div style={{ marginTop: "16px", borderTop: "1px solid #2a2010", paddingTop: "12px" }}>
          <div style={{ fontSize: "0.5rem", color: "#6a5020", letterSpacing: "0.16em", marginBottom: "8px" }}>📜 ERA HISTORY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {CIV_ERAS.filter(e => (state.firedEras || []).includes(e.id)).map(era => (
              <div key={era.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 8px", background: "#0a0805", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.9rem" }}>{era.emoji}</span>
                <div>
                  <div style={{ fontSize: "0.58rem", color: "#c4a35a" }}>{era.title}</div>
                  <div style={{ fontSize: "0.5rem", color: "#6a5828", fontStyle: "italic" }}>{era.flavour}</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: "0.5rem", color: "#4bcb55" }}>+{Math.round(era.mindBonus * 100)}% Minds</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

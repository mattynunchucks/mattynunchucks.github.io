import { ELEMENTS, ECHO_THRESHOLD } from "../data/elements";
import { converterCost, maxConverters } from "../game/converters";
import { calcEchoesFromRun } from "../game/stats";
import { fmt, fmtTime } from "../utils/format";

export default function GameTab({ state, stats, rates, theme, handleClick, buyConverter, dismissDiscovery }) {
  return (
    <>
      {/* Click button */}
      <div style={{ textAlign: "center", marginBottom: "18px" }}>
        <button
          onClick={handleClick}
          style={{
            background: "radial-gradient(circle at 40% 35%, #ff6b6b44, #ff6b6b11)",
            border: "2px solid #ff6b6b", borderRadius: "50%",
            width: "88px", height: "88px", fontSize: "2.1rem",
            cursor: "pointer", transition: "transform 0.1s",
            boxShadow: "0 0 20px #ff6b6b44, 0 0 60px #ff6b6b11", color: "white",
          }}
          onMouseDown={e  => (e.currentTarget.style.transform = "scale(0.93)")}
          onMouseUp={e    => (e.currentTarget.style.transform = "scale(1.06)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
        >⚛</button>
        <div style={{ fontSize: "0.62rem", color: "#ff6b6bbb", marginTop: "6px", letterSpacing: "0.12em" }}>
          +{fmt(stats.clickMult)} QUARKS / CLICK · {Math.floor((state.totalQuarksEarned || 0) / 7)} QUARK SLOTS
        </div>
        {(stats.globalMult > 1 || (1 + (state.totalEchoesEarned || 0) * 0.1) > 1) && (
          <div style={{ fontSize: "0.56rem", color: "#c77dffaa", marginTop: "2px" }}>
            ×{(stats.globalMult * (1 + (state.totalEchoesEarned || 0) * 0.1)).toFixed(2)} total multiplier
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
        {/* Discovery banner */}
        {state.pendingDiscovery && (() => {
          const d = state.pendingDiscovery;
          return (
            <div style={{
              background: "linear-gradient(90deg, #0a0820, #0d1030)",
              border: "1px solid #c77dff88", borderRadius: "8px",
              padding: "12px 14px", marginBottom: "4px",
              animation: "discoveryPulse 0.4s ease-out",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{d.emoji}</span>
                  <div>
                    <div style={{ fontSize: "0.6rem", color: "#c77dff", letterSpacing: "0.18em", marginBottom: "3px" }}>
                      ✦ DISCOVERY
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#eef4ff", fontWeight: "bold", marginBottom: "5px" }}>
                      {d.title}
                    </div>
                    <div style={{ fontSize: "0.57rem", color: "#9aaabb", lineHeight: 1.6, fontStyle: "italic" }}>
                      {d.flavour}
                    </div>
                    {d.boost > 0 && (
                      <div style={{ fontSize: "0.52rem", color: "#6bcb77", marginTop: "6px", letterSpacing: "0.08em" }}>
                        ▲ All resources ×{d.boost} — a surge of cosmic energy
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={dismissDiscovery} style={{
                  background: "transparent", border: "1px solid #c77dff44",
                  borderRadius: "4px", color: "#c77dff88", padding: "3px 8px",
                  cursor: "pointer", fontSize: "0.55rem", whiteSpace: "nowrap",
                  fontFamily: "'Courier New', monospace", flexShrink: 0,
                }}>UNDERSTOOD</button>
              </div>
            </div>
          );
        })()}

        {/* Element rows */}
        {ELEMENTS.map((el, i) => {
          const amount    = state.amounts[i];
          const rate      = rates[i];
          const convCount = state.converters[i];
          const cap       = maxConverters(i, state.converters, state.totalQuarksEarned);
          const atCap     = convCount >= cap;
          const isAuto    = stats.autobuyTiers.has(i);
          const cost      = converterCost(i, convCount);
          const canAfford = i === 0 ? state.amounts[0] >= cost : state.amounts[i - 1] >= cost;
          const canBuy    = !atCap && !isAuto && canAfford;
          const prevHasConv = i > 0 && state.converters[i - 1] > 0;
          const visible   = i === 0 || amount > 0.01 || convCount > 0 || prevHasConv ||
                            (i > 0 && state.amounts[i - 1] >= cost * 0.3);
          if (!visible) return null;

          return (
            <div key={el.id} style={{
              display: "grid", gridTemplateColumns: "170px 1fr auto", alignItems: "center",
              background: `linear-gradient(90deg, ${el.color}08, transparent)`,
              border: `1px solid ${el.color}33`, borderRadius: "6px",
              padding: "9px 12px", gap: "10px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1rem" }}>{el.emoji}</span>
                <div>
                  <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", color: el.color, textTransform: "uppercase" }}>{el.name}</div>
                  <div style={{ fontSize: "0.92rem", fontWeight: "bold", color: theme.text }}>{fmt(amount)}</div>
                </div>
              </div>
              <div>
                {rate > 0 && <div style={{ fontSize: "0.58rem", color: theme.textDim }}>+{fmt(rate)}/s</div>}
                {convCount > 0 && (
                  <>
                    <div style={{ height: "3px", borderRadius: "2px", marginTop: "4px", background: `linear-gradient(90deg, ${el.color}, ${el.color}22)`, width: `${Math.min(100, convCount * 6)}%` }} />
                    <div style={{ fontSize: "0.55rem", color: theme.textDim, marginTop: "3px" }}>{convCount} converter{convCount !== 1 ? "s" : ""}</div>
                  </>
                )}
              </div>
              {i === 0 ? (
                <button onClick={() => buyConverter(0)} disabled={atCap || isAuto} style={{
                  background: (!atCap && !isAuto) ? `${el.color}22` : "transparent",
                  border: `1px solid ${(!atCap && !isAuto) ? el.color : el.color + "33"}`,
                  borderRadius: "5px", color: (!atCap && !isAuto) ? el.color : el.color + "44",
                  padding: "5px 9px", cursor: (!atCap && !isAuto) ? "pointer" : "not-allowed",
                  fontSize: "0.58rem", lineHeight: "1.5", minWidth: "86px", textAlign: "center",
                  fontFamily: "'Courier New', monospace",
                }}>
                  <div>{atCap ? "SLOTS FULL" : isAuto ? "⚙ AUTO" : "ADD CONVERTER"}</div>
                  <div style={{ fontSize: "0.55rem", opacity: 0.8 }}>FREE</div>
                  <div style={{ fontSize: "0.5rem", opacity: 0.6 }}>{convCount}/{cap} slots</div>
                </button>
              ) : isAuto ? (
                <div style={{ background: `${el.color}18`, border: `1px solid ${el.color}88`, borderRadius: "5px", color: el.color, padding: "5px 9px", fontSize: "0.58rem", lineHeight: "1.6", minWidth: "86px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.6rem" }}>⚙ AUTO</div>
                  <div style={{ fontSize: "0.52rem", opacity: 0.7 }}>{convCount}/{cap === Infinity ? "∞" : cap} slots</div>
                  <div style={{ fontSize: "0.5rem", opacity: 0.5 }}>next: {fmt(cost)} {ELEMENTS[i - 1].name.slice(0, 4).toUpperCase()}</div>
                </div>
              ) : (
                <button onClick={() => buyConverter(i)} disabled={!canBuy} style={{
                  background: canBuy ? `${el.color}22` : "transparent",
                  border: `1px solid ${canBuy ? el.color : el.color + "33"}`,
                  borderRadius: "5px", color: canBuy ? el.color : el.color + "44",
                  padding: "5px 9px", cursor: canBuy ? "pointer" : "not-allowed",
                  fontSize: "0.58rem", lineHeight: "1.5", minWidth: "86px", textAlign: "center",
                  fontFamily: "'Courier New', monospace",
                }}>
                  <div>{atCap ? "SLOTS FULL" : "BUY CONVERTER"}</div>
                  <div style={{ fontSize: "0.55rem", opacity: 0.8 }}>
                    {atCap ? `${convCount}/${cap === Infinity ? "∞" : cap}` : `${fmt(cost)} ${ELEMENTS[i - 1].name.slice(0, 4).toUpperCase()}`}
                  </div>
                  {!atCap && cap !== Infinity && <div style={{ fontSize: "0.5rem", opacity: 0.6 }}>{convCount}/{cap} slots</div>}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Echo progress bar */}
      {state.totalQuarksEarned >= ECHO_THRESHOLD * 0.1 && (() => {
        const currentEchoes = calcEchoesFromRun(state.totalQuarksEarned);
        const nextEchoAt    = ECHO_THRESHOLD * Math.pow(2, currentEchoes + 1);
        const prevEchoAt    = currentEchoes === 0 ? ECHO_THRESHOLD : ECHO_THRESHOLD * Math.pow(2, currentEchoes);
        const progress      = Math.min(1, (state.totalQuarksEarned - prevEchoAt) / (nextEchoAt - prevEchoAt));
        const quarksNeeded  = Math.max(0, nextEchoAt - state.totalQuarksEarned);
        const quarkRate     = rates[0];
        const timeToNext    = quarkRate > 0 ? quarksNeeded / quarkRate : null;
        return (
          <div style={{ background: "#0a0d18", border: "1px solid #2a1a4a", borderRadius: "6px", padding: "8px 12px", marginBottom: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "5px" }}>
              <span style={{ fontSize: "0.54rem", letterSpacing: "0.12em", color: "#aa88dd" }}>
                ✨ NEXT ECHO — #{currentEchoes + 1}
              </span>
              <span style={{ fontSize: "0.54rem", color: "#9977cc" }}>
                {fmt(state.totalQuarksEarned)} / {fmt(nextEchoAt)} Quarks
                {timeToNext !== null && (
                  <span style={{ color: "#7755aa", marginLeft: "6px" }}>({fmtTime(timeToNext)})</span>
                )}
              </span>
            </div>
            <div style={{ height: "5px", background: "#1a1028", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: "3px", width: `${progress * 100}%`, background: "linear-gradient(90deg, #7733cc, #c77dff)", boxShadow: "0 0 6px #c77dff66", transition: "width 0.4s ease" }} />
            </div>
          </div>
        );
      })()}

      {/* Activity log */}
      <div style={{ background: "#0a1020", border: "1px solid #1a2a40", borderRadius: "6px", padding: "8px 12px", fontSize: "0.58rem", color: theme.textDim, height: "65px", overflowY: "auto", letterSpacing: "0.07em" }}>
        {state.log.map((msg, i) => (
          <div key={i} style={{ marginBottom: "2px", opacity: Math.max(0.1, 1 - i * 0.09) }}>
            {i === 0 ? "▶ " : "  "}{msg}
          </div>
        ))}
      </div>
    </>
  );
}

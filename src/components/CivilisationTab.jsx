import { useState } from "react";
import { CIV_TIERS, CIV_ERAS, CIV_POLICIES, CIV_BASE_RATE } from "../data/civilisation";
import { RELIC_UPGRADES } from "../data/relicUpgrades";
import { civConverterCost, civMaxConverters } from "../game/converters";
import { calcCivMindBonus, calcCivBonuses } from "../game/stats";
import { fmt } from "../utils/format";

export default function CivilisationTab({ state, theme, buyCivConverter, dismissEra, chooseEra, handleBuyPolicy, doDarkAges, buyCivStudy, civEchoStudyLevel, civEchoStudyBonus, civProdBonus, civFestival, surgeActive, activateCultureSurge, relicCultureMult, hasDarkWisdom, buyRelicUpgrade, view = "civ" }) {
  const [showDarkAgesConfirm, setShowDarkAgesConfirm] = useState(false);

  const eraChoices       = state.eraChoices       || {};
  const purchasedPolicies= state.purchasedPolicies || [];
  const darkAgesCount    = state.darkAgesCount     || 0;
  const firedEras        = state.firedEras         || [];

  const civArchive   = (state.purchasedUpgrades || []).includes("civ_archive");
  const _hasDarkWisdom = hasDarkWisdom || false;
  const { civProdMult, civGlobalMult, extraMindBonus } = calcCivBonuses(eraChoices, purchasedPolicies, darkAgesCount, civArchive, _hasDarkWisdom);
  const civMindBonus = calcCivMindBonus(state.totalCultureEver || 0, eraChoices, purchasedPolicies, darkAgesCount, civArchive);

  const _civProdBonus    = civProdBonus || 1;
  const _surgeMult       = surgeActive ? 10 : 1;
  const _relicCultureMult = relicCultureMult || 1;
  const cultureRate = (state.civConverters[0] || 0) > 0
    ? state.civConverters[0] * CIV_BASE_RATE * civProdMult[0] * civGlobalMult * _civProdBonus * _relicCultureMult * _surgeMult
    : 0;

  const nextEra = CIV_ERAS.find(e => !firedEras.includes(e.id));
  const allErasDone = firedEras.length === CIV_ERAS.length;
  const canDarkAges = allErasDone;

  // ── Policies-only view ──────────────────────────────────────────────────────
  if (view === "civpolicies") {
    const policyVisible = state.civConverters[0] > 0;
    const relics = state.relics || 0;
    const purchasedRelicUpgrades = state.purchasedRelicUpgrades || [];
    return (
      <div>
        {!policyVisible && (
          <div style={{ fontSize: "0.58rem", color: "#5a4818", textAlign: "center", padding: "20px" }}>
            Train Tribes to unlock Policies.
          </div>
        )}
        {policyVisible && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {/* Ancestral Codex */}
            {(() => {
              const level     = civEchoStudyLevel || 0;
              const cost      = Math.floor(10000 * Math.pow(4, level));
              const canAfford = (state.culture || 0) >= cost;
              const bonusPct  = Math.round((civEchoStudyBonus || 1) * 100) - 100;
              return (
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center",
                  background: canAfford ? "#0d0a14" : "#09080e",
                  border: `1px solid ${canAfford ? "#aa88ff66" : "#2a2040"}`,
                  borderRadius: "6px", padding: "8px 12px", gap: "10px",
                }}>
                  <div>
                    <div style={{ fontSize: "0.67rem", fontWeight: "bold", color: "#aa88ff" }}>
                      📚 Ancestral Codex {level > 0 && <span style={{ color: "#8866cc", fontSize: "0.58rem" }}>Lv.{level}</span>}
                    </div>
                    <div style={{ fontSize: "0.58rem", color: "#7a60aa", marginTop: "2px" }}>
                      Recorded history carries forward — Echo yield on Prestige {bonusPct > 0 ? `+${bonusPct}%` : "unmodified"}
                    </div>
                    <div style={{ fontSize: "0.54rem", color: "#3a2a50", marginTop: "3px" }}>
                      Cost: <span style={{ color: "#aa88ff88" }}>{fmt(cost)} Culture 🎭</span>
                      <span style={{ color: "#5a4a80", marginLeft: "8px" }}>→ +{(level + 1) * 5}% total after</span>
                    </div>
                  </div>
                  <button onClick={buyCivStudy} disabled={!canAfford} style={{
                    background: canAfford ? "#aa88ff22" : "transparent",
                    border: `1px solid ${canAfford ? "#aa88ff" : "#2a2040"}`,
                    borderRadius: "5px", color: canAfford ? "#aa88ff" : "#3a2a50",
                    padding: "6px 12px", cursor: canAfford ? "pointer" : "not-allowed",
                    fontSize: "0.58rem", letterSpacing: "0.1em", whiteSpace: "nowrap",
                    fontFamily: "'Courier New', monospace",
                  }}>STUDY</button>
                </div>
              );
            })()}
            {CIV_POLICIES.map(pol => {
              const owned     = purchasedPolicies.includes(pol.id);
              const canAfford = !owned && (state.culture || 0) >= pol.cost;
              return (
                <div key={pol.id} style={{
                  display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center",
                  background: owned ? "#0a0c08" : (canAfford ? "#120f06" : "#0a0905"),
                  border: `1px solid ${owned ? "#2a3020" : (canAfford ? "#c4a35a66" : "#2a2010")}`,
                  borderRadius: "6px", padding: "8px 12px", gap: "10px",
                  opacity: owned ? 0.45 : 1,
                }}>
                  <div>
                    <div style={{ fontSize: "0.67rem", fontWeight: "bold", color: owned ? "#554433" : "#c4a35a" }}>
                      {pol.name} {owned && "✓"}
                    </div>
                    <div style={{ fontSize: "0.58rem", color: owned ? "#554433" : "#9a8850", marginTop: "2px" }}>{pol.desc}</div>
                    <div style={{ fontSize: "0.54rem", color: "#5a4818", marginTop: "3px" }}>
                      Cost: <span style={{ color: "#c4a35a88" }}>{fmt(pol.cost)} Culture 🎭</span>
                    </div>
                  </div>
                  {!owned && (
                    <button onClick={() => handleBuyPolicy(pol)} disabled={!canAfford} style={{
                      background: canAfford ? "#c4a35a22" : "transparent",
                      border: `1px solid ${canAfford ? "#c4a35a" : "#2a2010"}`,
                      borderRadius: "5px", color: canAfford ? "#c4a35a" : "#3a2a10",
                      padding: "6px 12px", cursor: canAfford ? "pointer" : "not-allowed",
                      fontSize: "0.58rem", letterSpacing: "0.1em", whiteSpace: "nowrap",
                      fontFamily: "'Courier New', monospace",
                    }}>ENACT</button>
                  )}
                </div>
              );
            })}

            {/* ── Relics section ── */}
            <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #2a1a08" }}>
              <div style={{ fontSize: "0.52rem", color: "#cc9944", letterSpacing: "0.15em", marginBottom: "6px" }}>
                🏺 RELICS — {relics} available &nbsp;·&nbsp; {state.totalRelicsEarned || 0} total earned
              </div>
              {darkAgesCount === 0 && (
                <div style={{ fontSize: "0.52rem", color: "#3a2a10", fontStyle: "italic", marginBottom: "6px" }}>
                  Trigger a Dark Age to earn your first Relic.
                </div>
              )}
              {RELIC_UPGRADES.map(up => {
                const owned     = purchasedRelicUpgrades.includes(up.id);
                const canAfford = !owned && relics >= up.cost;
                return (
                  <div key={up.id} style={{
                    display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center",
                    background: owned ? "#0a0a08" : (canAfford ? "#130e04" : "#0a0806"),
                    border: `1px solid ${owned ? "#2a2010" : (canAfford ? "#cc994466" : "#1a1408")}`,
                    borderRadius: "6px", padding: "8px 12px", gap: "10px",
                    opacity: owned ? 0.45 : 1, marginBottom: "5px",
                  }}>
                    <div>
                      <div style={{ fontSize: "0.67rem", fontWeight: "bold", color: owned ? "#554433" : "#cc9944" }}>
                        {up.icon} {up.name} {owned && "✓"}
                      </div>
                      <div style={{ fontSize: "0.58rem", color: owned ? "#554433" : "#998844", marginTop: "2px" }}>{up.desc}</div>
                      <div style={{ fontSize: "0.54rem", color: "#4a3010", marginTop: "3px" }}>
                        Cost: <span style={{ color: "#cc994488" }}>{up.cost} Relic{up.cost !== 1 ? "s" : ""} 🏺</span>
                      </div>
                    </div>
                    {!owned && (
                      <button onClick={() => buyRelicUpgrade(up.id)} disabled={!canAfford} style={{
                        background: canAfford ? "#cc994422" : "transparent",
                        border: `1px solid ${canAfford ? "#cc9944" : "#2a1a08"}`,
                        borderRadius: "5px", color: canAfford ? "#cc9944" : "#3a2010",
                        padding: "6px 12px", cursor: canAfford ? "pointer" : "not-allowed",
                        fontSize: "0.58rem", letterSpacing: "0.1em", whiteSpace: "nowrap",
                        fontFamily: "'Courier New', monospace",
                      }}>INSCRIBE</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Era choice modal ────────────────────────────────────────────────────────
  if (state.pendingEraChoice) {
    const era = state.pendingEraChoice;
    return (
      <div style={{ background: "#0e0b05", border: "1px solid #c4a35a88", borderRadius: "8px", padding: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div style={{ fontSize: "2rem", marginBottom: "6px" }}>{era.emoji}</div>
          <div style={{ fontSize: "0.52rem", color: "#c4a35a", letterSpacing: "0.2em", marginBottom: "4px" }}>✦ NEW ERA — CHOOSE A PATH</div>
          <div style={{ fontSize: "0.8rem", color: "#eef4ff", fontWeight: "bold", marginBottom: "6px" }}>{era.title}</div>
          <div style={{ fontSize: "0.55rem", color: "#9aaabb", fontStyle: "italic", lineHeight: 1.6 }}>{era.flavour}</div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {era.choices.map(choice => (
            <button key={choice.id} onClick={() => chooseEra(era.id, choice.id)} style={{
              flex: 1, background: "#1a1208", border: "1px solid #c4a35a55",
              borderRadius: "7px", padding: "14px 10px", cursor: "pointer",
              fontFamily: "'Courier New', monospace", textAlign: "center",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#c4a35a"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#c4a35a55"}
            >
              <div style={{ fontSize: "0.65rem", color: "#c4a35a", fontWeight: "bold", marginBottom: "6px" }}>{choice.name}</div>
              <div style={{ fontSize: "0.55rem", color: "#9aaabb", lineHeight: 1.5 }}>{choice.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Era notification banner */}
      {state.pendingEra && !state.pendingEraChoice && (() => {
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
          <div style={{ fontSize: "0.55rem", color: "#6bcb77", marginBottom: "4px" }}>
            ✦ Mind production +{Math.round(civMindBonus * 100)}%
          </div>
        )}
        {darkAgesCount > 0 && (
          <div style={{ fontSize: "0.52rem", color: "#aa88ff", marginBottom: "4px" }}>
            🌑 Dark Ages ×{darkAgesCount} — culture ×{Math.pow(_hasDarkWisdom ? 1.1 : 1.05, darkAgesCount).toFixed(2)}
          </div>
        )}
        {(civGlobalMult > 1 || _civProdBonus > 1 || surgeActive) && (
          <div style={{ fontSize: "0.52rem", color: "#c4a35a88", marginBottom: "4px" }}>
            Culture mult: ×{(civGlobalMult * _civProdBonus * _surgeMult).toFixed(2)}
            {surgeActive && <span style={{ color: "#ff88cc", marginLeft: "6px" }}>🎭 FESTIVAL ACTIVE</span>}
          </div>
        )}
        {civFestival && (() => {
          const now = Date.now();
          const cooldownMs = 24 * 60 * 60 * 1000;
          const cooldownRemaining = Math.max(0, (state.cultureSurgeLastUsedAt || 0) + cooldownMs - now);
          const festivalAvailable = !surgeActive && cooldownRemaining === 0;
          const cooldownH = Math.floor(cooldownRemaining / 3600000);
          const cooldownM = Math.floor((cooldownRemaining % 3600000) / 60000);
          const cooldownS = Math.floor((cooldownRemaining % 60000) / 1000);
          return (
            <div style={{ marginBottom: "6px" }}>
              {surgeActive ? (
                <div style={{ fontSize: "0.52rem", color: "#ff88cc" }}>
                  🎭 Festival in progress — {Math.ceil(Math.max(0, (state.cultureSurgeEndsAt - now) / 1000))}s remaining
                </div>
              ) : festivalAvailable ? (
                <button onClick={activateCultureSurge} style={{
                  background: "#1a0820", border: "1px solid #ff88cc88",
                  borderRadius: "5px", color: "#ff88cc", padding: "4px 12px",
                  cursor: "pointer", fontSize: "0.52rem", letterSpacing: "0.1em",
                  fontFamily: "'Courier New', monospace",
                }}>🎭 CULTURAL FESTIVAL — ×10 culture for 60s</button>
              ) : (
                <div style={{ fontSize: "0.52rem", color: "#4a2838" }}>
                  🎭 Festival on cooldown — {cooldownH}h {cooldownM}m {cooldownS}s
                </div>
              )}
            </div>
          );
        })()}
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
        {allErasDone && (
          <div style={{ fontSize: "0.55rem", color: "#c4a35a" }}>✦ All eras reached — the modern age dawns</div>
        )}
      </div>

      {/* Civ tier rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
        {CIV_TIERS.map((tier, i) => {
          const eraLocked    = tier.requiresEra && !firedEras.includes(tier.requiresEra);
          const reqEra       = tier.requiresEra ? CIV_ERAS.find(e => e.id === tier.requiresEra) : null;
          const convCount    = state.civConverters[i] || 0;
          const cap          = civMaxConverters(i, state.civConverters);
          const cost         = civConverterCost(i, convCount);
          const payAmount    = i === 0 ? state.amounts[8] : (state.civAmounts[i - 1] || 0);
          const canAfford    = !eraLocked && payAmount >= cost && convCount < cap;
          const atCap        = convCount >= cap && cap !== Infinity;
          const ownAmount    = state.civAmounts[i] || 0;
          const rate         = convCount > 0 ? convCount * CIV_BASE_RATE * Math.pow(1.5, i) * civProdMult[i] * civGlobalMult : 0;
          const isLocked     = eraLocked || (i > 0 && (state.civConverters[i - 1] || 0) === 0);
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
                {eraLocked ? (
                  <div style={{ fontSize: "0.5rem", color: "#5a4818", marginTop: "2px" }}>
                    🔒 Requires: {reqEra?.title || tier.requiresEra}
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "12px", marginTop: "3px", alignItems: "baseline" }}>
                    <span style={{ fontSize: "0.58rem", color: "#b8900a" }}>
                      {fmt(ownAmount)} <span style={{ color: "#7a6020", fontSize: "0.5rem" }}>{producesName}</span>
                    </span>
                    {rate > 0 && <span style={{ fontSize: "0.52rem", color: "#7a6020" }}>+{fmt(rate)} {producesName}/s</span>}
                  </div>
                )}
                {!eraLocked && (
                  <div style={{ fontSize: "0.5rem", color: "#5a4818", marginTop: "2px" }}>
                    {`Cost: ${fmt(cost)} ${costsName}`}
                    {i > 0 && cap !== Infinity && ` · cap: ${cap}`}
                    {i > 0 && <span style={{ color: "#4a3808" }}> · have: {fmt(payAmount)}</span>}
                  </div>
                )}
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

      {/* Dark Ages */}
      {canDarkAges && (
        <div style={{ borderTop: "1px solid #2a2010", paddingTop: "14px", marginBottom: "16px" }}>
          <div style={{ fontSize: "0.52rem", color: "#aa88ff", letterSpacing: "0.16em", marginBottom: "8px" }}>🌑 DARK AGES</div>
          <div style={{ background: "#0a0810", border: "1px solid #aa88ff44", borderRadius: "6px", padding: "10px 14px", marginBottom: "8px" }}>
            <div style={{ fontSize: "0.57rem", color: "#cc99ff", marginBottom: "4px" }}>Collapse and Rebirth</div>
            <div style={{ fontSize: "0.52rem", color: "#7a60aa", lineHeight: 1.6 }}>
              Reset your entire civilisation — all tiers, culture, eras, and policies lost.
              In return, all future culture production is permanently ×{Math.pow(_hasDarkWisdom ? 1.1 : 1.05, darkAgesCount + 1).toFixed(2)}.
              {(state.purchasedRelicUpgrades || []).length === 0 && <span style={{ color: "#5a4a80" }}> Earn Relics to unlock upgrades.</span>}
            </div>
            {darkAgesCount > 0 && (
              <div style={{ fontSize: "0.5rem", color: "#aa88ff", marginTop: "4px" }}>
                Current bonus: ×{Math.pow(_hasDarkWisdom ? 1.1 : 1.05, darkAgesCount).toFixed(2)} (after reset: ×{Math.pow(_hasDarkWisdom ? 1.1 : 1.05, darkAgesCount + 1).toFixed(2)})
              </div>
            )}
            {(() => {
              const hasCascade = (state.purchasedRelicUpgrades || []).includes("relic_cascade");
              const relicGain  = 1 + (hasCascade ? Math.floor(darkAgesCount / 5) : 0);
              return (
                <div style={{ fontSize: "0.5rem", color: "#cc9944", marginTop: "4px" }}>
                  🏺 +{relicGain} Relic{relicGain !== 1 ? "s" : ""} on reset
                  {hasCascade && <span style={{ color: "#8a6622", marginLeft: "4px" }}>(Cascade: +{Math.floor(darkAgesCount / 5)} bonus)</span>}
                </div>
              );
            })()}
          </div>
          {!showDarkAgesConfirm ? (
            <button onClick={() => setShowDarkAgesConfirm(true)} style={{
              background: "#1a0a28", border: "1px solid #aa88ff88",
              borderRadius: "5px", color: "#aa88ff", padding: "7px 16px",
              cursor: "pointer", fontSize: "0.55rem", letterSpacing: "0.12em",
              fontFamily: "'Courier New', monospace",
            }}>ENTER DARK AGES</button>
          ) : (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "0.52rem", color: "#cc8888" }}>Are you sure? This cannot be undone.</span>
              <button onClick={() => { doDarkAges(); setShowDarkAgesConfirm(false); }} style={{
                background: "#2a0a0a", border: "1px solid #cc4444",
                borderRadius: "5px", color: "#cc4444", padding: "5px 12px",
                cursor: "pointer", fontSize: "0.52rem", fontFamily: "'Courier New', monospace",
              }}>CONFIRM</button>
              <button onClick={() => setShowDarkAgesConfirm(false)} style={{
                background: "transparent", border: "1px solid #3a2a10",
                borderRadius: "5px", color: "#6a5020", padding: "5px 12px",
                cursor: "pointer", fontSize: "0.52rem", fontFamily: "'Courier New', monospace",
              }}>CANCEL</button>
            </div>
          )}
        </div>
      )}

      {/* Era history */}
      {firedEras.length > 0 && (
        <div style={{ marginTop: "4px", borderTop: "1px solid #2a2010", paddingTop: "12px" }}>
          <div style={{ fontSize: "0.5rem", color: "#6a5020", letterSpacing: "0.16em", marginBottom: "8px" }}>📜 ERA HISTORY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {CIV_ERAS.filter(e => firedEras.includes(e.id)).map(era => {
              const chosenId = eraChoices[era.id];
              const choice   = chosenId ? era.choices.find(c => c.id === chosenId) : null;
              return (
                <div key={era.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 8px", background: "#0a0805", borderRadius: "4px" }}>
                  <span style={{ fontSize: "0.9rem" }}>{era.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.58rem", color: "#c4a35a" }}>{era.title}</div>
                    {choice && <div style={{ fontSize: "0.48rem", color: "#7a8040", marginTop: "1px" }}>▶ {choice.name}: {choice.desc}</div>}
                  </div>
                  <div style={{ fontSize: "0.5rem", color: "#4bcb55" }}>+{Math.round(era.mindBonus * 100)}% Minds</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

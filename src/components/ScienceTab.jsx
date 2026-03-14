import React from "react";
import {
  SCI_TIERS, SCI_ERAS, SCI_PATHS, SCI_CORE_DISCOVERIES, SCI_WILDCARD_POOLS,
  INNOVATION_UPGRADES, BREAKTHROUGH_UPGRADES,
  sciConverterCost, sciMaxConverters, sciEraIndex,
} from "../data/science";
import { calcScienceBonuses } from "../game/stats";

function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return "0";
  if (n >= 1e15) return (n / 1e15).toFixed(2) + "Qa";
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9)  return (n / 1e9).toFixed(2)  + "B";
  if (n >= 1e6)  return (n / 1e6).toFixed(2)  + "M";
  if (n >= 1e3)  return (n / 1e3).toFixed(2)  + "K";
  return Math.floor(n).toString();
}

const SCI_COLOR = "#4d96ff";
const SCI_BG    = "#050a18";
const SCI_DARK  = "#0a1428";
const SCI_MID   = "#1a2a48";
const SCI_DIM   = "#1a2040";

// ── Sub-component: converter row ──────────────────────────────────────────────
function SciConverterRow({ tier, idx, state, sciBonus, buySciConverter }) {
  const owned  = state.sciConverters[idx];
  const cost   = sciConverterCost(idx, owned);
  const cap    = sciMaxConverters(idx, state.sciConverters);
  const atCap  = owned >= cap;
  const era    = SCI_ERAS[tier.unlockEra];
  const locked = (state.sciEra || 0) < tier.unlockEra;

  // Cost currency label
  const costLabel = idx === 0
    ? `${fmt(cost)} Culture`
    : `${fmt(cost)} ${SCI_TIERS[idx - 1].name}`;

  // Can afford?
  const canAfford = idx === 0
    ? (state.culture || 0) >= cost
    : (state.sciAmounts[idx - 1] || 0) >= cost;

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto",
      alignItems: "center", gap: "8px",
      padding: "5px 8px", marginBottom: "3px",
      background: locked ? "#050a10" : SCI_DARK,
      border: "1px solid " + (locked ? "#0a1830" : SCI_MID),
      borderRadius: "5px", opacity: locked ? 0.4 : 1,
    }}>
      <div>
        <span style={{ color: tier.color, marginRight: "5px" }}>{tier.emoji}</span>
        <span style={{ color: locked ? "#2a3a5a" : "#8ab4f8", fontSize: "0.65rem", letterSpacing: "0.1em" }}>
          {tier.name.toUpperCase()}
        </span>
        <span style={{ color: "#4a6a9a", fontSize: "0.55rem", marginLeft: "8px" }}>
          ×{owned}
        </span>
        {locked && (
          <span style={{ color: "#2a4a7a", fontSize: "0.5rem", marginLeft: "6px" }}>
            [unlocks: {era.name}]
          </span>
        )}
        {!locked && !atCap && (
          <span style={{ color: canAfford ? "#4d96ff88" : "#1a3050", fontSize: "0.5rem", marginLeft: "6px" }}>
            — {costLabel}
          </span>
        )}
        {!locked && atCap && owned > 0 && (
          <span style={{ color: "#2a4a6a", fontSize: "0.5rem", marginLeft: "6px" }}>— at cap</span>
        )}
      </div>
      {!locked && (
        <button
          onClick={() => buySciConverter(idx)}
          disabled={atCap || !canAfford}
          style={{
            background: canAfford && !atCap ? SCI_MID : "#050a14",
            border: "1px solid " + (canAfford && !atCap ? SCI_COLOR + "88" : "#0a1830"),
            borderRadius: "4px", color: canAfford && !atCap ? SCI_COLOR : "#1a3050",
            padding: "3px 10px", cursor: canAfford && !atCap ? "pointer" : "not-allowed",
            fontSize: "0.55rem", letterSpacing: "0.1em", fontFamily: "'Courier New', monospace",
          }}
        >+1</button>
      )}
    </div>
  );
}

// ── Sub-component: discovery card ─────────────────────────────────────────────
function DiscoveryCard({ disc, state, sciBonus, purchaseDiscovery }) {
  const owned     = (state.sciDiscoveries || []).includes(disc.id);
  const depsOk    = (disc.deps || []).every(d => (state.sciDiscoveries || []).includes(d));
  const rawCost   = Math.floor(disc.cost * sciBonus.discoveryCostMult);
  const canAfford = (state.science || 0) >= rawCost;

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto",
      alignItems: "center", gap: "8px",
      padding: "6px 10px", marginBottom: "4px",
      background: owned ? "#060e1a" : SCI_DARK,
      border: "1px solid " + (owned ? "#0d1e34" : depsOk ? SCI_MID : "#0a1428"),
      borderRadius: "5px", opacity: owned ? 0.45 : 1,
    }}>
      <div>
        <span style={{ color: owned ? "#2a4a6a" : "#8ab4f8", fontSize: "0.65rem", letterSpacing: "0.1em" }}>
          {disc.name.toUpperCase()}
        </span>
        <span style={{ color: owned ? "#1a3050" : "#4a7aaa", fontSize: "0.55rem", marginLeft: "8px" }}>
          {disc.desc}
        </span>
        {!owned && !depsOk && (
          <div style={{ color: "#2a4060", fontSize: "0.48rem", marginTop: "2px" }}>
            requires: {disc.deps.join(", ").replace(/_/g, " ")}
          </div>
        )}
      </div>
      {!owned && (
        <button
          onClick={() => purchaseDiscovery(disc.id)}
          disabled={!depsOk || !canAfford}
          style={{
            background: depsOk && canAfford ? SCI_MID : "#050a14",
            border: "1px solid " + (depsOk && canAfford ? SCI_COLOR + "88" : "#0a1830"),
            borderRadius: "4px", color: depsOk && canAfford ? SCI_COLOR : "#1a3050",
            padding: "3px 10px", cursor: depsOk && canAfford ? "pointer" : "not-allowed",
            fontSize: "0.55rem", letterSpacing: "0.08em", fontFamily: "'Courier New', monospace",
            whiteSpace: "nowrap",
          }}
        >{depsOk ? (canAfford ? `${fmt(rawCost)} ⚗` : `${fmt(rawCost)} ⚗`) : "LOCKED"}</button>
      )}
      {owned && (
        <span style={{ color: "#1a3050", fontSize: "0.5rem" }}>KNOWN</span>
      )}
    </div>
  );
}

// ── Sub-component: inline path junction ──────────────────────────────────────
function PathJunction({ eraId, state, chooseSciPath }) {
  const options = SCI_PATHS[eraId] || [];
  const chosen  = (state.sciPaths || {})[eraId];

  if (chosen) {
    const path = options.find(p => p.id === chosen);
    return (
      <div style={{
        padding: "8px 12px", marginBottom: "10px",
        background: "#060e20", border: "1px solid #2a4a7a",
        borderRadius: "6px", display: "flex", alignItems: "center", gap: "10px",
      }}>
        <span style={{ fontSize: "1.1rem" }}>{path?.icon}</span>
        <div>
          <div style={{ color: "#6aa4e0", fontSize: "0.6rem", letterSpacing: "0.12em" }}>
            RESEARCH DIRECTION — {path?.name.toUpperCase()}
          </div>
          <div style={{ color: "#3a6a9a", fontSize: "0.5rem", marginTop: "2px" }}>
            {path?.effects.map(e => e.label).join(" · ")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{
        fontSize: "0.58rem", color: "#6aa4e0", letterSpacing: "0.18em",
        marginBottom: "8px", textAlign: "center",
      }}>
        ── CHOOSE RESEARCH DIRECTION ──
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: "8px" }}>
        {options.map(path => (
          <div key={path.id} style={{
            padding: "10px 12px", background: SCI_DARK,
            border: "1px solid " + SCI_COLOR + "55",
            borderRadius: "8px", cursor: "pointer",
          }}
            onClick={() => chooseSciPath(eraId, path.id)}
          >
            <div style={{ fontSize: "1.3rem", marginBottom: "4px" }}>{path.icon}</div>
            <div style={{ color: "#8ab4f8", fontSize: "0.6rem", letterSpacing: "0.1em", marginBottom: "6px" }}>
              {path.name.toUpperCase()}
            </div>
            <div style={{ color: "#3a6a9a", fontSize: "0.5rem", marginBottom: "8px" }}>
              {path.desc}
            </div>
            <div style={{ marginBottom: "8px" }}>
              {path.effects.map((eff, i) => (
                <div key={i} style={{ color: "#5a8aaa", fontSize: "0.48rem", paddingLeft: "6px" }}>
                  · {eff.label}
                </div>
              ))}
            </div>
            <button style={{
              width: "100%", background: "#0a1428",
              border: "1px solid " + SCI_COLOR + "88",
              borderRadius: "4px", color: SCI_COLOR, padding: "4px",
              cursor: "pointer", fontSize: "0.5rem", letterSpacing: "0.12em",
              fontFamily: "'Courier New', monospace",
            }}>COMMIT</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sub-component: upgrade card (innovations / breakthroughs) ─────────────────
function UpgradeCard({ up, owned, canAfford, currency, onBuy }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto",
      alignItems: "center", gap: "8px",
      padding: "6px 10px", marginBottom: "4px",
      background: owned ? "#060e1a" : SCI_DARK,
      border: "1px solid " + (owned ? "#0d1e34" : SCI_MID),
      borderRadius: "5px", opacity: owned ? 0.45 : 1,
    }}>
      <div>
        <span style={{ marginRight: "6px" }}>{up.icon}</span>
        <span style={{ color: owned ? "#2a4a6a" : "#8ab4f8", fontSize: "0.65rem", letterSpacing: "0.1em" }}>
          {up.name.toUpperCase()}
        </span>
        <span style={{ color: owned ? "#1a3050" : "#4a7aaa", fontSize: "0.55rem", marginLeft: "8px" }}>
          {up.desc}
        </span>
      </div>
      {!owned && (
        <button
          onClick={onBuy}
          disabled={!canAfford}
          style={{
            background: canAfford ? SCI_MID : "#050a14",
            border: "1px solid " + (canAfford ? SCI_COLOR + "88" : "#0a1830"),
            borderRadius: "4px", color: canAfford ? SCI_COLOR : "#1a3050",
            padding: "3px 10px", cursor: canAfford ? "pointer" : "not-allowed",
            fontSize: "0.52rem", letterSpacing: "0.08em", fontFamily: "'Courier New', monospace",
            whiteSpace: "nowrap",
          }}
        >{up.cost} {currency}</button>
      )}
      {owned && <span style={{ color: "#1a3050", fontSize: "0.5rem" }}>OWNED</span>}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ScienceTab({
  state, theme, view,
  buySciConverter, purchaseDiscovery, chooseSciPath,
  doParadigmShift, buyInnovation, buyBreakthrough,
}) {
  const sciBonus = calcScienceBonuses(
    state.sciDiscoveries, state.sciPaths, state.paradigmShiftCount,
    state.purchasedInnovations, state.purchasedBreakthroughs
  );

  const currentEra    = SCI_ERAS[state.sciEra || 0];
  const junctionPending = state.sciUnlocked &&
    (state.totalScienceEver || 0) >= currentEra.junctionAt &&
    !(state.sciPaths || {})[currentEra.id];

  const wildcardsDrawn = ((state.sciWildcards || {})[currentEra.id] || []);
  const allWildcardIds = Object.values(SCI_WILDCARD_POOLS).flat().map(w => w.id);

  // Compute current-era Science rate for display
  const sciRate = SCI_TIERS.reduce((sum, tier, i) => {
    if (i > 0) return sum;
    const owned = state.sciConverters[i] || 0;
    return sum + owned * 0.04 * sciBonus.sciTierMult[i] * sciBonus.sciGlobal * sciBonus.sciProdMult;
  }, 0);

  const paradigmAvailable = sciBonus.paradigmReady;

  // ── SCIENCE (converters) view ───────────────────────────────────────────────
  if (view === "science") {
    return (
      <div style={{ color: theme.text, fontSize: "0.72rem" }}>
        {/* Resource bar */}
        <div style={{
          padding: "8px 12px", marginBottom: "12px",
          background: SCI_DARK, border: "1px solid " + SCI_MID, borderRadius: "6px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <span style={{ color: SCI_COLOR, letterSpacing: "0.12em" }}>⚗ SCIENCE</span>
            <span style={{ color: "#3a6a9a", fontSize: "0.55rem", marginLeft: "10px" }}>
              {fmt(state.science || 0)} ({fmt(sciRate)}/s)
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {(state.innovations || 0) > 0 && (
              <span style={{ color: "#7ab8f5", fontSize: "0.55rem" }}>
                💡 {state.innovations} Innovations
              </span>
            )}
            {(state.breakthroughs || 0) > 0 && (
              <span style={{ color: "#5ab0ff", fontSize: "0.55rem" }}>
                🌟 {state.breakthroughs} Breakthroughs
              </span>
            )}
          </div>
        </div>

        {/* Paradigm Shift */}
        {paradigmAvailable && (
          <div style={{ marginBottom: "10px", textAlign: "center" }}>
            <button
              onClick={doParadigmShift}
              style={{
                background: "#0a0a1e", border: "1px solid #4d96ff88",
                borderRadius: "5px", color: "#4d96ff",
                padding: "6px 20px", cursor: "pointer",
                fontSize: "0.6rem", letterSpacing: "0.14em",
                fontFamily: "'Courier New', monospace",
              }}
            >🔄 PARADIGM SHIFT — reset Science, gain Breakthroughs & Innovations</button>
          </div>
        )}

        {/* Era indicator */}
        <div style={{ marginBottom: "8px" }}>
          <div style={{ fontSize: "0.5rem", color: currentEra.color, letterSpacing: "0.16em", marginBottom: "4px" }}>
            ── ERA: {currentEra.name.toUpperCase()} ──
          </div>
        </div>

        {/* Converters */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "0.5rem", color: "#2a4a7a", letterSpacing: "0.14em", marginBottom: "6px" }}>
            ── SCIENCE CONVERTERS ──
          </div>
          {SCI_TIERS.map((tier, i) => (
            <SciConverterRow
              key={tier.id} tier={tier} idx={i}
              state={state} sciBonus={sciBonus}
              buySciConverter={buySciConverter}
            />
          ))}
        </div>

        {/* Innovations */}
        {(state.paradigmShiftCount || 0) > 0 && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "0.5rem", color: "#2a5a7a", letterSpacing: "0.14em", marginBottom: "6px" }}>
              ── INNOVATIONS ({state.innovations || 0} available) ──
            </div>
            {INNOVATION_UPGRADES.map(up => {
              const owned     = (state.purchasedInnovations || []).includes(up.id);
              const canAfford = (state.innovations || 0) >= up.cost;
              return (
                <UpgradeCard key={up.id} up={up} owned={owned} canAfford={canAfford}
                  currency="💡" onBuy={() => buyInnovation(up.id)} />
              );
            })}
          </div>
        )}

        {/* Breakthroughs */}
        {(state.breakthroughs || 0) > 0 && (
          <div>
            <div style={{ fontSize: "0.5rem", color: "#2a5a7a", letterSpacing: "0.14em", marginBottom: "6px" }}>
              ── BREAKTHROUGHS ({state.breakthroughs || 0} available) ──
            </div>
            {BREAKTHROUGH_UPGRADES.map(up => {
              const owned     = (state.purchasedBreakthroughs || []).includes(up.id);
              const canAfford = (state.breakthroughs || 0) >= up.cost;
              return (
                <UpgradeCard key={up.id} up={up} owned={owned} canAfford={canAfford}
                  currency="🌟" onBuy={() => buyBreakthrough(up.id)} />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── RESEARCH (tech tree) view ───────────────────────────────────────────────
  // Show all eras up to and including current
  return (
    <div style={{ color: theme.text, fontSize: "0.72rem" }}>
      {SCI_ERAS.map((era, eraIdx) => {
        if (eraIdx > (state.sciEra || 0)) return null;

        const coreDiscs = SCI_CORE_DISCOVERIES.filter(d => d.era === era.id);
        const wcIds     = (state.sciWildcards || {})[era.id] || [];
        const allWc     = Object.values(SCI_WILDCARD_POOLS).flat();
        const wcDiscs   = wcIds.map(id => allWc.find(w => w.id === id)).filter(Boolean);
        const showJunction = (state.totalScienceEver || 0) >= era.junctionAt;

        return (
          <div key={era.id} style={{ marginBottom: "16px" }}>
            {/* Era header */}
            <div style={{ fontSize: "0.54rem", color: era.color, letterSpacing: "0.2em", marginBottom: "8px" }}>
              ── ERA: {era.name.toUpperCase()} ──
            </div>

            {/* Path junction (only current era) */}
            {eraIdx === (state.sciEra || 0) && showJunction && (
              <PathJunction eraId={era.id} state={state} chooseSciPath={chooseSciPath} />
            )}

            {/* Core discoveries */}
            <div style={{ marginBottom: "6px" }}>
              <div style={{ fontSize: "0.48rem", color: "#2a4a7a", letterSpacing: "0.12em", marginBottom: "4px" }}>
                DISCOVERIES
              </div>
              {coreDiscs.map(disc => (
                <DiscoveryCard key={disc.id} disc={disc} state={state}
                  sciBonus={sciBonus} purchaseDiscovery={purchaseDiscovery} />
              ))}
            </div>

            {/* Wildcard discoveries (only shown if drawn) */}
            {wcDiscs.length > 0 && (
              <div>
                <div style={{ fontSize: "0.48rem", color: "#2a5a4a", letterSpacing: "0.12em", marginBottom: "4px" }}>
                  WILDCARD DISCOVERIES
                </div>
                {wcDiscs.map(disc => (
                  <DiscoveryCard key={disc.id} disc={disc} state={state}
                    sciBonus={sciBonus} purchaseDiscovery={purchaseDiscovery} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

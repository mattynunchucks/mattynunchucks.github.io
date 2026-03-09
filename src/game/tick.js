import { ELEMENTS, BASE_RATE } from "../data/elements";
import { UPGRADES } from "../data/upgrades";
import { DISCOVERIES } from "../data/discoveries";
import { CIV_TIERS, CIV_ERAS, CIV_BASE_RATE } from "../data/civilisation";
import { calcStats, prestigeMultiplier, calcCivMindBonus, calcCivBonuses } from "./stats";
import { maxConverters, converterCost, civMaxConverters } from "./converters";

export function applyTick(state, dt) {
  const { prodMult, globalMult, autobuyTiers, autoUpgrade } = calcStats(
    state.purchasedUpgrades,
    state.universeOverclockCount || 0
  );
  const pMult      = prestigeMultiplier(state.totalEchoesEarned || 0);
  const amounts    = [...state.amounts];
  const converters = [...state.converters];

  let quarkProduced = 0;
  for (let i = 0; i < ELEMENTS.length; i++) {
    if (converters[i] > 0) {
      const produced = converters[i] * BASE_RATE * prodMult[i] * globalMult * pMult * dt;
      amounts[i] += produced;
      if (i === 0) quarkProduced += produced;
    }
  }

  for (const tier of autobuyTiers) {
    let safety = 0;
    while (safety++ < 100) {
      const cap     = maxConverters(tier, converters, state.totalQuarksEarned);
      if (converters[tier] >= cap) break;
      const cost    = converterCost(tier, converters[tier]);
      const payTier = tier === 0 ? 0 : tier - 1;
      if (amounts[payTier] < cost) break;
      amounts[payTier] -= cost;
      converters[tier] += 1;
    }
  }

  // ── Auto-upgrade (Quantum Autosynthesis) ───────────────────────────────────
  let purchasedUpgrades = state.purchasedUpgrades;
  if (autoUpgrade) {
    const newlyBought = [];
    for (const up of UPGRADES) {
      if (up.cost[1] !== 0) continue;
      if (purchasedUpgrades.includes(up.id)) continue;
      if (amounts[0] >= up.cost[0]) {
        amounts[0] -= up.cost[0];
        newlyBought.push(up.id);
      }
    }
    if (newlyBought.length > 0) {
      purchasedUpgrades = [...purchasedUpgrades, ...newlyBought];
    }
  }

  const totalMindsEver    = Math.max(state.totalMindsEver || 0, amounts[8]);
  const totalQuarksEarned = (state.totalQuarksEarned || 0) + quarkProduced;

  // ── Discovery detection ────────────────────────────────────────────────────
  const firedDiscoveries = state.firedDiscoveries || [];
  let newDiscovery       = state.pendingDiscovery || null;
  const newFired         = [...firedDiscoveries];

  if (!newDiscovery) {
    for (const disc of DISCOVERIES) {
      if (newFired.includes(disc.id)) continue;
      if (converters[disc.tier] > 0) {
        newDiscovery = disc;
        newFired.push(disc.id);
        if (disc.boost > 0) {
          for (let i = 0; i < amounts.length; i++) {
            if (amounts[i] > 0) amounts[i] *= disc.boost;
          }
        }
        break;
      }
    }
  }

  // ── Civilisation tick ──────────────────────────────────────────────────────
  const civAmounts    = [...(state.civAmounts    || CIV_TIERS.map(() => 0))];
  const civConverters = [...(state.civConverters || CIV_TIERS.map(() => 0))];
  const { civProdMult, civGlobalMult } = calcCivBonuses(
    state.eraChoices || {}, state.purchasedPolicies || [], state.darkAgesCount || 0
  );
  let cultureProduced = 0;

  if (state.civUnlocked) {
    for (let i = 0; i < CIV_TIERS.length; i++) {
      if (civConverters[i] > 0) {
        const produced = civConverters[i] * CIV_BASE_RATE * Math.pow(1.5, i) * civProdMult[i] * civGlobalMult * dt;
        civAmounts[i] += produced;
        if (i === 0) cultureProduced += produced;
      }
    }
  }

  const culture          = (state.culture || 0) + cultureProduced;
  const totalCultureEver = (state.totalCultureEver || 0) + cultureProduced;

  const civMindBonus = calcCivMindBonus(totalCultureEver, state.eraChoices, state.purchasedPolicies, state.darkAgesCount);
  if (civMindBonus > 0 && converters[8] > 0) {
    amounts[8] += converters[8] * BASE_RATE * prodMult[8] * globalMult * pMult * civMindBonus * dt;
  }

  // ── Era detection ──────────────────────────────────────────────────────────
  const firedEras    = state.firedEras  || [];
  let newEra         = state.pendingEra || null;
  const newFiredEras = [...firedEras];
  let pendingEraChoice = state.pendingEraChoice || null;

  if (!newEra && !pendingEraChoice && state.civUnlocked) {
    for (const era of CIV_ERAS) {
      if (newFiredEras.includes(era.id)) continue;
      if (totalCultureEver >= era.at) {
        newEra = era;
        newFiredEras.push(era.id);
        if (era.choices) pendingEraChoice = era;
        break;
      }
    }
  }

  return {
    ...state,
    amounts, converters, purchasedUpgrades,
    totalMindsEver, totalQuarksEarned,
    firedDiscoveries: newFired,
    pendingDiscovery: newDiscovery,
    civAmounts, civConverters, culture, totalCultureEver,
    pendingEra: newEra, firedEras: newFiredEras,
    pendingEraChoice,
    lastTick: Date.now(),
  };
}

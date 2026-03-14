import { ELEMENTS, ECHO_THRESHOLD } from "../data/elements";
import { UPGRADES } from "../data/upgrades";
import { CIV_ERAS, CIV_POLICIES, CIV_TIERS } from "../data/civilisation";
import { SCI_PATHS, allScienceDiscoveries, INNOVATION_UPGRADES, BREAKTHROUGH_UPGRADES } from "../data/science";

export function prestigeMultiplier(echoes) {
  return 1 + echoes * 0.1;
}

export function calcEchoesFromRun(totalQuarksEarned) {
  if ((totalQuarksEarned || 0) < ECHO_THRESHOLD) return 0;
  return Math.floor(Math.log2(totalQuarksEarned / ECHO_THRESHOLD));
}

export function universeOverclockCost(count) {
  return Math.ceil(50 * Math.pow(3, count));
}

export function calcStats(purchasedUpgrades, universeOverclockCount) {
  let clickMult = 1;
  const prodMult = ELEMENTS.map(() => 1);
  let globalMult = 1 * Math.pow(1.1, universeOverclockCount || 0);
  const autobuyTiers = new Set();
  let autoUpgrade  = false;
  let civAssemble  = false;
  let civAutoPolicy= false;
  let civLegacy    = false;
  let civArchive   = false;
  let civProdBonus = 1;
  let civFestival  = false;

  for (const id of purchasedUpgrades) {
    const up = UPGRADES.find(u => u.id === id);
    if (!up) continue;
    if (up.type === "click")       clickMult = Math.max(clickMult, up.value);
    if (up.type === "prod" && up.tier >= 0) prodMult[up.tier] *= up.value;
    if (up.type === "global")      globalMult *= up.value;
    if (up.type === "autobuy")     autobuyTiers.add(up.value);
    if (up.type === "autoupgrade") autoUpgrade   = true;
    if (up.type === "civassemble") civAssemble   = true;
    if (up.type === "civautopol")  civAutoPolicy = true;
    if (up.type === "civlegacy")   civLegacy     = true;
    if (up.type === "civarchive")  civArchive    = true;
    if (up.type === "civprod")     civProdBonus *= up.value;
    if (up.type === "civfestival") civFestival   = true;
  }

  return { clickMult, prodMult, globalMult, autobuyTiers, autoUpgrade, civAssemble, civAutoPolicy, civLegacy, civArchive, civProdBonus, civFestival };
}

// Returns { civProdMult: number[], civGlobalMult: number, extraMindBonus: number }
// from era choices + purchased policies + dark ages multiplier
export function calcCivBonuses(eraChoices, purchasedPolicies, darkAgesCount, civArchive, darkWisdom = false) {
  const civProdMult  = CIV_TIERS.map(() => 1);
  const darkBase     = darkWisdom ? 1.1 : 1.05;
  let civGlobalMult  = Math.pow(darkBase, darkAgesCount || 0);
  let extraMindBonus = 0;

  function applyEffect(effect, doubled) {
    if (!effect) return;
    if (effect.type === "civProd")   civProdMult[effect.tier] *= doubled ? effect.mult * effect.mult : effect.mult;
    if (effect.type === "civGlobal") civGlobalMult *= doubled ? effect.mult * effect.mult : effect.mult;
    if (effect.type === "mindBonus") extraMindBonus += doubled ? effect.value * 2 : effect.value;
  }

  // Era choices (doubled if Grand Archive owned)
  for (const era of CIV_ERAS) {
    const chosenId = (eraChoices || {})[era.id];
    if (!chosenId) continue;
    const choice = era.choices.find(c => c.id === chosenId);
    if (choice) applyEffect(choice.effect, !!civArchive);
  }

  // Policies (not doubled by Grand Archive)
  for (const id of (purchasedPolicies || [])) {
    const pol = CIV_POLICIES.find(p => p.id === id);
    if (!pol) continue;
    applyEffect(pol.effect, false);
    if (pol.also) applyEffect(pol.also, false);
  }

  return { civProdMult, civGlobalMult, extraMindBonus };
}

// ── Science bonuses ───────────────────────────────────────────────────────────
// Returns multipliers/bonuses derived from purchased discoveries, path choices,
// innovations, and breakthroughs. Used by tick.js and handler functions.
export function calcScienceBonuses(sciDiscoveries, sciPaths, paradigmShiftCount, purchasedInnovations, purchasedBreakthroughs) {
  let sciProdMult      = 1;          // multiplies tier-0 (Scholars) output
  const sciTierMult    = Array(7).fill(1); // per-tier multipliers
  let sciGlobal        = 1;          // global Science multiplier (all tiers)
  let civGlobalBonus   = 1;          // bonus folded into civGlobalMult
  let universeMindMult = 1;          // bonus to Mind production
  let echoBonus        = 0;          // additive fraction added to echo gain
  let echoMult         = 1;          // multiplicative echo gain
  let relicBonus       = 0;          // flat relics added per Dark Age
  let breakthroughMult = 1;          // multiplies Breakthroughs earned per Paradigm Shift
  let discoveryCostMult = 1;         // multiplies discovery purchase costs
  let extraWildcard    = 0;          // extra wildcards drawn per era
  let paradigmReady    = false;      // Space Station purchased

  const allDiscs = allScienceDiscoveries();
  for (const disc of allDiscs) {
    if (!(sciDiscoveries || []).includes(disc.id)) continue;
    switch (disc.type) {
      case "sciProd":         sciProdMult      *= disc.value; break;
      case "sciGlobal":       sciGlobal        *= disc.value; break;
      case "sciTierMult":     sciTierMult[disc.tier] *= disc.value; break;
      case "civGlobal":       civGlobalBonus   *= disc.value; break;
      case "universeMindMult":universeMindMult *= disc.value; break;
      case "echoBonus":       echoBonus        += disc.value; break;
      case "echoMult":        echoMult         *= disc.value; break;
      case "relicBonus":      relicBonus       += disc.value; break;
      case "breakthroughMult":breakthroughMult *= disc.value; break;
      case "paradigmReady":   paradigmReady     = true;       break;
    }
  }

  // Path effects
  for (const [eraId, pathId] of Object.entries(sciPaths || {})) {
    const path = (SCI_PATHS[eraId] || []).find(p => p.id === pathId);
    if (!path) continue;
    for (const eff of path.effects) {
      if (eff.type === "sciGlobal")        sciGlobal        *= eff.mult;
      if (eff.type === "sciTierMult")      sciTierMult[eff.tier] *= eff.mult;
      if (eff.type === "civGlobalMult")    civGlobalBonus   *= eff.mult;
      if (eff.type === "universeMindMult") universeMindMult *= eff.mult;
      if (eff.type === "echoMult")         echoMult         *= eff.mult;
      if (eff.type === "breakthroughMult") breakthroughMult *= eff.mult;
      if (eff.type === "discoveryCostMult") discoveryCostMult *= eff.mult;
      if (eff.type === "extraWildcard")    extraWildcard    += eff.value;
      if (eff.type === "relicBonus")       relicBonus       += eff.value;
    }
  }

  // Innovation effects
  for (const id of (purchasedInnovations || [])) {
    if (id === "theoretical_foundations") sciGlobal *= Math.pow(2, paradigmShiftCount || 0);
    if (id === "scientific_legacy")       extraWildcard += 1;
  }

  // Breakthrough effects
  for (const id of (purchasedBreakthroughs || [])) {
    const bt = BREAKTHROUGH_UPGRADES.find(b => b.id === id);
    if (!bt) continue;
    if (bt.type === "echoBonus")    echoBonus    += bt.value;
    if (bt.type === "echoMult")     echoMult     *= bt.value;
    if (bt.type === "relicBonus")   relicBonus   += bt.value;
    if (bt.type === "sciProd")      sciProdMult  *= bt.value;
    if (bt.type === "sciShiftMult") sciGlobal    *= Math.pow(bt.value, paradigmShiftCount || 0);
  }

  return { sciProdMult, sciTierMult, sciGlobal, civGlobalBonus, universeMindMult,
           echoBonus, echoMult, relicBonus, breakthroughMult, discoveryCostMult,
           extraWildcard, paradigmReady };
}

export function calcCivMindBonus(totalCultureEver, eraChoices, purchasedPolicies, darkAgesCount, civArchive) {
  const base = CIV_ERAS.reduce((sum, era) => {
    return (totalCultureEver || 0) >= era.at ? sum + era.mindBonus : sum;
  }, 0);
  const { extraMindBonus } = calcCivBonuses(eraChoices, purchasedPolicies, darkAgesCount, civArchive);
  return base + extraMindBonus;
}

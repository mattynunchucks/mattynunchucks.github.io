import { ELEMENTS, ECHO_THRESHOLD } from "../data/elements";
import { UPGRADES } from "../data/upgrades";
import { CIV_ERAS, CIV_POLICIES, CIV_TIERS } from "../data/civilisation";

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

export function calcCivMindBonus(totalCultureEver, eraChoices, purchasedPolicies, darkAgesCount, civArchive) {
  const base = CIV_ERAS.reduce((sum, era) => {
    return (totalCultureEver || 0) >= era.at ? sum + era.mindBonus : sum;
  }, 0);
  const { extraMindBonus } = calcCivBonuses(eraChoices, purchasedPolicies, darkAgesCount, civArchive);
  return base + extraMindBonus;
}

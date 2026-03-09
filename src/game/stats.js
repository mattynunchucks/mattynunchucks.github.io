import { ELEMENTS, ECHO_THRESHOLD } from "../data/elements";
import { UPGRADES } from "../data/upgrades";
import { CIV_ERAS } from "../data/civilisation";

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
  let autoUpgrade = false;

  for (const id of purchasedUpgrades) {
    const up = UPGRADES.find(u => u.id === id);
    if (!up) continue;
    if (up.type === "click")       clickMult = Math.max(clickMult, up.value);
    if (up.type === "prod" && up.tier >= 0) prodMult[up.tier] *= up.value;
    if (up.type === "global")      globalMult *= up.value;
    if (up.type === "autobuy")     autobuyTiers.add(up.value);
    if (up.type === "autoupgrade") autoUpgrade = true;
  }

  return { clickMult, prodMult, globalMult, autobuyTiers, autoUpgrade };
}

export function calcCivMindBonus(totalCultureEver) {
  return CIV_ERAS.reduce((sum, era) => {
    return (totalCultureEver || 0) >= era.at ? sum + era.mindBonus : sum;
  }, 0);
}

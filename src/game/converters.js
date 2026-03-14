import { BASE_COST, COST_SCALE } from "../data/elements";
import { CIV_BASE_COST, CIV_COST_SCALE, CIV_TIER_SCALE } from "../data/civilisation";
export { sciConverterCost, sciMaxConverters } from "../data/science";

export function converterCost(tier, owned) {
  if (tier === 0) return 0;
  return BASE_COST * Math.pow(3, tier - 1) * Math.pow(COST_SCALE, owned);
}

export function maxConverters(tier, converters, totalQuarksEarned) {
  if (tier === 0) return Math.floor((totalQuarksEarned || 0) / 7);
  return converters[tier - 1];
}

export function civConverterCost(tier, owned) {
  if (tier === 0) return Math.floor(CIV_BASE_COST * Math.pow(CIV_COST_SCALE, owned));
  return Math.floor(CIV_TIER_SCALE * Math.pow(CIV_COST_SCALE, owned));
}

export function civMaxConverters(tier, civConverters) {
  if (tier === 0) return Infinity;
  return civConverters[tier - 1];
}

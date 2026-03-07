import { ELEMENTS } from "../data/elements";
import { CIV_TIERS } from "../data/civilisation";

export function buildInitState() {
  return {
    amounts:                ELEMENTS.map(() => 0),
    converters:             ELEMENTS.map(() => 0),
    totalClicks:            0,
    totalQuarksEarned:      0,
    totalMindsEver:         0,
    echoes:                 0,
    totalEchoesEarned:      0,
    purchasedUpgrades:      [],
    prestigeCount:          0,
    universeOverclockCount: 0,
    lastTick:               Date.now(),
    offlineSeconds:         0,
    log:                    ["Welcome to CosmoGenesis. Click Quarks to begin."],
    firedDiscoveries:       [],
    pendingDiscovery:       null,
    civUnlocked:            false,
    civAmounts:             CIV_TIERS.map(() => 0),
    civConverters:          CIV_TIERS.map(() => 0),
    culture:                0,
    totalCultureEver:       0,
    pendingEra:             null,
    firedEras:              [],
  };
}

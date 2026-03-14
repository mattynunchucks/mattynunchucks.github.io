// ── Science tab data ──────────────────────────────────────────────────────────

export const SCI_UNLOCK_RELICS         = 20;
export const SCI_UNLOCK_VISIBLE_RELICS = 15; // 3/4 of 20 — tab appears at this threshold
export const SCI_BASE_RATE             = 0.04;

// ── Tiers ─────────────────────────────────────────────────────────────────────
// unlockEra: index into SCI_ERAS (0 = available from Renaissance start)
export const SCI_TIERS = [
  { id: "scholars",   name: "Scholars",          emoji: "📜", color: "#c9a84c", unlockEra: 0 },
  { id: "presses",    name: "Printing Presses",   emoji: "🖨", color: "#9a7532", unlockEra: 0 },
  { id: "steamworks", name: "Steam Works",        emoji: "⚙",  color: "#8b5e3c", unlockEra: 1 },
  { id: "labs",       name: "Laboratories",        emoji: "🔬", color: "#2d6a8f", unlockEra: 1 },
  { id: "powergrids", name: "Power Grids",         emoji: "⚡", color: "#1a5276", unlockEra: 2 },
  { id: "computers",  name: "Computing Networks",  emoji: "💻", color: "#154360", unlockEra: 2 },
  { id: "launches",   name: "Launch Facilities",   emoji: "🚀", color: "#1a1a3e", unlockEra: 3 },
];

// ── Eras ──────────────────────────────────────────────────────────────────────
// at: totalScienceEver threshold to enter this era
// junctionAt: totalScienceEver threshold to show the path junction
export const SCI_ERAS = [
  { id: "renaissance", name: "Renaissance",    at: 0,          junctionAt: 400,        color: "#c9a84c", sciMindBonus: 0.5 },
  { id: "industrial",  name: "Industrial Age", at: 1000,       junctionAt: 40000,      color: "#9a7532", sciMindBonus: 1.0 },
  { id: "modern",      name: "Modern Era",     at: 100000,     junctionAt: 4000000,    color: "#2d6a8f", sciMindBonus: 2.0 },
  { id: "space",       name: "Space Age",      at: 10000000,   junctionAt: 40000000,   color: "#1a3a5e", sciMindBonus: 5.0 },
];

// ── Path junctions (one set of choices per era) ───────────────────────────────
// effects[].type values used in calcScienceBonuses:
//   sciGlobal, sciTierMult(tier), civGlobalMult, universeMindMult,
//   echoMult, breakthroughMult, discoveryCostMult, extraWildcard, relicBonus, policySlot
export const SCI_PATHS = {
  renaissance: [
    {
      id: "exploration", name: "Age of Exploration", icon: "⛵",
      desc: "Civ production ×1.5, Scholars ×1.2",
      effects: [
        { type: "civGlobalMult",  mult: 1.5, label: "Civ production ×1.5" },
        { type: "sciTierMult",    tier: 0, mult: 1.2, label: "Scholars ×1.2" },
      ],
    },
    {
      id: "philosophy", name: "Natural Philosophy", icon: "🌟",
      desc: "All Science ×2, +1 Policy slot",
      effects: [
        { type: "sciGlobal",  mult: 2, label: "All Science ×2" },
        { type: "policySlot", value: 1, label: "+1 Policy slot" },
      ],
    },
  ],
  industrial: [
    {
      id: "military", name: "Military-Industrial", icon: "⚔",
      desc: "Breakthrough yield ×2, Steam Works ×1.5",
      effects: [
        { type: "breakthroughMult", mult: 2,   label: "Breakthrough yield ×2" },
        { type: "sciTierMult",      tier: 2, mult: 1.5, label: "Steam Works ×1.5" },
      ],
    },
    {
      id: "openscience", name: "Open Science", icon: "📖",
      desc: "Discovery costs −30%, +1 wildcard per era",
      effects: [
        { type: "discoveryCostMult", mult: 0.7, label: "Discovery costs −30%" },
        { type: "extraWildcard",     value: 1,  label: "+1 wildcard per era" },
      ],
    },
  ],
  modern: [
    {
      id: "nuclear", name: "Nuclear Age", icon: "☢",
      desc: "Mind production ×2, Power Grids ×2",
      effects: [
        { type: "universeMindMult", mult: 2, label: "Mind production ×2" },
        { type: "sciTierMult",      tier: 4, mult: 2, label: "Power Grids ×2" },
      ],
    },
    {
      id: "renewable", name: "Renewable Revolution", icon: "🌿",
      desc: "Civ production ×2, all Science ×1.5",
      effects: [
        { type: "civGlobalMult", mult: 2,   label: "Civ production ×2" },
        { type: "sciGlobal",     mult: 1.5, label: "All Science ×1.5" },
      ],
    },
    {
      id: "computing", name: "Digital Revolution", icon: "💻",
      desc: "All Science ×3, Computing Networks ×2",
      effects: [
        { type: "sciGlobal",   mult: 3, label: "All Science ×3" },
        { type: "sciTierMult", tier: 5, mult: 2, label: "Computing Networks ×2" },
      ],
    },
  ],
  space: [
    {
      id: "spacerace", name: "Space Race", icon: "🏆",
      desc: "Echo gain ×1.5, Breakthrough yield ×2",
      effects: [
        { type: "echoMult",         mult: 1.5, label: "Echo gain ×1.5" },
        { type: "breakthroughMult", mult: 2,   label: "Breakthrough yield ×2" },
      ],
    },
    {
      id: "cooperative", name: "Cooperative Frontier", icon: "🤝",
      desc: "+2 Relics per Dark Age, cross-tab bonuses ×1.2",
      effects: [
        { type: "relicBonus",   value: 2,   label: "+2 Relics per Dark Age" },
        { type: "civGlobalMult", mult: 1.2, label: "Civ production ×1.2" },
      ],
    },
  ],
};

// ── Core discoveries (3 per era, always available once era starts) ─────────────
// deps: array of discovery ids required before this can be purchased
// type/value: effect applied when purchased (handled in calcScienceBonuses)
export const SCI_CORE_DISCOVERIES = [
  // Renaissance
  { id: "printing_press", name: "Printing Press",    era: "renaissance", cost: 100,
    type: "sciProd",   value: 2,   deps: [],                   desc: "Science production ×2" },
  { id: "calculus",       name: "Calculus",            era: "renaissance", cost: 300,
    type: "sciGlobal", value: 1.5, deps: ["printing_press"],   desc: "All Science ×1.5" },
  { id: "sci_method",     name: "Scientific Method",   era: "renaissance", cost: 600,
    type: "sciProd",   value: 1.5, deps: ["calculus"],         desc: "Science production ×1.5" },

  // Industrial
  { id: "steam_engine",   name: "Steam Engine",        era: "industrial",  cost: 2000,
    type: "sciProd",   value: 2,   deps: [],                   desc: "Science production ×2" },
  { id: "electricity",    name: "Electricity",          era: "industrial",  cost: 8000,
    type: "civGlobal", value: 1.5, deps: ["steam_engine"],     desc: "Civ production ×1.5" },
  { id: "evolution",      name: "Theory of Evolution",  era: "industrial",  cost: 20000,
    type: "sciGlobal", value: 2,   deps: ["electricity"],      desc: "All Science ×2" },

  // Modern
  { id: "nuclear_phys",   name: "Nuclear Physics",     era: "modern",      cost: 200000,
    type: "sciGlobal", value: 2,   deps: [],                   desc: "All Science ×2" },
  { id: "transistors",    name: "Transistors",          era: "modern",      cost: 500000,
    type: "sciTierMult", tier: 5, value: 2, deps: ["nuclear_phys"], desc: "Computing Networks ×2" },
  { id: "space_program",  name: "Space Program",        era: "modern",      cost: 2000000,
    type: "sciTierMult", tier: 6, value: 2, deps: ["transistors"], desc: "Launch Facilities ×2" },

  // Space
  { id: "satellites",     name: "Satellites",           era: "space",       cost: 20000000,
    type: "echoBonus", value: 0.1, deps: [],                   desc: "+10% Echo gain per prestige" },
  { id: "moon_landing",   name: "Moon Landing",          era: "space",       cost: 50000000,
    type: "relicBonus", value: 1, deps: ["satellites"],        desc: "+1 Relic per Dark Age" },
  { id: "space_station",  name: "Space Station",         era: "space",       cost: 100000000,
    type: "paradigmReady", value: 1, deps: ["moon_landing"],   desc: "Enable Paradigm Shift" },
];

// ── Wildcard pools (2 drawn per era at era start, +1 with extraWildcard) ──────
export const SCI_WILDCARD_POOLS = {
  renaissance: [
    { id: "wc_navigation",  name: "Navigation",       era: "renaissance", cost: 200,  type: "sciTierMult", tier: 0, value: 1.5, desc: "Scholars ×1.5" },
    { id: "wc_anatomy",     name: "Anatomy",           era: "renaissance", cost: 250,  type: "civGlobal",   value: 1.2,          desc: "Civ production ×1.2" },
    { id: "wc_optics",      name: "Optics",            era: "renaissance", cost: 200,  type: "sciProd",     value: 1.3,          desc: "Science ×1.3" },
    { id: "wc_astronomy",   name: "Astronomy",         era: "renaissance", cost: 350,  type: "echoBonus",   value: 0.05,         desc: "+5% Echo gain" },
    { id: "wc_cartography", name: "Cartography",       era: "renaissance", cost: 180,  type: "sciTierMult", tier: 1, value: 1.5, desc: "Printing Presses ×1.5" },
    { id: "wc_alchemy",     name: "Alchemy",           era: "renaissance", cost: 400,  type: "sciGlobal",   value: 1.2,          desc: "All Science ×1.2" },
  ],
  industrial: [
    { id: "wc_railways",    name: "Railways",          era: "industrial",  cost: 5000,  type: "sciTierMult", tier: 2, value: 2,   desc: "Steam Works ×2" },
    { id: "wc_telegraph",   name: "Telegraph",         era: "industrial",  cost: 6000,  type: "sciGlobal",   value: 1.3,          desc: "All Science ×1.3" },
    { id: "wc_germ_theory", name: "Germ Theory",       era: "industrial",  cost: 7000,  type: "civGlobal",   value: 1.3,          desc: "Civ production ×1.3" },
    { id: "wc_photography", name: "Photography",       era: "industrial",  cost: 5500,  type: "sciTierMult", tier: 3, value: 1.5, desc: "Laboratories ×1.5" },
    { id: "wc_steel",       name: "Steel Production",  era: "industrial",  cost: 10000, type: "sciProd",     value: 2,            desc: "Science ×2" },
    { id: "wc_dynamo",      name: "Dynamo",            era: "industrial",  cost: 12000, type: "sciTierMult", tier: 4, value: 1.5, desc: "Power Grids ×1.5 (early)" },
  ],
  modern: [
    { id: "wc_radio",       name: "Radio",             era: "modern",      cost: 300000,  type: "sciGlobal",   value: 1.5,          desc: "All Science ×1.5" },
    { id: "wc_antibiotics", name: "Antibiotics",       era: "modern",      cost: 350000,  type: "civGlobal",   value: 1.5,          desc: "Civ production ×1.5" },
    { id: "wc_transistors2",name: "Semiconductors",    era: "modern",      cost: 400000,  type: "sciTierMult", tier: 5, value: 1.5, desc: "Computing Networks ×1.5" },
    { id: "wc_lasers",      name: "Lasers",            era: "modern",      cost: 600000,  type: "sciProd",     value: 2,            desc: "Science ×2" },
    { id: "wc_internet",    name: "Early Internet",    era: "modern",      cost: 800000,  type: "sciGlobal",   value: 2,            desc: "All Science ×2" },
    { id: "wc_aerospace",   name: "Aerospace",         era: "modern",      cost: 1000000, type: "sciTierMult", tier: 6, value: 1.5, desc: "Launch Facilities ×1.5 (early)" },
  ],
  space: [
    { id: "wc_mars",        name: "Mars Colony",       era: "space",       cost: 60000000,  type: "breakthroughMult", value: 2,   desc: "Breakthrough yield ×2" },
    { id: "wc_mining",      name: "Space Mining",      era: "space",       cost: 70000000,  type: "relicBonus",       value: 1,   desc: "+1 Relic per Dark Age" },
    { id: "wc_fusion",      name: "Fusion Power",      era: "space",       cost: 80000000,  type: "sciGlobal",        value: 3,   desc: "All Science ×3" },
    { id: "wc_dyson",       name: "Dyson Swarm",       era: "space",       cost: 120000000, type: "universeMindMult", value: 3,   desc: "Mind production ×3" },
    { id: "wc_ai",          name: "AI Research",       era: "space",       cost: 90000000,  type: "sciProd",          value: 5,   desc: "Science ×5" },
    { id: "wc_genship",     name: "Generation Ship",   era: "space",       cost: 150000000, type: "echoMult",         value: 2,   desc: "Echo gain ×2" },
  ],
};

// ── Innovation upgrades (bought with Innovations, persist through Paradigm Shift) ──
export const INNOVATION_UPGRADES = [
  { id: "retained_research",       name: "Retained Research",       cost: 3,  icon: "📋", type: "retainPath",    desc: "Keep 1 path choice through Paradigm Shift" },
  { id: "field_notes",             name: "Field Notes",              cost: 5,  icon: "📓", type: "freeDiscovery", desc: "Start each run with 1 free core Discovery purchased" },
  { id: "paradigm_dividend",       name: "Paradigm Dividend",        cost: 7,  icon: "💡", type: "paradigmRelic", desc: "Each Paradigm Shift grants +1 Relic" },
  { id: "scientific_legacy",       name: "Scientific Legacy",        cost: 10, icon: "🏛", type: "extraWildcard", desc: "Era wildcards offer 1 extra card to choose from" },
  { id: "theoretical_foundations", name: "Theoretical Foundations",  cost: 15, icon: "📐", type: "sciShiftMult",  desc: "Science ×2 per Paradigm Shift completed" },
];

// ── Breakthrough upgrades (bought with Breakthroughs, permanent across everything) ──
export const BREAKTHROUGH_UPGRADES = [
  { id: "bt_echo1",   name: "Echo Resonance",     cost: 1, icon: "💫", type: "echoBonus",    value: 0.1, desc: "+10% Echo gain per prestige" },
  { id: "bt_echo2",   name: "Echo Amplification", cost: 3, icon: "✨", type: "echoMult",     value: 1.5, desc: "Echo gain ×1.5" },
  { id: "bt_relic1",  name: "Relic Attunement",   cost: 2, icon: "🏺", type: "relicBonus",   value: 1,   desc: "+1 Relic per Dark Age" },
  { id: "bt_relic2",  name: "Relic Mastery",      cost: 5, icon: "💎", type: "relicBonus",   value: 3,   desc: "+3 Relics per Dark Age" },
  { id: "bt_sci1",    name: "Scientific Heritage", cost: 2, icon: "🔬", type: "sciProd",      value: 2,   desc: "Science production ×2" },
  { id: "bt_sci2",    name: "Paradigm Legacy",     cost: 4, icon: "📐", type: "sciShiftMult", value: 2,   desc: "Science ×2 per Paradigm Shift" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns all possible discoveries (core + all wildcards) */
export function allScienceDiscoveries() {
  const wildcards = Object.values(SCI_WILDCARD_POOLS).flat();
  return [...SCI_CORE_DISCOVERIES, ...wildcards];
}

/** Returns the current era index (0–3) based on totalScienceEver */
export function sciEraIndex(totalScienceEver) {
  let era = 0;
  for (let i = SCI_ERAS.length - 1; i >= 0; i--) {
    if ((totalScienceEver || 0) >= SCI_ERAS[i].at) { era = i; break; }
  }
  return era;
}

/** Cost to buy the Nth Science converter of a given tier */
export function sciConverterCost(tier, owned) {
  if (tier === 0) return Math.floor(50 * Math.pow(1.2, owned));
  return Math.floor(100 * Math.pow(2, tier - 1) * Math.pow(1.15, owned));
}

/** Max purchaseable converters at a given tier */
export function sciMaxConverters(tier, sciConverters) {
  if (tier === 0) return Infinity;
  return sciConverters[tier - 1];
}

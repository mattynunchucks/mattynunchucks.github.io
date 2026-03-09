export const CIV_UNLOCK_MINDS = 500;

export const CIV_TIERS = [
  { id: "tribe",      name: "Tribes",      emoji: "🏕",  color: "#c4a35a", desc: "Wandering bands of hunter-gatherers" },
  { id: "settlement", name: "Settlements", emoji: "🏚",  color: "#a0b060", desc: "Permanent camps take root near water" },
  { id: "village",    name: "Villages",    emoji: "🏘",  color: "#70b880", desc: "Farming sustains growing communities" },
  { id: "town",       name: "Towns",       emoji: "🏛",  color: "#5ba8a0", desc: "Trade and craft define the town",      requiresEra: "era_bronze"     },
  { id: "city",       name: "Cities",      emoji: "🏰",  color: "#5080c0", desc: "Law, writing and monuments rise",      requiresEra: "era_iron"       },
  { id: "kingdom",    name: "Kingdoms",    emoji: "👑",  color: "#7860c8", desc: "Warlords unify under one crown",       requiresEra: "era_classical"  },
  { id: "empire",     name: "Empires",     emoji: "⚔",  color: "#b04090", desc: "Armies march, borders stretch to the horizon", requiresEra: "era_medieval"  },
  { id: "nation",     name: "Nations",     emoji: "🌐",  color: "#c06040", desc: "Identity, borders, and diplomacy emerge",      requiresEra: "era_renaissance" },
];

export const CIV_BASE_RATE  = 0.08;
export const CIV_BASE_COST  = 50;
export const CIV_COST_SCALE = 1.18;
export const CIV_TIER_SCALE = 8;

export const CIV_ERAS = [
  { id: "era_fire",        at:       500, emoji: "🔥", title: "Discovery of Fire",        flavour: "Warmth, light, and cooked food — the first technology reshapes everything.",        mindBonus: 0.05,
    choices: [
      { id: "fire_a", name: "Controlled Burns",  desc: "Tribes produce ×2 Culture",        effect: { type: "civProd", tier: 0, mult: 2 } },
      { id: "fire_b", name: "Sacred Flame",      desc: "+10% Mind production permanently", effect: { type: "mindBonus", value: 0.10 } },
    ]},
  { id: "era_agri",        at:      5000, emoji: "🌾", title: "Agricultural Revolution",   flavour: "Seeds planted in rows. The nomad becomes the farmer. Civilisation takes root.",     mindBonus: 0.08,
    choices: [
      { id: "agri_a", name: "Crop Rotation",     desc: "Settlements produce ×2 Culture",   effect: { type: "civProd", tier: 1, mult: 2 } },
      { id: "agri_b", name: "Land Survey",       desc: "All Culture rates ×1.5",           effect: { type: "civGlobal", mult: 1.5 } },
    ]},
  { id: "era_writing",     at:     40000, emoji: "📜", title: "Invention of Writing",      flavour: "Thought outlasts the thinker. Knowledge accumulates across generations.",           mindBonus: 0.10,
    choices: [
      { id: "write_a", name: "Oral Tradition",   desc: "Villages produce ×2 Culture",      effect: { type: "civProd", tier: 2, mult: 2 } },
      { id: "write_b", name: "Codex",            desc: "All Culture rates ×2",             effect: { type: "civGlobal", mult: 2 } },
    ]},
  { id: "era_bronze",      at:    250000, emoji: "🛡", title: "Bronze Age",                flavour: "Metal shaped by fire becomes tool, weapon, and currency.",                         mindBonus: 0.12,
    choices: [
      { id: "bronze_a", name: "Smelting Guild",  desc: "Towns produce ×2 Culture",         effect: { type: "civProd", tier: 3, mult: 2 } },
      { id: "bronze_b", name: "Bronze Coinage",  desc: "All Culture rates ×2",             effect: { type: "civGlobal", mult: 2 } },
    ]},
  { id: "era_iron",        at:   1500000, emoji: "⚒", title: "Iron Age",                  flavour: "Cheaper, harder, everywhere. Iron democratises power.",                            mindBonus: 0.15,
    choices: [
      { id: "iron_a", name: "Iron Ploughs",      desc: "Cities produce ×2 Culture",        effect: { type: "civProd", tier: 4, mult: 2 } },
      { id: "iron_b", name: "Standing Army",     desc: "+20% Mind production permanently", effect: { type: "mindBonus", value: 0.20 } },
    ]},
  { id: "era_classical",   at:   8000000, emoji: "🏛", title: "Classical Antiquity",       flavour: "Philosophy, democracy, and the rule of law echo down through the centuries.",      mindBonus: 0.18,
    choices: [
      { id: "class_a", name: "Democracy",        desc: "Kingdoms produce ×2 Culture",      effect: { type: "civProd", tier: 5, mult: 2 } },
      { id: "class_b", name: "Natural Philosophy",desc: "All Culture rates ×3",            effect: { type: "civGlobal", mult: 3 } },
    ]},
  { id: "era_medieval",    at:  40000000, emoji: "🏰", title: "Medieval Age",              flavour: "Faith and feudalism order a fragmented world. Cathedrals touch the sky.",          mindBonus: 0.20,
    choices: [
      { id: "med_a",  name: "Guild System",      desc: "Empires produce ×2 Culture",       effect: { type: "civProd", tier: 6, mult: 2 } },
      { id: "med_b",  name: "Scholasticism",     desc: "+25% Mind production permanently", effect: { type: "mindBonus", value: 0.25 } },
    ]},
  { id: "era_renaissance", at: 200000000, emoji: "🎨", title: "The Renaissance",           flavour: "Art, science, and humanism converge. The ancient world is rediscovered.",          mindBonus: 0.25,
    choices: [
      { id: "ren_a",  name: "Printing Press",    desc: "Nations produce ×3 Culture",       effect: { type: "civProd", tier: 7, mult: 3 } },
      { id: "ren_b",  name: "Scientific Method", desc: "All Culture rates ×4",             effect: { type: "civGlobal", mult: 4 } },
    ]},
];

// ── Culture policies (spendable with current culture) ────────────────────────
export const CIV_POLICIES = [
  { id: "pol_pottery",     name: "Pottery",          cost:       300, desc: "Tribes ×1.5 Culture rate",      effect: { type: "civProd", tier: 0, mult: 1.5 } },
  { id: "pol_irrigation",  name: "Irrigation",       cost:      2000, desc: "Settlements ×1.5 Culture rate", effect: { type: "civProd", tier: 1, mult: 1.5 } },
  { id: "pol_calendar",    name: "Calendar",         cost:     15000, desc: "All Culture rates ×1.5",        effect: { type: "civGlobal", mult: 1.5 } },
  { id: "pol_philosophy",  name: "Philosophy",       cost:    100000, desc: "+15% Mind production",          effect: { type: "mindBonus", value: 0.15 } },
  { id: "pol_aqueducts",   name: "Aqueducts",        cost:    600000, desc: "Villages & Towns ×2 Culture",   effect: { type: "civProd", tier: 2, mult: 2 }, also: { type: "civProd", tier: 3, mult: 2 } },
  { id: "pol_printing",    name: "Block Printing",   cost:   4000000, desc: "All Culture rates ×2",          effect: { type: "civGlobal", mult: 2 } },
  { id: "pol_astronomy",   name: "Astronomy",        cost:  25000000, desc: "+30% Mind production",          effect: { type: "mindBonus", value: 0.30 } },
  { id: "pol_universities",name: "Universities",     cost: 150000000, desc: "All Culture rates ×3",          effect: { type: "civGlobal", mult: 3 } },
];

export const CIV_UNLOCK_MINDS = 500;

export const CIV_TIERS = [
  { id: "tribe",      name: "Tribes",      emoji: "🏕",  color: "#c4a35a", desc: "Wandering bands of hunter-gatherers" },
  { id: "settlement", name: "Settlements", emoji: "🏚",  color: "#a0b060", desc: "Permanent camps take root near water" },
  { id: "village",    name: "Villages",    emoji: "🏘",  color: "#70b880", desc: "Farming sustains growing communities" },
  { id: "town",       name: "Towns",       emoji: "🏛",  color: "#5ba8a0", desc: "Trade and craft define the town" },
  { id: "city",       name: "Cities",      emoji: "🏰",  color: "#5080c0", desc: "Law, writing and monuments rise" },
  { id: "kingdom",    name: "Kingdoms",    emoji: "👑",  color: "#7860c8", desc: "Warlords unify under one crown" },
  { id: "empire",     name: "Empires",     emoji: "⚔",  color: "#b04090", desc: "Armies march, borders stretch to the horizon" },
  { id: "nation",     name: "Nations",     emoji: "🌐",  color: "#c06040", desc: "Identity, borders, and diplomacy emerge" },
];

export const CIV_BASE_RATE  = 0.08;
export const CIV_BASE_COST  = 50;
export const CIV_COST_SCALE = 1.18;
export const CIV_TIER_SCALE = 8;

export const CIV_ERAS = [
  { id: "era_fire",        at:       500, emoji: "🔥", title: "Discovery of Fire",        flavour: "Warmth, light, and cooked food — the first technology reshapes everything.",        mindBonus: 0.05 },
  { id: "era_agri",        at:      5000, emoji: "🌾", title: "Agricultural Revolution",   flavour: "Seeds planted in rows. The nomad becomes the farmer. Civilisation takes root.",     mindBonus: 0.08 },
  { id: "era_writing",     at:     40000, emoji: "📜", title: "Invention of Writing",      flavour: "Thought outlasts the thinker. Knowledge accumulates across generations.",           mindBonus: 0.10 },
  { id: "era_bronze",      at:    250000, emoji: "🛡", title: "Bronze Age",                flavour: "Metal shaped by fire becomes tool, weapon, and currency.",                         mindBonus: 0.12 },
  { id: "era_iron",        at:   1500000, emoji: "⚒", title: "Iron Age",                  flavour: "Cheaper, harder, everywhere. Iron democratises power.",                            mindBonus: 0.15 },
  { id: "era_classical",   at:   8000000, emoji: "🏛", title: "Classical Antiquity",       flavour: "Philosophy, democracy, and the rule of law echo down through the centuries.",      mindBonus: 0.18 },
  { id: "era_medieval",    at:  40000000, emoji: "🏰", title: "Medieval Age",              flavour: "Faith and feudalism order a fragmented world. Cathedrals touch the sky.",          mindBonus: 0.20 },
  { id: "era_renaissance", at: 200000000, emoji: "🎨", title: "The Renaissance",           flavour: "Art, science, and humanism converge. The ancient world is rediscovered.",          mindBonus: 0.25 },
];

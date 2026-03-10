export const UPGRADES = [
  // ── Click upgrades ──────────────────────────────────────────────────────────
  { id: "click2",     name: "Quantum Tap II",      desc: "Clicking gives ×2 Quarks",        cost: [50,            0], tier: 0,  type: "click",   value: 2  },
  { id: "click4",     name: "Quantum Tap III",     desc: "Clicking gives ×4 Quarks",        cost: [500,           0], tier: 0,  type: "click",   value: 4  },
  { id: "click10",    name: "Quantum Tap IV",      desc: "Clicking gives ×10 Quarks",       cost: [0,             5], tier: 0,  type: "click",   value: 10 },

  // ── Quark-cost production boosts ────────────────────────────────────────────
  { id: "prod0x2q",   name: "Quark Frenzy",        desc: "Quark converters ×2",             cost: [150,           0], tier: 0,  type: "prod",    value: 2  },
  { id: "prod1x2",    name: "Proton Burst",         desc: "Proton converters ×2",            cost: [200,           0], tier: 1,  type: "prod",    value: 2  },
  { id: "prod1x4q",   name: "Proton Cascade",       desc: "Proton converters ×4",            cost: [2000,          0], tier: 1,  type: "prod",    value: 4  },
  { id: "prod2x2q",   name: "Atom Resonance",       desc: "Atom converters ×2",              cost: [5000,          0], tier: 2,  type: "prod",    value: 2  },
  { id: "prod2x4q",   name: "Atom Cascade",         desc: "Atom converters ×4",              cost: [50000,         0], tier: 2,  type: "prod",    value: 4  },
  { id: "prod3x2q",   name: "Molecule Lattice",     desc: "Molecule converters ×2",          cost: [200000,        0], tier: 3,  type: "prod",    value: 2  },
  { id: "prod3x4q",   name: "Molecule Web",         desc: "Molecule converters ×4",          cost: [2000000,       0], tier: 3,  type: "prod",    value: 4  },
  { id: "prod4x2q",   name: "Cell Division",        desc: "Cell converters ×2",              cost: [8000000,       0], tier: 4,  type: "prod",    value: 2  },
  { id: "prod4x4q",   name: "Cell Mitosis",         desc: "Cell converters ×4",              cost: [60000000,      0], tier: 4,  type: "prod",    value: 4  },
  { id: "prod5x2q",   name: "Organism Bloom",       desc: "Organism converters ×2",          cost: [300000000,     0], tier: 5,  type: "prod",    value: 2  },
  { id: "prod5x4q",   name: "Organism Swarm",       desc: "Organism converters ×4",          cost: [2500000000,    0], tier: 5,  type: "prod",    value: 4  },
  { id: "prod6x2q",   name: "Synapse Bloom",        desc: "Neuron converters ×2",            cost: [15000000000,   0], tier: 6,  type: "prod",    value: 2  },
  { id: "prod6x4q",   name: "Dendrite Surge",       desc: "Neuron converters ×4",            cost: [120000000000,  0], tier: 6,  type: "prod",    value: 4  },
  { id: "prod7x2q",   name: "Cortex Kindling",      desc: "Cortex converters ×2",            cost: [800000000000,  0], tier: 7,  type: "prod",    value: 2  },
  { id: "prod7x4q",   name: "Grey Matter",          desc: "Cortex converters ×4",            cost: [6000000000000, 0], tier: 7,  type: "prod",    value: 4  },
  { id: "prod8x2q",   name: "Mindflood",            desc: "Mind converters ×2",              cost: [40000000000000,  0], tier: 8, type: "prod",   value: 2  },
  { id: "prod8x4q",   name: "Noetic Surge",         desc: "Mind converters ×4",              cost: [300000000000000, 0], tier: 8, type: "prod",   value: 4  },

  // ── Feedforward: each tier energises the one below it ───────────────────────
  { id: "ff_1_0",  name: "Proton Pressure",      desc: "Protons energise Quarks — Quark production ×3",          cost: [700,           0], tier: 0, type: "prod", value: 3, requiresTier: 1 },
  { id: "ff_2_1",  name: "Atomic Compression",   desc: "Atoms compress Protons — Proton production ×3",          cost: [8000,          0], tier: 1, type: "prod", value: 3, requiresTier: 2 },
  { id: "ff_3_2",  name: "Molecular Tension",    desc: "Molecules stress Atoms — Atom production ×3",            cost: [120000,        0], tier: 2, type: "prod", value: 3, requiresTier: 3 },
  { id: "ff_4_3",  name: "Membrane Pressure",    desc: "Cells pressurise Molecules — Molecule production ×3",    cost: [5000000,       0], tier: 3, type: "prod", value: 3, requiresTier: 4 },
  { id: "ff_5_4",  name: "Metabolic Drive",      desc: "Organisms drive Cells — Cell production ×3",             cost: [30000000000,   0], tier: 4, type: "prod", value: 3, requiresTier: 5 },
  { id: "ff_6_5",  name: "Neural Stimulation",   desc: "Neurons stimulate Organisms — Organism production ×3",   cost: [500000000000,  0], tier: 5, type: "prod", value: 3, requiresTier: 6 },
  { id: "ff_7_6",  name: "Cortical Resonance",   desc: "Cortex resonates Neurons — Neuron production ×3",        cost: [4000000000000, 0], tier: 6, type: "prod", value: 3, requiresTier: 7 },
  { id: "ff_8_7",  name: "Conscious Reflection", desc: "Mind reflects on Cortex — Cortex production ×3",         cost: [30000000000000,0], tier: 7, type: "prod", value: 3, requiresTier: 8 },

  { id: "globalq2",   name: "Quantum Surge",       desc: "All production ×2",               cost: [10000,         0], tier: -1, type: "global",  value: 2  },
  { id: "globalq3",   name: "Grand Unification",   desc: "All production ×3",               cost: [5000000,       0], tier: -1, type: "global",  value: 3  },

  // ── Echo-cost production boosts ─────────────────────────────────────────────
  { id: "prod1x4",    name: "Proton Surge",         desc: "Proton converters ×4 (stacks)",   cost: [0,   3],  tier: 1,  type: "prod",    value: 4  },
  { id: "prod2x2",    name: "Atom Lattice II",      desc: "Atom converters ×2 (stacks)",     cost: [0,   5],  tier: 2,  type: "prod",    value: 2  },
  { id: "prod2x4",    name: "Atom Cascade II",      desc: "Atom converters ×4 (stacks)",     cost: [0,  20],  tier: 2,  type: "prod",    value: 4  },
  { id: "prod3x2",    name: "Molecule Web II",      desc: "Molecule converters ×2 (stacks)", cost: [0,  10],  tier: 3,  type: "prod",    value: 2  },
  { id: "prod3x4",    name: "Molecule Surge II",    desc: "Molecule converters ×4 (stacks)", cost: [0,  40],  tier: 3,  type: "prod",    value: 4  },
  { id: "prod4x2",    name: "Cell Division II",     desc: "Cell converters ×2 (stacks)",     cost: [0,  20],  tier: 4,  type: "prod",    value: 2  },
  { id: "prod4x4",    name: "Cell Mitosis II",      desc: "Cell converters ×4 (stacks)",     cost: [0,  80],  tier: 4,  type: "prod",    value: 4  },
  { id: "prod5x2",    name: "Organism Bloom II",    desc: "Organism converters ×2 (stacks)", cost: [0,  40],  tier: 5,  type: "prod",    value: 2  },
  { id: "prod5x4",    name: "Organism Swarm II",    desc: "Organism converters ×4 (stacks)", cost: [0, 150],  tier: 5,  type: "prod",    value: 4  },
  { id: "prod6x2",    name: "Synapse Boost II",     desc: "Neuron converters ×2 (stacks)",   cost: [0,  80],  tier: 6,  type: "prod",    value: 2  },
  { id: "prod6x4",    name: "Neural Network II",    desc: "Neuron converters ×4 (stacks)",   cost: [0, 300],  tier: 6,  type: "prod",    value: 4  },
  { id: "prod7x2",    name: "Cortex Expansion II",  desc: "Cortex converters ×2 (stacks)",   cost: [0, 160],  tier: 7,  type: "prod",    value: 2  },
  { id: "prod7x4",    name: "Prefrontal Surge II",  desc: "Cortex converters ×4 (stacks)",   cost: [0, 600],  tier: 7,  type: "prod",    value: 4  },
  { id: "prod8x2",    name: "Mindscape II",         desc: "Mind converters ×2 (stacks)",     cost: [0, 320],  tier: 8,  type: "prod",    value: 2  },
  { id: "prod8x4",    name: "Collective II",        desc: "Mind converters ×4 (stacks)",     cost: [0,1200],  tier: 8,  type: "prod",    value: 4  },

  // ── Global multipliers ───────────────────────────────────────────────────────
  { id: "global2",    name: "Universal Flux",       desc: "All production ×2",               cost: [0,   8],  tier: -1, type: "global",  value: 2  },
  { id: "global3",    name: "Cosmic Resonance",     desc: "All production ×3",               cost: [0,  30],  tier: -1, type: "global",  value: 3  },
  { id: "global5",    name: "Big Bang Echo",         desc: "All production ×5",               cost: [0, 100],  tier: -1, type: "global",  value: 5  },

  // ── Auto-upgrade ─────────────────────────────────────────────────────────────
  { id: "auto_upgrade", name: "Quantum Autosynthesis", desc: "Automatically purchases all Quark-cost upgrades when affordable", cost: [0, 10], tier: -1, type: "autoupgrade", value: 1 },

  // ── Culture production boosts ────────────────────────────────────────────
  { id: "civprod2q",   name: "Cultural Awakening",    desc: "Culture production ×2",                              cost: [5000000000,   0], tier: -1, type: "civprod",    value: 2, requiresCiv: true },
  { id: "civprod5q",   name: "Age of Enlightenment",  desc: "Culture production ×5",                              cost: [500000000000, 0], tier: -1, type: "civprod",    value: 5, requiresCiv: true },
  { id: "civprod3e",   name: "Eternal Flame",          desc: "Culture production ×3 (permanent)",                  cost: [0,  20],         tier: -1, type: "civprod",    value: 3, requiresCiv: true },
  { id: "civfestival", name: "Cultural Festival",      desc: "Unlock a 60s ×10 culture surge once per run",        cost: [0,  15],         tier: -1, type: "civfestival", value: 1, requiresCiv: true },

  // ── Civilisation upgrades ─────────────────────────────────────────────────
  { id: "civ_assemble", name: "Civilisation Assembler", desc: "Auto-buys all Civilisation tier converters when affordable",    cost: [0,  15], tier: -1, type: "civassemble", value: 1 },
  { id: "civ_autopol",  name: "Auto Policy",            desc: "Automatically enacts Policies when you have enough Culture",    cost: [0,  20], tier: -1, type: "civautopol",  value: 1 },
  { id: "civ_legacy",   name: "Cultural Legacy",        desc: "Purchased Policies survive Dark Ages resets",                  cost: [0,  25], tier: -1, type: "civlegacy",   value: 1 },
  { id: "civ_archive",  name: "Grand Archive",          desc: "Era tech choices grant double their effect",                   cost: [0,  50], tier: -1, type: "civarchive",  value: 1 },

  // ── Assemblers ───────────────────────────────────────────────────────────────
  { id: "auto0",      name: "Quark Assembler",      desc: "Auto-buys Quark converters",      cost: [0,   2],  tier: 0,  type: "autobuy", value: 0  },
  { id: "auto1",      name: "Proton Assembler",     desc: "Auto-buys Proton converters",     cost: [0,   4],  tier: 1,  type: "autobuy", value: 1  },
  { id: "auto2",      name: "Atom Assembler",       desc: "Auto-buys Atom converters",       cost: [0,   8],  tier: 2,  type: "autobuy", value: 2  },
  { id: "auto3",      name: "Molecule Assembler",   desc: "Auto-buys Molecule converters",   cost: [0,  16],  tier: 3,  type: "autobuy", value: 3  },
  { id: "auto4",      name: "Cell Assembler",       desc: "Auto-buys Cell converters",       cost: [0,  32],  tier: 4,  type: "autobuy", value: 4  },
  { id: "auto5",      name: "Organism Assembler",   desc: "Auto-buys Organism converters",   cost: [0,  64],  tier: 5,  type: "autobuy", value: 5  },
  { id: "auto6",      name: "Neuron Assembler",     desc: "Auto-buys Neuron converters",     cost: [0, 128],  tier: 6,  type: "autobuy", value: 6  },
  { id: "auto7",      name: "Cortex Assembler",     desc: "Auto-buys Cortex converters",     cost: [0, 256],  tier: 7,  type: "autobuy", value: 7  },
  { id: "auto8",      name: "Mind Assembler",       desc: "Auto-buys Mind converters",       cost: [0, 512],  tier: 8,  type: "autobuy", value: 8  },
];

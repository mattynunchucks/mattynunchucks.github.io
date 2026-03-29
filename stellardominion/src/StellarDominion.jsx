import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const GENERATORS = [
  { id: "solar",     name: "SOLAR ARRAY",     icon: "☀️",  flavour: "Harvests stellar radiation",    resource: "energy", resourceIcon: "⚡", baseCooldown: 4000,  baseYield: 1,   startCount: 1 },
  { id: "extractor", name: "ASTEROID MINER",  icon: "🪨",  flavour: "Drills rare asteroid ore",      resource: "ore",    resourceIcon: "🪨", baseCooldown: 9000,  baseYield: 5,   startCount: 0 },
  { id: "station",   name: "ORBITAL STATION", icon: "🛸",  flavour: "Processes ore into alloys",     resource: "alloy",  resourceIcon: "🔧", baseCooldown: 18000, baseYield: 20,  startCount: 0 },
  { id: "dyson",     name: "DYSON SWARM",     icon: "🌟",  flavour: "Megastructure stellar capture", resource: "plasma", resourceIcon: "🔥", baseCooldown: 40000, baseYield: 120, startCount: 0 },
];

const UPGRADES = [
  { id: "auto_solar",     name: "Solar AI",          desc: "Auto-harvests Solar Array when charged",  icon: "🤖", cost: 50,    resource: "energy", effect: { type: "auto",  genId: "solar"     } },
  { id: "auto_extractor", name: "Mining Drone",       desc: "Auto-activates Asteroid Miner",           icon: "🤖", cost: 400,   resource: "energy", effect: { type: "auto",  genId: "extractor" } },
  { id: "auto_station",   name: "Station Director",   desc: "Auto-runs Orbital Station",               icon: "🤖", cost: 3000,  resource: "energy", effect: { type: "auto",  genId: "station"   } },
  { id: "auto_dyson",     name: "Swarm Intelligence", desc: "Auto-fires Dyson Swarm",                  icon: "🤖", cost: 15000, resource: "energy", effect: { type: "auto",  genId: "dyson"     } },
  { id: "speed_solar1",   name: "Photon Lens",        desc: "Solar Array 25% faster",                  icon: "⚗️", cost: 80,    resource: "energy", effect: { type: "speed", genId: "solar",     mult: 0.75 } },
  { id: "speed_solar2",   name: "Quantum Cells",      desc: "Solar Array 25% faster again",            icon: "⚗️", cost: 600,   resource: "energy", effect: { type: "speed", genId: "solar",     mult: 0.75 } },
  { id: "speed_ext1",     name: "Plasma Drill",       desc: "Asteroid Miner 30% faster",               icon: "⚗️", cost: 800,   resource: "ore",    effect: { type: "speed", genId: "extractor", mult: 0.70 } },
  { id: "speed_sta1",     name: "Nano-Assemblers",    desc: "Orbital Station 25% faster",              icon: "⚗️", cost: 4000,  resource: "alloy",  effect: { type: "speed", genId: "station",   mult: 0.75 } },
  { id: "speed_dyson1",   name: "Graviton Focus",     desc: "Dyson Swarm 20% faster",                  icon: "⚗️", cost: 25000, resource: "plasma", effect: { type: "speed", genId: "dyson",     mult: 0.80 } },
  { id: "yield_solar1",   name: "Wide-Spectrum Lens", desc: "Solar Array yields ×2",                   icon: "📡", cost: 200,   resource: "energy", effect: { type: "yield", genId: "solar",     mult: 2 } },
  { id: "yield_ext1",     name: "Deep Core Tap",      desc: "Asteroid Miner yields ×2",                icon: "📡", cost: 1500,  resource: "ore",    effect: { type: "yield", genId: "extractor", mult: 2 } },
  { id: "yield_sta1",     name: "Hyper-Forge",        desc: "Orbital Station yields ×3",               icon: "📡", cost: 6000,  resource: "alloy",  effect: { type: "yield", genId: "station",   mult: 3 } },
  { id: "yield_dyson1",   name: "Stellar Tap",        desc: "Dyson Swarm yields ×2",                   icon: "📡", cost: 40000, resource: "plasma", effect: { type: "yield", genId: "dyson",     mult: 2 } },
];

// Conversion chains: spend `input` resource to get `output` over `duration` ms
const CONVERSIONS = [
  { id: "conv_energy_ore",   name: "ION SMELTER",      icon: "🔆", from: "energy", fromIcon: "⚡", to: "ore",    toIcon: "🪨", ratio: 10,  outAmt: 1,  duration: 6000,  flavour: "Ionises energy into raw ore",         unlockPlasma: 0    },
  { id: "conv_ore_alloy",    name: "CRUCIBLE FORGE",   icon: "🔩", from: "ore",    fromIcon: "🪨", to: "alloy",  toIcon: "🔧", ratio: 8,   outAmt: 1,  duration: 10000, flavour: "Smelts ore into structural alloy",    unlockPlasma: 0    },
  { id: "conv_alloy_plasma", name: "PLASMA INFUSER",   icon: "🌡️", from: "alloy",  fromIcon: "🔧", to: "plasma", toIcon: "🔥", ratio: 15,  outAmt: 1,  duration: 20000, flavour: "Infuses alloy into plasma fuel",      unlockPlasma: 0    },
  { id: "conv_plasma_core",  name: "CORE CRYSTALLISER",icon: "💎", from: "plasma", fromIcon: "🔥", to: "core",   toIcon: "💎", ratio: 500, outAmt: 1,  duration: 60000, flavour: "Crystallises plasma into Stellar Cores", unlockPlasma: 500 },
];

const GEN_COSTS = {
  solar:     (n) => Math.floor(10    * Math.pow(1.15, n)),
  extractor: (n) => Math.floor(200   * Math.pow(1.18, n)),
  station:   (n) => Math.floor(1500  * Math.pow(1.20, n)),
  dyson:     (n) => Math.floor(10000 * Math.pow(1.22, n)),
};

const PRESTIGE_THRESHOLD = 1000; // plasma needed to prestige
const PRESTIGE_CORE_GAIN = (plasma) => Math.floor(Math.sqrt(plasma / 100)); // cores earned
const CORE_BONUS_PER = 0.15; // +15% all yields per core

const BUY_AMOUNTS = [1, 5, 10, 25];
const BUY_CURRENCY = "energy";
const CONV_BATCH = [1, 5, 10];

function fmt(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9)  return (n / 1e9).toFixed(2)  + "B";
  if (n >= 1e6)  return (n / 1e6).toFixed(2)  + "M";
  if (n >= 1e3)  return (n / 1e3).toFixed(1)  + "K";
  return Math.floor(n).toString();
}

// ─── SAVE / LOAD ─────────────────────────────────────────────────────────────
const SAVE_KEY = "stellar_dominion_v1";

function buildDefaultState() {
  return {
    resources:        { energy: 0, ore: 0, alloy: 0, plasma: 0, core: 0 },
    generators:       Object.fromEntries(GENERATORS.map(g => [g.id, { count: g.startCount, cooldownEnd: 0, isRunning: false }])),
    purchasedUpgrades:[],
    stellarCores:     0,
    prestigeCount:    0,
    conversions:      Object.fromEntries(CONVERSIONS.map(c => [c.id, { isRunning: false, cooldownEnd: 0, batch: 1 }])),
    savedAt:          Date.now(),
  };
}

function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
    return true;
  } catch { return false; }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    const def = buildDefaultState();
    const now = Date.now();
    const offlineMs = Math.max(0, now - (saved.savedAt ?? now));

    // Merge saved data with defaults so new fields added later don't break old saves
    const gens = {};
    for (const g of GENERATORS) {
      const s = saved.generators?.[g.id] ?? def.generators[g.id];
      // Shift cooldown end forward by offline time so timers resume correctly
      const cooldownEnd = s.isRunning ? Math.max(now, s.cooldownEnd + offlineMs) : 0;
      gens[g.id] = { count: s.count ?? g.startCount, isRunning: s.isRunning ?? false, cooldownEnd };
    }

    const convs = {};
    for (const c of CONVERSIONS) {
      const s = saved.conversions?.[c.id] ?? def.conversions[c.id];
      const cooldownEnd = s.isRunning ? Math.max(now, s.cooldownEnd + offlineMs) : 0;
      convs[c.id] = { batch: s.batch ?? 1, isRunning: s.isRunning ?? false, cooldownEnd };
    }

    return {
      resources:         { ...def.resources, ...(saved.resources ?? {}) },
      generators:        gens,
      purchasedUpgrades: saved.purchasedUpgrades ?? [],
      stellarCores:      saved.stellarCores ?? 0,
      prestigeCount:     saved.prestigeCount ?? 0,
      conversions:       convs,
      offlineMs,
    };
  } catch { return null; }
}

// ─── STARFIELD ────────────────────────────────────────────────────────────────
function Starfield({ speed = 1 }) {
  const canvasRef = useRef(null);
  const speedRef = useRef(speed);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * 1400, y: Math.random() * 900,
      r: Math.random() * 1.3 + 0.2,
      speed: Math.random() * 0.10 + 0.02,
      alpha: Math.random() * 0.7 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
    }));
    function draw() {
      canvas.width = canvas.offsetWidth || 800;
      canvas.height = canvas.offsetHeight || 600;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now() / 1000;
      for (const s of stars) {
        const a = s.alpha * (0.6 + 0.4 * Math.sin(now * 1.1 + s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x % canvas.width, s.y % canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,220,255,${a})`;
        ctx.fill();
        s.y += s.speed * speedRef.current;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
}

// ─── PRESTIGE MODAL ───────────────────────────────────────────────────────────
function PrestigeModal({ plasma, stellarCores, onConfirm, onCancel }) {
  const gained = PRESTIGE_CORE_GAIN(plasma);
  const newTotal = stellarCores + gained;
  const newBonus = Math.round(newTotal * CORE_BONUS_PER * 100);
  return (
    <div style={MS.backdrop}>
      <div style={MS.modal}>
        <div style={MS.modalGlyph}>✦</div>
        <div style={MS.modalTitle}>STELLAR ASCENSION</div>
        <div style={MS.modalSub}>Collapse this star system and be reborn stronger</div>
        <div style={MS.modalDivider} />
        <div style={MS.modalBody}>
          <div style={MS.modalRow}><span style={MS.modalLabel}>PLASMA COLLECTED</span><span style={MS.modalVal}>{fmt(plasma)} 🔥</span></div>
          <div style={MS.modalRow}><span style={MS.modalLabel}>CORES EARNED</span><span style={{ ...MS.modalVal, color: C.gold }}>+{gained} 💎</span></div>
          <div style={MS.modalRow}><span style={MS.modalLabel}>NEW CORE TOTAL</span><span style={{ ...MS.modalVal, color: C.gold }}>{newTotal} 💎</span></div>
          <div style={MS.modalRow}><span style={MS.modalLabel}>GLOBAL YIELD BONUS</span><span style={{ ...MS.modalVal, color: C.green }}>+{newBonus}%</span></div>
        </div>
        <div style={MS.modalDivider} />
        <div style={MS.modalWarning}>⚠ ALL resources, generators, and upgrades will be reset</div>
        <div style={MS.modalBtns}>
          <button style={MS.btnCancel} onClick={onCancel}>ABORT</button>
          <button style={MS.btnConfirm} onClick={() => onConfirm(gained)}>ASCEND ✦</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function SpaceIdle() {
  // ── Load saved state once on mount
  const [initDone, setInitDone] = useState(false);
  const [offlineBanner, setOfflineBanner] = useState(null); // ms offline

  const saved = useRef(loadGame());
  const def   = useRef(buildDefaultState());
  const init  = saved.current ?? def.current;

  const [resources, setResources] = useState(init.resources);
  const [generators, setGenerators] = useState(init.generators);
  const [purchasedUpgrades, setPurchasedUpgrades] = useState(new Set(init.purchasedUpgrades));
  const [stellarCores, setStellarCores] = useState(init.stellarCores);
  const [prestigeCount, setPrestigeCount] = useState(init.prestigeCount);
  const [showPrestige, setShowPrestige] = useState(false);
  const [prestigeFlash, setPrestigeFlash] = useState(false);
  const [conversions, setConversions] = useState(init.conversions);

  const [tab, setTab] = useState("generators");
  const [buyAmount, setBuyAmount] = useState(1);
  const [floaters, setFloaters] = useState([]);
  const [shakeGen, setShakeGen] = useState(null);
  const [saveToast, setSaveToast] = useState(false); // "SAVED" flash
  const floaterIdRef = useRef(0);
  const resourcesRef = useRef(resources);
  useEffect(() => { resourcesRef.current = resources; }, [resources]);

  // Show offline banner once
  useEffect(() => {
    if (saved.current?.offlineMs > 5000) {
      setOfflineBanner(saved.current.offlineMs);
      const t = setTimeout(() => setOfflineBanner(null), 4000);
      return () => clearTimeout(t);
    }
    setInitDone(true);
  }, []);

  // ── Collect current game state for saving
  const stateForSave = useCallback((res, gens, upgrades, cores, presCount, convs) => ({
    resources: res,
    generators: Object.fromEntries(
      Object.entries(gens).map(([id, s]) => [id, { count: s.count, isRunning: s.isRunning, cooldownEnd: s.cooldownEnd }])
    ),
    purchasedUpgrades: [...upgrades],
    stellarCores: cores,
    prestigeCount: presCount,
    conversions: Object.fromEntries(
      Object.entries(convs).map(([id, s]) => [id, { batch: s.batch, isRunning: s.isRunning, cooldownEnd: s.cooldownEnd }])
    ),
  }), []);

  // ── Autosave every 10s
  const resourcesSnapRef   = useRef(resources);
  const generatorsSnapRef  = useRef(generators);
  const upgradesSnapRef    = useRef(purchasedUpgrades);
  const coresSnapRef       = useRef(stellarCores);
  const presCountSnapRef   = useRef(prestigeCount);
  const conversionsSnapRef = useRef(conversions);
  useEffect(() => { resourcesSnapRef.current   = resources;         }, [resources]);
  useEffect(() => { generatorsSnapRef.current  = generators;        }, [generators]);
  useEffect(() => { upgradesSnapRef.current    = purchasedUpgrades; }, [purchasedUpgrades]);
  useEffect(() => { coresSnapRef.current       = stellarCores;      }, [stellarCores]);
  useEffect(() => { presCountSnapRef.current   = prestigeCount;     }, [prestigeCount]);
  useEffect(() => { conversionsSnapRef.current = conversions;       }, [conversions]);

  const doSave = useCallback(() => {
    saveGame(stateForSave(
      resourcesSnapRef.current, generatorsSnapRef.current, upgradesSnapRef.current,
      coresSnapRef.current, presCountSnapRef.current, conversionsSnapRef.current
    ));
  }, [stateForSave]);

  // Autosave interval
  useEffect(() => {
    const t = setInterval(doSave, 10000);
    return () => clearInterval(t);
  }, [doSave]);

  // Save on tab close / navigation
  useEffect(() => {
    window.addEventListener("beforeunload", doSave);
    return () => window.removeEventListener("beforeunload", doSave);
  }, [doSave]);

  // Manual save with toast
  const handleManualSave = () => {
    doSave();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // ── Prestige multiplier
  const prestigeMult = 1 + stellarCores * CORE_BONUS_PER;

  // ── Upgrade effects
  const upgradeEffects = useCallback(() => {
    const autoMap = {}, speedMap = {}, yieldMap = {};
    for (const uid of purchasedUpgrades) {
      const u = UPGRADES.find(x => x.id === uid);
      if (!u) continue;
      if (u.effect.type === "auto")  autoMap[u.effect.genId] = true;
      if (u.effect.type === "speed") speedMap[u.effect.genId] = (speedMap[u.effect.genId] ?? 1) * u.effect.mult;
      if (u.effect.type === "yield") yieldMap[u.effect.genId] = (yieldMap[u.effect.genId] ?? 1) * u.effect.mult;
    }
    return { autoMap, speedMap, yieldMap };
  }, [purchasedUpgrades]);

  const getCD = useCallback((genId) => {
    const { speedMap } = upgradeEffects();
    return Math.max(500, GENERATORS.find(g => g.id === genId).baseCooldown * (speedMap[genId] ?? 1));
  }, [upgradeEffects]);

  const getYield = useCallback((genId, count) => {
    const { yieldMap } = upgradeEffects();
    return GENERATORS.find(g => g.id === genId).baseYield * count * (yieldMap[genId] ?? 1) * prestigeMult;
  }, [upgradeEffects, prestigeMult]);

  // ── Generator tick
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const { autoMap } = upgradeEffects();
      setGenerators(prev => {
        const next = { ...prev };
        const earned = {};
        for (const g of GENERATORS) {
          const state = prev[g.id];
          if (!state.isRunning) {
            if (autoMap[g.id] && state.count > 0)
              next[g.id] = { ...state, isRunning: true, cooldownEnd: now + getCD(g.id) };
            continue;
          }
          if (now >= state.cooldownEnd) {
            const amount = getYield(g.id, state.count);
            earned[g.resource] = (earned[g.resource] ?? 0) + amount;
            next[g.id] = autoMap[g.id]
              ? { ...state, isRunning: true, cooldownEnd: now + getCD(g.id) }
              : { ...state, isRunning: false, cooldownEnd: 0 };
            setFloaters(f => [...f, { id: ++floaterIdRef.current, genId: g.id, amount: Math.floor(amount), icon: g.resourceIcon }]);
          }
        }
        if (Object.keys(earned).length)
          setResources(r => { const nr = { ...r }; for (const [k, v] of Object.entries(earned)) nr[k] = (nr[k] ?? 0) + v; return nr; });
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [upgradeEffects, getCD, getYield]);

  // ── Conversion tick
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setConversions(prev => {
        const next = { ...prev };
        let anyEarned = false;
        const earned = {};
        for (const conv of CONVERSIONS) {
          const state = prev[conv.id];
          if (!state.isRunning) continue;
          if (now >= state.cooldownEnd) {
            const outAmt = conv.outAmt * state.batch * prestigeMult;
            earned[conv.to] = (earned[conv.to] ?? 0) + outAmt;
            next[conv.id] = { ...state, isRunning: false, cooldownEnd: 0 };
            anyEarned = true;
            setFloaters(f => [...f, { id: ++floaterIdRef.current, genId: "conv_" + conv.id, amount: Math.floor(outAmt), icon: conv.toIcon }]);
          }
        }
        if (anyEarned)
          setResources(r => { const nr = { ...r }; for (const [k, v] of Object.entries(earned)) nr[k] = (nr[k] ?? 0) + v; return nr; });
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [prestigeMult]);

  // ── Floater cleanup
  useEffect(() => {
    if (!floaters.length) return;
    const t = setTimeout(() => setFloaters(f => f.slice(1)), 1400);
    return () => clearTimeout(t);
  }, [floaters]);

  // ── Handlers: generators
  const handleGenClick = (genId) => {
    setGenerators(prev => {
      const state = prev[genId];
      if (state.isRunning || state.count === 0) {
        setShakeGen(genId); setTimeout(() => setShakeGen(null), 400);
        return prev;
      }
      return { ...prev, [genId]: { ...state, isRunning: true, cooldownEnd: Date.now() + getCD(genId) } };
    });
  };

  const handleBuyGen = (genId) => {
    setGenerators(prev => {
      const cur = prev[genId].count;
      let cost = 0;
      for (let i = 0; i < buyAmount; i++) cost += GEN_COSTS[genId](cur + i);
      if (resourcesRef.current[BUY_CURRENCY] < cost) return prev;
      setResources(r => ({ ...r, [BUY_CURRENCY]: r[BUY_CURRENCY] - cost }));
      return { ...prev, [genId]: { ...prev[genId], count: cur + buyAmount } };
    });
  };

  const getBuyCost = (genId) => {
    const cur = generators[genId].count;
    let total = 0;
    for (let i = 0; i < buyAmount; i++) total += GEN_COSTS[genId](cur + i);
    return total;
  };

  const getGenProgress = (genId) => {
    const state = generators[genId];
    if (!state.isRunning) return 0;
    return Math.min(1, Math.max(0, 1 - (state.cooldownEnd - Date.now()) / getCD(genId)));
  };

  // ── Handlers: upgrades
  const handleBuyUpgrade = (u) => {
    if (purchasedUpgrades.has(u.id)) return;
    if ((resources[u.resource] ?? 0) < u.cost) return;
    setResources(r => ({ ...r, [u.resource]: r[u.resource] - u.cost }));
    setPurchasedUpgrades(s => new Set([...s, u.id]));
  };

  // ── Handlers: conversions
  const handleStartConversion = (convId) => {
    const conv = CONVERSIONS.find(c => c.id === convId);
    const state = conversions[convId];
    if (state.isRunning) return;
    const inputCost = conv.ratio * state.batch;
    if ((resources[conv.from] ?? 0) < inputCost) {
      setShakeGen("conv_" + convId); setTimeout(() => setShakeGen(null), 400);
      return;
    }
    setResources(r => ({ ...r, [conv.from]: r[conv.from] - inputCost }));
    setConversions(prev => ({
      ...prev,
      [convId]: { ...prev[convId], isRunning: true, cooldownEnd: Date.now() + conv.duration * prev[convId].batch },
    }));
  };

  const handleSetConvBatch = (convId, batch) => {
    setConversions(prev => ({ ...prev, [convId]: { ...prev[convId], batch } }));
  };

  const getConvProgress = (convId) => {
    const state = conversions[convId];
    if (!state.isRunning) return 0;
    const dur = CONVERSIONS.find(c => c.id === convId).duration * state.batch;
    return Math.min(1, Math.max(0, 1 - (state.cooldownEnd - Date.now()) / dur));
  };

  // ── Prestige
  const handlePrestigeConfirm = (gained) => {
    const newCores = stellarCores + gained;
    const newCount = prestigeCount + 1;
    const newRes   = { energy: 0, ore: 0, alloy: 0, plasma: 0, core: 0 };
    const newGens  = Object.fromEntries(GENERATORS.map(g => [g.id, { count: g.startCount, cooldownEnd: 0, isRunning: false }]));
    const newConvs = Object.fromEntries(CONVERSIONS.map(c => [c.id, { isRunning: false, cooldownEnd: 0, batch: 1 }]));
    const newUpgrades = new Set();

    setStellarCores(newCores);
    setPrestigeCount(newCount);
    setResources(newRes);
    setGenerators(newGens);
    setPurchasedUpgrades(newUpgrades);
    setConversions(newConvs);
    setShowPrestige(false);
    setPrestigeFlash(true);
    setTimeout(() => setPrestigeFlash(false), 1800);

    // Save immediately after prestige so cores are never lost on crash
    saveGame(stateForSave(newRes, newGens, newUpgrades, newCores, newCount, newConvs));
  };

  const canPrestige = resources.plasma >= PRESTIGE_THRESHOLD;
  const coresPreview = PRESTIGE_CORE_GAIN(resources.plasma);
  const { autoMap } = upgradeEffects();

  const TABS = [
    ["generators", "⬡ OPERATIONS"],
    ["conversions", "⇌ REFINERY"],
    ["upgrades", "◎ RESEARCH"],
    ["prestige", "✦ ASCENSION"],
  ];

  return (
    <div style={S.root}>
      <Starfield speed={prestigeFlash ? 8 : 1} />
      <div style={S.scanlines} />
      {prestigeFlash && <div style={S.prestigeFlash} />}

      {showPrestige && (
        <PrestigeModal
          plasma={resources.plasma}
          stellarCores={stellarCores}
          onConfirm={handlePrestigeConfirm}
          onCancel={() => setShowPrestige(false)}
        />
      )}

      {/* ── SAVE TOAST ── */}
      {saveToast && (
        <div style={S.saveToast}>✓ GAME SAVED</div>
      )}

      {/* ── OFFLINE BANNER ── */}
      {offlineBanner && (
        <div style={S.offlineBanner}>
          ⏱ WELCOME BACK — {Math.floor(offlineBanner / 60000)}m {Math.floor((offlineBanner % 60000) / 1000)}s offline · timers resumed
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={S.header}>
        <div style={S.headerBrand}>
          <span style={S.headerGlyph}>◈</span>
          <div>
            <div style={S.headerTitle}>STELLAR DOMINION</div>
            <div style={S.headerSub}>
              GALACTIC RESOURCE AUTHORITY · SECTOR 7
              {prestigeCount > 0 && <span style={S.headerPrestige}> · ASCENSION {prestigeCount} · CORE BONUS +{Math.round(stellarCores * CORE_BONUS_PER * 100)}%</span>}
            </div>
          </div>
        </div>
        <div style={S.resourceBar}>
          {GENERATORS.map(g => (
            <div key={g.id} style={S.resPill}>
              <span>{g.resourceIcon}</span>
              <div>
                <div style={S.resLabel}>{g.resource.toUpperCase()}</div>
                <div style={S.resVal}>{fmt(resources[g.resource] ?? 0)}</div>
              </div>
            </div>
          ))}
          {stellarCores > 0 && (
            <div style={{ ...S.resPill, border: `1px solid ${C.gold}` }}>
              <span>💎</span>
              <div>
                <div style={S.resLabel}>CORES</div>
                <div style={{ ...S.resVal, color: C.gold }}>{stellarCores}</div>
              </div>
            </div>
          )}
          <button onClick={handleManualSave} style={S.saveBtn} title="Save game">
            💾 SAVE
          </button>
        </div>
      </header>

      {/* ── TAB BAR ── */}
      <div style={S.controlBar}>
        <div style={S.tabs}>
          {TABS.map(([id, label]) => (
            <button
              key={id}
              style={{ ...S.tab, ...(tab === id ? S.tabActive : {}), ...(id === "prestige" && canPrestige ? S.tabPrestige : {}) }}
              onClick={() => setTab(id)}
            >
              {label}
              {id === "prestige" && canPrestige && <span style={S.tabDot} />}
            </button>
          ))}
        </div>
        {tab === "generators" && (
          <div style={S.buyRow}>
            <span style={S.buyLabel}>BATCH:</span>
            {BUY_AMOUNTS.map(n => (
              <button key={n} style={{ ...S.buyBtn, ...(buyAmount === n ? S.buyBtnOn : {}) }} onClick={() => setBuyAmount(n)}>×{n}</button>
            ))}
          </div>
        )}
      </div>

      {/* ── MAIN ── */}
      <main style={S.main}>

        {/* GENERATORS TAB */}
        {tab === "generators" && (
          <div style={S.genList}>
            {GENERATORS.map(g => {
              const state = generators[g.id];
              const prog = getGenProgress(g.id);
              const isReady = !state.isRunning && state.count > 0;
              const isAuto = autoMap[g.id];
              const cost = getBuyCost(g.id);
              const canAfford = resources[BUY_CURRENCY] >= cost;
              const effYield = getYield(g.id, Math.max(1, state.count));
              const cdSec = (getCD(g.id) / 1000).toFixed(1);

              return (
                <div key={g.id} style={{ ...S.genCard, ...(state.count === 0 ? S.genLocked : {}), animation: shakeGen === g.id ? "shake .4s ease" : undefined }}>
                  {state.count === 0 && (
                    <div style={S.lockOverlay}><div style={{ fontSize: 22 }}>🔒</div><div style={S.lockText}>ACQUIRE FIRST UNIT</div></div>
                  )}
                  <div style={S.cornerTL} /><div style={S.cornerBR} />
                  <div style={{ ...S.progBg, width: `${prog * 100}%` }} />
                  <div style={S.genInner}>
                    <button
                      style={{ ...S.activateBtn, ...(isReady ? S.activateBtnReady : {}), ...(isAuto && !isReady ? S.activateBtnAuto : {}), ...(state.isRunning ? S.activateBtnRunning : {}) }}
                      onClick={() => handleGenClick(g.id)}
                      disabled={state.count === 0}
                    >
                      <span style={{ fontSize: 28, userSelect: "none" }}>{g.icon}</span>
                      {isReady && <span style={S.readyPulse} />}
                      {isAuto && <div style={S.autoPill}>AUTO</div>}
                    </button>
                    <div style={S.genInfo}>
                      <div style={S.genName}>{g.name}</div>
                      <div style={S.genFlavour}>{g.flavour}</div>
                      <div style={S.genMeta}>
                        <span style={S.metaChip}>COUNT <b style={{ color: C.cyan }}>{state.count}</b></span>
                        <span style={S.metaChip}>YIELD <b style={{ color: C.green }}>+{fmt(effYield)} {g.resourceIcon}</b></span>
                        <span style={S.metaChip}>CYCLE <b style={{ color: C.amber }}>{cdSec}s</b></span>
                      </div>
                      {state.isRunning && (
                        <div style={S.progTrack}>
                          <div style={{ ...S.progFill, width: `${prog * 100}%` }} />
                          <span style={S.progPct}>{Math.round(prog * 100)}%</span>
                        </div>
                      )}
                    </div>
                    <button style={{ ...S.buyGenBtn, ...(canAfford ? S.buyGenOn : S.buyGenOff) }} onClick={() => handleBuyGen(g.id)}>
                      <span style={S.buyGenTop}>DEPLOY ×{buyAmount}</span>
                      <span style={S.buyGenCost}>{fmt(cost)} ⚡</span>
                    </button>
                  </div>
                  {floaters.filter(f => f.genId === g.id).map(f => (
                    <div key={f.id} style={S.floater}>+{fmt(f.amount)} {f.icon}</div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* CONVERSIONS TAB */}
        {tab === "conversions" && (
          <div>
            <div style={S.convHeader}>
              <span style={S.convHeaderTitle}>RESOURCE REFINERY</span>
              <span style={S.convHeaderSub}>Convert raw resources up the production chain · Prestige bonus applies to output</span>
            </div>
            <div style={S.chainFlow}>
              {["⚡ Energy", "🪨 Ore", "🔧 Alloy", "🔥 Plasma", "💎 Cores"].map((r, i, arr) => (
                <span key={r} style={S.chainStep}>
                  <span style={S.chainRes}>{r}</span>
                  {i < arr.length - 1 && <span style={S.chainArrow}>→</span>}
                </span>
              ))}
            </div>
            <div style={S.convList}>
              {CONVERSIONS.map(conv => {
                const state = conversions[conv.id];
                const prog = getConvProgress(conv.id);
                const inputCost = conv.ratio * state.batch;
                const outAmt = Math.floor(conv.outAmt * state.batch * prestigeMult);
                const canAfford = (resources[conv.from] ?? 0) >= inputCost;
                const unlocked = conv.unlockPlasma === 0 || resources.plasma >= conv.unlockPlasma || stellarCores > 0;
                const dur = ((conv.duration * state.batch) / 1000).toFixed(1);
                const isShaking = shakeGen === "conv_" + conv.id;

                return (
                  <div key={conv.id} style={{ ...S.convCard, ...(!unlocked ? S.genLocked : {}), animation: isShaking ? "shake .4s ease" : undefined }}>
                    {!unlocked && (
                      <div style={S.lockOverlay}>
                        <div style={{ fontSize: 20 }}>🔒</div>
                        <div style={S.lockText}>REQUIRES {fmt(conv.unlockPlasma)} 🔥 PLASMA</div>
                      </div>
                    )}
                    <div style={S.cornerTL} /><div style={S.cornerBR} />
                    {state.isRunning && <div style={{ ...S.progBg, width: `${prog * 100}%`, background: "rgba(255,180,0,.07)" }} />}

                    <div style={S.convInner}>
                      {/* Icon */}
                      <div style={S.convIconWrap}>
                        <span style={S.convIcon}>{conv.icon}</span>
                      </div>

                      {/* Info */}
                      <div style={S.convInfo}>
                        <div style={S.convName}>{conv.name}</div>
                        <div style={S.convFlavour}>{conv.flavour}</div>
                        <div style={S.convRecipe}>
                          <span style={{ color: C.amber }}>{fmt(inputCost)} {conv.fromIcon}</span>
                          <span style={{ color: C.textDim, margin: "0 6px" }}>→</span>
                          <span style={{ color: C.green }}>{fmt(outAmt)} {conv.toIcon}</span>
                          <span style={{ color: C.textDim, marginLeft: 10, fontSize: 11 }}>in {dur}s</span>
                        </div>
                        {state.isRunning && (
                          <div style={S.progTrack}>
                            <div style={{ ...S.progFill, width: `${prog * 100}%`, background: `linear-gradient(90deg,${C.amberDim},${C.amber})`, boxShadow: `0 0 6px ${C.amber}` }} />
                            <span style={S.progPct}>{Math.round(prog * 100)}%</span>
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div style={S.convControls}>
                        <div style={S.convBatchRow}>
                          {CONV_BATCH.map(b => (
                            <button
                              key={b}
                              style={{ ...S.convBatchBtn, ...(state.batch === b ? S.convBatchBtnOn : {}) }}
                              onClick={() => handleSetConvBatch(conv.id, b)}
                              disabled={state.isRunning}
                            >×{b}</button>
                          ))}
                        </div>
                        <button
                          style={{ ...S.convRunBtn, ...(canAfford && !state.isRunning ? S.convRunBtnOn : S.convRunBtnOff) }}
                          onClick={() => handleStartConversion(conv.id)}
                          disabled={state.isRunning || !canAfford}
                        >
                          {state.isRunning ? "PROCESSING…" : "CONVERT"}
                        </button>
                      </div>
                    </div>

                    {floaters.filter(f => f.genId === "conv_" + conv.id).map(f => (
                      <div key={f.id} style={{ ...S.floater, color: C.amber, textShadow: `0 0 10px ${C.amber}` }}>
                        +{fmt(f.amount)} {f.icon}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* UPGRADES TAB */}
        {tab === "upgrades" && (
          <div style={S.upGrid}>
            {UPGRADES.map(u => {
              const owned = purchasedUpgrades.has(u.id);
              const canAfford = (resources[u.resource] ?? 0) >= u.cost;
              const resIcon = GENERATORS.find(g => g.resource === u.resource)?.resourceIcon;
              return (
                <button key={u.id} style={{ ...S.upCard, ...(owned ? S.upOwned : {}), ...(canAfford && !owned ? S.upAfford : {}) }} onClick={() => handleBuyUpgrade(u)} disabled={owned}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{u.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={S.upName}>{u.name}</div>
                    <div style={S.upDesc}>{u.desc}</div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "center", minWidth: 50 }}>
                    {owned
                      ? <span style={S.upOwnedBadge}>✓ ONLINE</span>
                      : <><div style={S.upCost}>{fmt(u.cost)}</div><div style={{ fontSize: 15, marginTop: 2 }}>{resIcon}</div></>
                    }
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* PRESTIGE TAB */}
        {tab === "prestige" && (
          <div style={S.prestigePanel}>
            <div style={S.prestigeHero}>
              <div style={S.prestigeHeroGlyph}>✦</div>
              <div style={S.prestigeHeroTitle}>STELLAR ASCENSION</div>
              <div style={S.prestigeHeroSub}>Collapse your star system to crystallise Stellar Cores — permanent power that compounds across all future timelines.</div>
            </div>

            <div style={S.prestigeCards}>
              {/* Status */}
              <div style={S.prestigeCard}>
                <div style={S.pcTitle}>CURRENT STATUS</div>
                <div style={S.pcRow}><span style={S.pcLabel}>Ascensions</span><span style={S.pcVal}>{prestigeCount}</span></div>
                <div style={S.pcRow}><span style={S.pcLabel}>Stellar Cores</span><span style={{ ...S.pcVal, color: C.gold }}>{stellarCores} 💎</span></div>
                <div style={S.pcRow}><span style={S.pcLabel}>Global Bonus</span><span style={{ ...S.pcVal, color: C.green }}>×{prestigeMult.toFixed(2)} yield</span></div>
              </div>

              {/* Next prestige preview */}
              <div style={{ ...S.prestigeCard, border: canPrestige ? `1px solid ${C.gold}` : `1px solid ${C.border}` }}>
                <div style={S.pcTitle}>NEXT ASCENSION</div>
                <div style={S.pcRow}><span style={S.pcLabel}>Plasma held</span><span style={{ ...S.pcVal, color: C.amber }}>{fmt(resources.plasma)} 🔥</span></div>
                <div style={S.pcRow}><span style={S.pcLabel}>Required</span><span style={{ ...S.pcVal, color: canPrestige ? C.green : C.textDim }}>{fmt(PRESTIGE_THRESHOLD)} 🔥</span></div>
                <div style={S.pcRow}><span style={S.pcLabel}>Cores to earn</span><span style={{ ...S.pcVal, color: C.gold }}>+{coresPreview} 💎</span></div>
                <div style={S.pcRow}><span style={S.pcLabel}>New bonus</span><span style={{ ...S.pcVal, color: C.green }}>×{(1 + (stellarCores + coresPreview) * CORE_BONUS_PER).toFixed(2)}</span></div>
              </div>

              {/* How it works */}
              <div style={S.prestigeCard}>
                <div style={S.pcTitle}>HOW ASCENSION WORKS</div>
                <div style={S.pcRule}>💎 Earn Stellar Cores based on plasma collected</div>
                <div style={S.pcRule}>📈 Each core gives +{Math.round(CORE_BONUS_PER * 100)}% to all generator yields</div>
                <div style={S.pcRule}>🔄 Resources, generators & upgrades reset</div>
                <div style={S.pcRule}>♾️ Cores & ascension count are permanent</div>
                <div style={S.pcRule}>⚗️ Core formula: √(plasma ÷ 100)</div>
              </div>
            </div>

            {/* Progress bar to prestige */}
            <div style={S.prestigeProgress}>
              <div style={S.ppLabel}>
                <span>PLASMA TO ASCENSION THRESHOLD</span>
                <span style={{ color: canPrestige ? C.green : C.amber }}>{fmt(resources.plasma)} / {fmt(PRESTIGE_THRESHOLD)}</span>
              </div>
              <div style={S.ppTrack}>
                <div style={{ ...S.ppFill, width: `${Math.min(100, (resources.plasma / PRESTIGE_THRESHOLD) * 100)}%` }} />
              </div>
            </div>

            <button
              style={{ ...S.prestigeBtn, ...(canPrestige ? S.prestigeBtnReady : S.prestigeBtnDisabled) }}
              onClick={() => canPrestige && setShowPrestige(true)}
              disabled={!canPrestige}
            >
              {canPrestige ? "✦ INITIATE STELLAR ASCENSION" : `NEED ${fmt(Math.max(0, PRESTIGE_THRESHOLD - resources.plasma))} MORE 🔥 PLASMA`}
            </button>
          </div>
        )}

      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
        @keyframes floatUp { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-70px) scale(1.4)} }
        @keyframes readyRing { 0%{transform:scale(1);opacity:.9} 100%{transform:scale(2.4);opacity:0} }
        @keyframes glowCyan { 0%,100%{box-shadow:0 0 8px 1px rgba(0,255,220,.3)} 50%{box-shadow:0 0 20px 4px rgba(0,255,220,.6)} }
        @keyframes toastIn { 0%{opacity:0;transform:translateY(-10px)} 15%{opacity:1;transform:translateY(0)} 80%{opacity:1} 100%{opacity:0} }
        @keyframes bannerIn { 0%{opacity:0;transform:translateY(-6px)} 10%{opacity:1;transform:translateY(0)} 85%{opacity:1} 100%{opacity:0} }
        @keyframes prestigeFlash { 0%{opacity:.9} 100%{opacity:0} }
        @keyframes dotPulse { 0%,100%{opacity:1} 50%{opacity:.2} }
      `}</style>
    </div>
  );
}

// ─── COLORS ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#030810", panel: "#060e1a", border: "#0d2540", borderHi: "#1a4a7a",
  cyan: "#00ffe0", cyanDim: "#007a6e", amber: "#ffb833", amberDim: "#7a5500",
  gold: "#ffd166", green: "#39e88a", red: "#ff3c5a",
  textPri: "#c8e8ff", textDim: "#3a6080", textMid: "#6a9ab8",
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  saveToast: { position: "fixed", top: 16, right: 16, zIndex: 200, background: "#0a1f0e", border: `1px solid ${C.green}`, color: C.green, fontFamily: "'Share Tech Mono',monospace", fontSize: 12, letterSpacing: "0.12em", padding: "8px 18px", borderRadius: 4, boxShadow: `0 0 14px rgba(57,232,138,.2)`, animation: "toastIn 2s ease forwards", pointerEvents: "none" },
  offlineBanner: { position: "relative", zIndex: 3, background: "#0d1a0a", borderBottom: `1px solid ${C.green}`, color: C.green, fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: "0.1em", padding: "6px 20px", textAlign: "center", animation: "bannerIn 4s ease forwards" },
  saveBtn: { background: "transparent", border: `1px solid ${C.border}`, color: C.textDim, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", padding: "5px 10px", borderRadius: 3, cursor: "pointer", transition: "all .15s", flexShrink: 0 },
  scanlines: { position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,220,.012) 3px,rgba(0,255,220,.012) 4px)" },
  prestigeFlash: { position: "fixed", inset: 0, zIndex: 50, background: "radial-gradient(ellipse at center,rgba(255,210,80,.35) 0%,transparent 70%)", pointerEvents: "none", animation: "prestigeFlash 1.8s ease-out forwards" },

  header: { position: "relative", zIndex: 2, background: "linear-gradient(180deg,#070f1f 0%,#030810 100%)", borderBottom: `1px solid ${C.borderHi}`, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, boxShadow: "0 2px 24px rgba(0,255,220,.07)" },
  headerBrand: { display: "flex", alignItems: "center", gap: 14 },
  headerGlyph: { fontSize: 36, color: C.cyan, textShadow: `0 0 20px ${C.cyan}`, lineHeight: 1 },
  headerTitle: { fontWeight: 700, fontSize: 22, letterSpacing: "0.25em", color: C.cyan, textShadow: `0 0 14px ${C.cyanDim}` },
  headerSub: { fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.textDim, letterSpacing: "0.12em", marginTop: 2 },
  headerPrestige: { color: C.gold },
  resourceBar: { display: "flex", gap: 6, flexWrap: "wrap" },
  resPill: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 12px", display: "flex", alignItems: "center", gap: 8 },
  resLabel: { fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: C.textDim, letterSpacing: "0.1em" },
  resVal: { fontFamily: "'Share Tech Mono',monospace", fontSize: 15, color: C.cyan, minWidth: 44 },

  controlBar: { position: "relative", zIndex: 2, background: "#040c18", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", padding: "0 16px" },
  tabs: { display: "flex" },
  tab: { background: "transparent", border: "none", borderBottom: "2px solid transparent", color: C.textDim, fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.12em", padding: "10px 16px", cursor: "pointer", transition: "all .2s", position: "relative" },
  tabActive: { color: C.cyan, borderBottom: `2px solid ${C.cyan}`, textShadow: `0 0 8px ${C.cyanDim}` },
  tabPrestige: { color: C.gold },
  tabDot: { position: "absolute", top: 8, right: 6, width: 6, height: 6, borderRadius: "50%", background: C.gold, animation: "dotPulse 1.2s infinite" },
  buyRow: { display: "flex", alignItems: "center", gap: 5, padding: "6px 0" },
  buyLabel: { fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: C.textDim, letterSpacing: "0.1em", marginRight: 4 },
  buyBtn: { background: C.panel, border: `1px solid ${C.border}`, color: C.textDim, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, padding: "4px 10px", borderRadius: 3, cursor: "pointer", transition: "all .15s" },
  buyBtnOn: { background: C.cyanDim, border: `1px solid ${C.cyan}`, color: C.cyan },

  main: { flex: 1, overflowY: "auto", padding: 14, position: "relative", zIndex: 2 },
  genList: { display: "flex", flexDirection: "column", gap: 10 },
  genCard: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, position: "relative", overflow: "hidden", transition: "border-color .2s" },
  genLocked: { opacity: 0.42 },
  lockOverlay: { position: "absolute", inset: 0, zIndex: 10, background: "rgba(3,8,16,.78)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 },
  lockText: { fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: C.textDim, letterSpacing: "0.15em" },
  cornerTL: { position: "absolute", top: 0, left: 0, width: 14, height: 14, borderTop: `2px solid ${C.cyanDim}`, borderLeft: `2px solid ${C.cyanDim}`, pointerEvents: "none" },
  cornerBR: { position: "absolute", bottom: 0, right: 0, width: 14, height: 14, borderBottom: `2px solid ${C.cyanDim}`, borderRight: `2px solid ${C.cyanDim}`, pointerEvents: "none" },
  progBg: { position: "absolute", top: 0, left: 0, height: "100%", background: "rgba(0,255,220,.048)", transition: "width .05s linear", pointerEvents: "none" },
  genInner: { display: "flex", alignItems: "center", gap: 14, padding: "13px 15px", position: "relative", zIndex: 1 },
  activateBtn: { width: 66, height: 66, background: "#070f1c", border: `2px solid ${C.border}`, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0, transition: "all .15s" },
  activateBtnReady: { border: `2px solid ${C.cyan}`, animation: "glowCyan 1.5s infinite" },
  activateBtnAuto: { border: `2px solid ${C.amber}` },
  activateBtnRunning: { border: `2px solid ${C.cyanDim}`, opacity: 0.65, cursor: "default" },
  readyPulse: { position: "absolute", inset: -3, borderRadius: "50%", border: `2px solid ${C.cyan}`, animation: "readyRing 1.6s infinite", pointerEvents: "none" },
  autoPill: { position: "absolute", bottom: -9, left: "50%", transform: "translateX(-50%)", background: C.amber, color: "#000", fontSize: 7, fontWeight: 700, padding: "1px 5px", borderRadius: 2, letterSpacing: "0.06em", whiteSpace: "nowrap" },
  genInfo: { flex: 1, minWidth: 0 },
  genName: { fontWeight: 700, fontSize: 16, letterSpacing: "0.08em", color: C.textPri, marginBottom: 2 },
  genFlavour: { fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.textDim, letterSpacing: "0.06em", marginBottom: 7 },
  genMeta: { display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 7 },
  metaChip: { background: "#050d1a", border: `1px solid ${C.border}`, borderRadius: 3, padding: "2px 7px", fontSize: 11, color: C.textMid, letterSpacing: "0.05em" },
  progTrack: { height: 5, background: "#050d1a", borderRadius: 3, overflow: "hidden", position: "relative" },
  progFill: { position: "absolute", left: 0, top: 0, height: "100%", background: `linear-gradient(90deg,${C.cyanDim},${C.cyan})`, transition: "width .05s linear", boxShadow: `0 0 6px ${C.cyan}` },
  progPct: { position: "absolute", right: 4, top: -1, fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: C.textDim },
  buyGenBtn: { flexShrink: 0, padding: "9px 14px", borderRadius: 4, border: "none", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", textAlign: "center", transition: "all .15s", minWidth: 92 },
  buyGenOn: { background: "linear-gradient(135deg,#004a38,#007a60)", color: C.cyan, boxShadow: "0 0 10px rgba(0,255,180,.15)" },
  buyGenOff: { background: "#040c18", color: C.textDim, cursor: "not-allowed" },
  buyGenTop: { display: "block", fontWeight: 700, fontSize: 13, letterSpacing: "0.05em" },
  buyGenCost: { display: "block", fontFamily: "'Share Tech Mono',monospace", fontSize: 11, marginTop: 3 },
  floater: { position: "absolute", top: "15%", left: "44%", fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: 15, color: C.cyan, textShadow: `0 0 10px ${C.cyan}`, animation: "floatUp 1.3s ease-out forwards", pointerEvents: "none", zIndex: 20, whiteSpace: "nowrap" },

  // Conversions
  convHeader: { marginBottom: 12 },
  convHeaderTitle: { fontWeight: 700, fontSize: 18, letterSpacing: "0.15em", color: C.textPri },
  convHeaderSub: { fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: C.textDim, display: "block", marginTop: 3 },
  chainFlow: { display: "flex", alignItems: "center", gap: 0, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 14px", marginBottom: 12, flexWrap: "wrap", gap: 4 },
  chainStep: { display: "flex", alignItems: "center", gap: 4 },
  chainRes: { fontFamily: "'Share Tech Mono',monospace", fontSize: 12, color: C.textMid },
  chainArrow: { color: C.cyanDim, fontSize: 14, margin: "0 4px" },
  convList: { display: "flex", flexDirection: "column", gap: 10 },
  convCard: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, position: "relative", overflow: "hidden" },
  convInner: { display: "flex", alignItems: "center", gap: 14, padding: "13px 15px", position: "relative", zIndex: 1 },
  convIconWrap: { width: 54, height: 54, background: "#070f1c", border: `2px solid ${C.border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  convIcon: { fontSize: 26 },
  convInfo: { flex: 1, minWidth: 0 },
  convName: { fontWeight: 700, fontSize: 15, letterSpacing: "0.08em", color: C.textPri, marginBottom: 2 },
  convFlavour: { fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.textDim, marginBottom: 6 },
  convRecipe: { display: "flex", alignItems: "center", fontSize: 13, fontWeight: 600, marginBottom: 6, flexWrap: "wrap" },
  convControls: { flexShrink: 0, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" },
  convBatchRow: { display: "flex", gap: 4 },
  convBatchBtn: { background: "#050d1a", border: `1px solid ${C.border}`, color: C.textDim, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 12, padding: "3px 8px", borderRadius: 3, cursor: "pointer", transition: "all .15s" },
  convBatchBtnOn: { background: C.amberDim, border: `1px solid ${C.amber}`, color: C.amber },
  convRunBtn: { padding: "7px 16px", borderRadius: 4, border: "none", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", cursor: "pointer", transition: "all .15s", minWidth: 110, textAlign: "center" },
  convRunBtnOn: { background: "linear-gradient(135deg,#5a3200,#9a5600)", color: C.amber, boxShadow: "0 0 10px rgba(255,180,0,.15)" },
  convRunBtnOff: { background: "#040c18", color: C.textDim, cursor: "not-allowed" },

  // Upgrades
  upGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 8 },
  upCard: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 5, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "all .15s", textAlign: "left", fontFamily: "'Rajdhani',sans-serif", color: C.textPri },
  upAfford: { border: `1px solid ${C.cyan}`, background: "#060e1c", boxShadow: "0 0 12px rgba(0,255,220,.08)" },
  upOwned: { opacity: 0.45, cursor: "not-allowed" },
  upName: { fontWeight: 700, fontSize: 14, letterSpacing: "0.05em", marginBottom: 2 },
  upDesc: { fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: C.textDim, letterSpacing: "0.04em" },
  upCost: { fontFamily: "'Share Tech Mono',monospace", fontSize: 14, color: C.cyan },
  upOwnedBadge: { fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: C.green, letterSpacing: "0.06em" },

  // Prestige
  prestigePanel: { maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 },
  prestigeHero: { textAlign: "center", padding: "24px 0 8px" },
  prestigeHeroGlyph: { fontSize: 48, color: C.gold, textShadow: `0 0 30px ${C.gold}`, display: "block", marginBottom: 10 },
  prestigeHeroTitle: { fontWeight: 700, fontSize: 26, letterSpacing: "0.3em", color: C.gold, textShadow: `0 0 16px rgba(255,210,80,.4)` },
  prestigeHeroSub: { fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: C.textDim, marginTop: 8, lineHeight: 1.7, letterSpacing: "0.05em" },
  prestigeCards: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 },
  prestigeCard: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, padding: "14px 16px" },
  pcTitle: { fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.textDim, letterSpacing: "0.15em", marginBottom: 10 },
  pcRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  pcLabel: { fontSize: 13, color: C.textMid },
  pcVal: { fontFamily: "'Share Tech Mono',monospace", fontSize: 14, color: C.cyan },
  pcRule: { fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: C.textMid, marginBottom: 6, lineHeight: 1.5 },
  prestigeProgress: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, padding: "14px 16px" },
  ppLabel: { display: "flex", justifyContent: "space-between", fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: C.textDim, letterSpacing: "0.08em", marginBottom: 8 },
  ppTrack: { height: 8, background: "#050d1a", borderRadius: 4, overflow: "hidden" },
  ppFill: { height: "100%", background: `linear-gradient(90deg,${C.amberDim},${C.gold})`, transition: "width .3s ease", boxShadow: `0 0 8px ${C.gold}` },
  prestigeBtn: { padding: "14px 24px", borderRadius: 6, border: "none", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.15em", cursor: "pointer", transition: "all .2s", textAlign: "center" },
  prestigeBtnReady: { background: "linear-gradient(135deg,#4a3000,#8a6000)", color: C.gold, boxShadow: `0 0 20px rgba(255,210,80,.25)`, animation: "glowGold 2s infinite" },
  prestigeBtnDisabled: { background: "#040c18", color: C.textDim, cursor: "not-allowed" },
};

// Modal styles
const MS = {
  backdrop: { position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { background: "#08111f", border: `1px solid ${C.gold}`, borderRadius: 10, padding: "32px 36px", maxWidth: 420, width: "90%", boxShadow: `0 0 60px rgba(255,210,80,.2)`, textAlign: "center" },
  modalGlyph: { fontSize: 40, color: C.gold, textShadow: `0 0 24px ${C.gold}`, marginBottom: 10 },
  modalTitle: { fontWeight: 700, fontSize: 22, letterSpacing: "0.3em", color: C.gold, marginBottom: 4 },
  modalSub: { fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: C.textDim, letterSpacing: "0.08em", marginBottom: 20 },
  modalDivider: { height: 1, background: C.border, margin: "16px 0" },
  modalBody: { textAlign: "left" },
  modalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  modalLabel: { fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: C.textDim, letterSpacing: "0.1em" },
  modalVal: { fontFamily: "'Share Tech Mono',monospace", fontSize: 14, color: C.cyan, fontWeight: 700 },
  modalWarning: { fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#ff6a40", letterSpacing: "0.08em", marginBottom: 20, lineHeight: 1.6 },
  modalBtns: { display: "flex", gap: 10, justifyContent: "center" },
  btnCancel: { padding: "10px 24px", borderRadius: 5, border: `1px solid ${C.border}`, background: "#040c18", color: C.textDim, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", cursor: "pointer" },
  btnConfirm: { padding: "10px 28px", borderRadius: 5, border: `1px solid ${C.gold}`, background: "linear-gradient(135deg,#4a3000,#8a6000)", color: C.gold, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.12em", cursor: "pointer", boxShadow: `0 0 14px rgba(255,210,80,.2)` },
};

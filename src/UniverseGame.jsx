import { useState, useEffect, useCallback, useRef } from "react";

import { ELEMENTS, MAX_OFFLINE_SECS } from "./data/elements";
import { UPGRADES } from "./data/upgrades";
import { CIV_TIERS, CIV_UNLOCK_MINDS } from "./data/civilisation";
import { RELIC_UPGRADES } from "./data/relicUpgrades";

import { fmt, fmtTime } from "./utils/format";
import { saveGame, loadGame, exportSaveFile, parseSaveFile } from "./utils/save";

import { calcStats, prestigeMultiplier, calcEchoesFromRun, calcScienceBonuses } from "./game/stats";
import { converterCost, maxConverters, civConverterCost, civMaxConverters } from "./game/converters";
import { SCI_UNLOCK_RELICS, SCI_UNLOCK_VISIBLE_RELICS, SCI_TIERS, INNOVATION_UPGRADES, BREAKTHROUGH_UPGRADES, allScienceDiscoveries } from "./data/science";
import { applyTick } from "./game/tick";
import { buildInitState } from "./game/state";

import { useAutopilot } from "./hooks/useAutopilot";

import GameTab          from "./components/GameTab";
import UpgradesTab      from "./components/UpgradesTab";
import PrestigeTab      from "./components/PrestigeTab";
import CivilisationTab  from "./components/CivilisationTab";
import ScienceTab       from "./components/ScienceTab";
import SettingsTab      from "./components/SettingsTab";
import { SaveModal, LoadModal, DeleteConfirmModal } from "./components/Modals";

// ─── Theme ──────────────────────────────────────────────────────────────────

function buildTheme(darkMode) {
  return darkMode ? {
    bg:        "#080c14",
    bgCard:    "#0a1020",
    border:    "#1a2a40",
    text:      "#eaf4ff",
    textDim:   "#99bbdd",
    textFaint: "#6688bb",
    starfield: "radial-gradient(1px 1px at 15% 25%, #ffffff22 0%, transparent 100%), radial-gradient(1px 1px at 55% 75%, #ffffff15 0%, transparent 100%), radial-gradient(1px 1px at 85% 15%, #ffffff1a 0%, transparent 100%)",
  } : {
    bg:        "#eef2f7",
    bgCard:    "#ffffff",
    border:    "#c8d8e8",
    text:      "#1a2838",
    textDim:   "#3355aa",
    textFaint: "#6688aa",
    starfield: "radial-gradient(1px 1px at 15% 25%, #00000008 0%, transparent 100%)",
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function UniverseGame() {
  const [state, setState] = useState(() => {
    const saved = loadGame();
    if (!saved) return buildInitState();
    const s = { ...buildInitState(), ...saved, lastTick: Date.now() };
    const offlineSecs = Math.min((Date.now() - (saved.lastTick || Date.now())) / 1000, MAX_OFFLINE_SECS);
    if (offlineSecs > 5) {
      const after = applyTick(s, offlineSecs);
      return { ...after, offlineSeconds: offlineSecs, log: [`⏱ Offline ${fmtTime(offlineSecs)} — resources accumulated`, ...after.log.slice(0, 49)] };
    }
    return s;
  });

  const [tab,                 setTab]                 = useState("game");
  const [prevTab,             setPrevTab]             = useState("game");
  const [fontScale,           setFontScale]           = useState(1.2);
  const [darkMode,            setDarkMode]            = useState(true);
  const [showPurchased,       setShowPurchased]       = useState(false);
  const [showPrestigeConfirm, setShowPrestigeConfirm] = useState(false);
  const [saveModal,           setSaveModal]           = useState(null);
  const [showDeleteConfirm,   setShowDeleteConfirm]   = useState(false);
  const [loadStatus,          setLoadStatus]          = useState(null);
  const [showLoadModal,       setShowLoadModal]       = useState(false);
  const [pasteText,           setPasteText]           = useState("");
  const [pasteError,          setPasteError]          = useState("");
  const [simClickRate,        setSimClickRate]        = useState(2);

  const stateRef = useRef(state);
  stateRef.current = state;

  const { autopilot, setAutopilot, autopilotRunning, autopilotResults, autopilotProgress } =
    useAutopilot(simClickRate, UPGRADES);

  // ── Game loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setState(s => applyTick(s, (Date.now() - s.lastTick) / 1000)), 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => saveGame(stateRef.current), 5000);
    return () => clearInterval(id);
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  const stats  = calcStats(state.purchasedUpgrades, state.universeOverclockCount || 0);
  const pMult  = prestigeMultiplier(state.totalEchoesEarned || 0);
  const rates  = ELEMENTS.map((_, i) =>
    state.converters[i] * BASE_RATE_FROM_STATS(stats, i, pMult)
  );
  const civEchoStudyLevel  = state.civEchoStudyLevel || 0;
  const civEchoStudyBonus  = 1 + 0.05 * civEchoStudyLevel;
  const civProdBonus       = stats.civProdBonus || 1;
  const civFestival        = stats.civFestival  || false;
  const surgeActive             = Date.now() < (state.cultureSurgeEndsAt || 0);
  const purchasedRelicUpgrades  = state.purchasedRelicUpgrades || [];
  const hasDarkWisdom           = purchasedRelicUpgrades.includes("dark_wisdom");
  const hasRelicResonance       = purchasedRelicUpgrades.includes("relic_resonance");
  const relicCultureMult        = hasRelicResonance ? (1 + 0.02 * (state.relics || 0)) : 1;
  const sciBonus           = calcScienceBonuses(
    state.sciDiscoveries, state.sciPaths, state.paradigmShiftCount,
    state.purchasedInnovations, state.purchasedBreakthroughs
  );
  const sciVisible         = (state.totalRelicsEarned || 0) >= SCI_UNLOCK_VISIBLE_RELICS;
  const prestigePreview    = Math.floor(calcEchoesFromRun(state.totalQuarksEarned) * civEchoStudyBonus * (sciBonus.echoMult || 1) * (1 + (sciBonus.echoBonus || 0)));
  const canPrestige        = prestigePreview > 0;
  const hasAffordableUpgrade = UPGRADES.some(up =>
    !state.purchasedUpgrades.includes(up.id) &&
    state.amounts[0] >= up.cost[0] &&
    state.echoes >= up.cost[1]
  );
  const theme = buildTheme(darkMode);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const dismissDiscovery = useCallback(() => {
    setState(s => ({ ...s, pendingDiscovery: null }));
  }, []);

  const dismissEra = useCallback(() => {
    setState(s => ({ ...s, pendingEra: null }));
  }, []);

  const chooseEra = useCallback((eraId, choiceId) => {
    setState(s => ({
      ...s,
      eraChoices: { ...(s.eraChoices || {}), [eraId]: choiceId },
      pendingEraChoice: null,
      pendingEra: null,
    }));
  }, []);

  const handleBuyPolicy = useCallback((pol) => {
    setState(s => {
      if ((s.purchasedPolicies || []).includes(pol.id)) return s;
      if ((s.culture || 0) < pol.cost) return s;
      return {
        ...s,
        culture: s.culture - pol.cost,
        purchasedPolicies: [...(s.purchasedPolicies || []), pol.id],
        log: [`📜 Policy enacted: ${pol.name}`, ...s.log.slice(0, 49)],
      };
    });
  }, []);

  const doDarkAges = useCallback(() => {
    setState(s => {
      const relicUpgrades    = s.purchasedRelicUpgrades || [];
      const count            = (s.darkAgesCount || 0) + 1;
      const hasMemory        = relicUpgrades.includes("ancestral_memory");
      const hasCascade       = relicUpgrades.includes("relic_cascade");
      const hasFoundations   = relicUpgrades.includes("ancient_foundations");
      const hasDarkWisdom    = relicUpgrades.includes("dark_wisdom");
      const keepPolicies     = hasMemory;
      const sb               = calcScienceBonuses(s.sciDiscoveries, s.sciPaths, s.paradigmShiftCount, s.purchasedInnovations, s.purchasedBreakthroughs);
      const sciRelicBonus    = Math.floor(sb.relicBonus || 0);
      const hasDivParadigm   = (s.purchasedInnovations || []).includes("paradigm_dividend");
      const relicGain        = 1 + (hasCascade ? Math.floor((s.darkAgesCount || 0) / 5) : 0) + sciRelicBonus;
      const darkBase         = hasDarkWisdom ? 1.1 : 1.05;
      const startTribes      = hasFoundations ? 100 : 0;
      // Drop quark-only civ upgrades (they don't persist through Dark Ages)
      const keptUpgrades = (s.purchasedUpgrades || []).filter(id => {
        const up = UPGRADES.find(u => u.id === id);
        if (!up || !up.requiresCiv) return true;  // keep non-civ upgrades
        return up.cost[1] > 0;                     // keep only echo-cost civ upgrades
      });
      return {
        ...s,
        civAmounts:        s.civAmounts.map(() => 0),
        civConverters:     s.civConverters.map((_, i) => i === 0 ? startTribes : 0),
        culture:           0,
        totalCultureEver:  0,
        firedEras:         [],
        eraChoices:        {},
        purchasedPolicies: keepPolicies ? (s.purchasedPolicies || []) : [],
        purchasedUpgrades: keptUpgrades,
        pendingEra:        null,
        pendingEraChoice:  null,
        darkAgesCount:     count,
        relics:            (s.relics || 0) + relicGain,
        totalRelicsEarned: (s.totalRelicsEarned || 0) + relicGain,
        log: [`🌑 Dark Ages #${count} — +${relicGain} Relic${relicGain > 1 ? "s" : ""}, ×${Math.pow(darkBase, count).toFixed(2)} culture bonus${keepPolicies ? " (policies kept)" : ""}`, ...s.log.slice(0, 49)],
      };
    });
  }, []);

  const unlockCiv = useCallback(() => {
    setState(s => {
      if (s.civUnlocked || s.totalMindsEver < CIV_UNLOCK_MINDS) return s;
      return { ...s, civUnlocked: true, log: ["🏕 Civilisation unlocked — the first tribe gathers", ...s.log.slice(0, 49)] };
    });
  }, []);

  const buyCivConverter = useCallback((tier) => {
    setState(s => {
      if (!s.civUnlocked) return s;
      const civConverters = [...s.civConverters];
      const civAmounts    = [...s.civAmounts];
      const cap  = civMaxConverters(tier, civConverters);
      if (civConverters[tier] >= cap) return s;
      const cost = civConverterCost(tier, civConverters[tier]);
      if (tier === 0) {
        const amounts = [...s.amounts];
        if (amounts[8] < cost) return s;
        amounts[8] -= cost;
        civConverters[tier] += 1;
        return { ...s, amounts, civConverters, log: [`Recruited ${CIV_TIERS[tier].name} #${civConverters[tier]}`, ...s.log.slice(0, 49)] };
      } else {
        if (civAmounts[tier - 1] < cost) return s;
        civAmounts[tier - 1] -= cost;
        civConverters[tier] += 1;
        return { ...s, civAmounts, civConverters, log: [`Built ${CIV_TIERS[tier].name} #${civConverters[tier]}`, ...s.log.slice(0, 49)] };
      }
    });
  }, []);

  const handleClick = useCallback(() => {
    setState(s => {
      const { clickMult } = calcStats(s.purchasedUpgrades, s.universeOverclockCount || 0);
      const amounts = [...s.amounts];
      amounts[0] += clickMult;
      return { ...s, amounts, totalClicks: s.totalClicks + 1, totalQuarksEarned: (s.totalQuarksEarned || 0) + clickMult };
    });
  }, []);

  const buyConverter = useCallback((tier) => {
    setState(s => {
      const cap     = maxConverters(tier, s.converters, s.totalQuarksEarned);
      if (s.converters[tier] >= cap) return s;
      const cost    = converterCost(tier, s.converters[tier]);
      const payTier = tier === 0 ? 0 : tier - 1;
      if (s.amounts[payTier] < cost) return s;
      const amounts    = [...s.amounts];    amounts[payTier]   -= cost;
      const converters = [...s.converters]; converters[tier]   += 1;
      return { ...s, amounts, converters, log: [`Bought ${ELEMENTS[tier].name} Converter #${converters[tier]}`, ...s.log.slice(0, 49)] };
    });
  }, []);

  const buyUpgrade = useCallback((upId) => {
    setState(s => {
      if (s.purchasedUpgrades.includes(upId)) return s;
      const up = UPGRADES.find(u => u.id === upId);
      if (!up) return s;
      const [costQ, costE] = up.cost;
      if (s.amounts[0] < costQ || s.echoes < costE) return s;
      const amounts = [...s.amounts]; amounts[0] -= costQ;
      return { ...s, amounts, echoes: s.echoes - costE,
        purchasedUpgrades: [...s.purchasedUpgrades, upId],
        log: [`Unlocked: ${up.name}`, ...s.log.slice(0, 49)] };
    });
  }, []);

  const buyUniverseOverclock = useCallback(() => {
    setState(s => {
      const count = s.universeOverclockCount || 0;
      const cost  = Math.ceil(50 * Math.pow(3, count));
      if ((s.echoes || 0) < cost) return s;
      return { ...s, echoes: s.echoes - cost, universeOverclockCount: count + 1,
        log: [`Universe Overclock #${count + 1} — all production +10%`, ...s.log.slice(0, 49)] };
    });
  }, []);

  const buyCivStudy = useCallback(() => {
    setState(s => {
      const level = s.civEchoStudyLevel || 0;
      const cost  = Math.floor(10000 * Math.pow(4, level));
      if ((s.culture || 0) < cost) return s;
      return {
        ...s,
        culture: s.culture - cost,
        civEchoStudyLevel: level + 1,
        log: [`📚 Ancestral Codex Lv.${level + 1} — Echo yield +${(level + 1) * 5}%`, ...s.log.slice(0, 49)],
      };
    });
  }, []);

  const activateCultureSurge = useCallback(() => {
    setState(s => {
      const now = Date.now();
      const cooldownMs = 24 * 60 * 60 * 1000;
      if (now < (s.cultureSurgeEndsAt || 0)) return s;
      if (now - (s.cultureSurgeLastUsedAt || 0) < cooldownMs) return s;
      return {
        ...s,
        cultureSurgeEndsAt:     now + 60000,
        cultureSurgeLastUsedAt: now,
        log: [`🎭 Cultural Festival — ×10 culture for 60 seconds!`, ...s.log.slice(0, 49)],
      };
    });
  }, []);

  const buyRelicUpgrade = useCallback((upId) => {
    setState(s => {
      const up = RELIC_UPGRADES.find(u => u.id === upId);
      if (!up) return s;
      if ((s.purchasedRelicUpgrades || []).includes(upId)) return s;
      if ((s.relics || 0) < up.cost) return s;
      if (up.echoCost && (s.echoes || 0) < up.echoCost) return s;
      return {
        ...s,
        relics:                 (s.relics || 0) - up.cost,
        echoes:                 (s.echoes || 0) - (up.echoCost || 0),
        purchasedRelicUpgrades: [...(s.purchasedRelicUpgrades || []), upId],
        log: [`🏺 ${up.name} — ${up.desc}`, ...s.log.slice(0, 49)],
      };
    });
  }, []);

  // ── Science handlers ─────────────────────────────────────────────────────────

  const unlockScience = useCallback(() => {
    setState(s => {
      if (s.sciUnlocked || (s.relics || 0) < SCI_UNLOCK_RELICS) return s;
      return {
        ...s,
        sciUnlocked: true,
        relics: (s.relics || 0) - SCI_UNLOCK_RELICS,
        log: [`⚗ Science unlocked — the Renaissance begins`, ...s.log.slice(0, 49)],
      };
    });
  }, []);

  const buySciConverter = useCallback((tier) => {
    setState(s => {
      if (!s.sciUnlocked) return s;
      const sciConverters = [...(s.sciConverters || Array(7).fill(0))];
      const sciAmounts    = [...(s.sciAmounts    || Array(7).fill(0))];
      const cap        = tier === 0 ? Infinity : sciConverters[tier - 1];
      if (sciConverters[tier] >= cap) return s;
      // Matches sciConverterCost() in science.js
      const actualCost = tier === 0
        ? Math.floor(50 * Math.pow(1.2, sciConverters[0]))
        : Math.floor(100 * Math.pow(2, tier - 1) * Math.pow(1.15, sciConverters[tier]));
      if (tier === 0) {
        if ((s.culture || 0) < actualCost) return s;
        sciConverters[0] += 1;
        return { ...s, culture: (s.culture || 0) - actualCost, sciConverters,
          log: [`📜 Recruited Scholar #${sciConverters[0]}`, ...s.log.slice(0, 49)] };
      } else {
        if ((sciAmounts[tier - 1] || 0) < actualCost) return s;
        sciAmounts[tier - 1] -= actualCost;
        sciConverters[tier]  += 1;
        return { ...s, sciAmounts, sciConverters,
          log: [`${SCI_TIERS[tier].emoji} Built ${SCI_TIERS[tier].name} #${sciConverters[tier]}`, ...s.log.slice(0, 49)] };
      }
    });
  }, []);

  const purchaseDiscovery = useCallback((discId) => {
    setState(s => {
      if (!s.sciUnlocked) return s;
      if ((s.sciDiscoveries || []).includes(discId)) return s;
      const disc = allScienceDiscoveries().find(d => d.id === discId);
      if (!disc) return s;
      const depsOk = (disc.deps || []).every(d => (s.sciDiscoveries || []).includes(d));
      if (!depsOk) return s;
      const sb = calcScienceBonuses(s.sciDiscoveries, s.sciPaths, s.paradigmShiftCount, s.purchasedInnovations, s.purchasedBreakthroughs);
      const cost = Math.floor(disc.cost * sb.discoveryCostMult);
      if ((s.science || 0) < cost) return s;
      return {
        ...s,
        science:        (s.science || 0) - cost,
        sciDiscoveries: [...(s.sciDiscoveries || []), discId],
        log: [`🔭 Discovered: ${disc.name}`, ...s.log.slice(0, 49)],
      };
    });
  }, []);

  const chooseSciPath = useCallback((eraId, pathId) => {
    setState(s => {
      if ((s.sciPaths || {})[eraId]) return s;
      return {
        ...s,
        sciPaths: { ...(s.sciPaths || {}), [eraId]: pathId },
        log: [`🧭 Research direction set: ${pathId}`, ...s.log.slice(0, 49)],
      };
    });
  }, []);

  const doParadigmShift = useCallback(() => {
    setState(s => {
      const sb = calcScienceBonuses(s.sciDiscoveries, s.sciPaths, s.paradigmShiftCount, s.purchasedInnovations, s.purchasedBreakthroughs);
      if (!sb.paradigmReady) return s;
      const btsEarned    = Math.max(1, Math.floor(Math.log2(Math.max(2, (s.totalScienceEver || 0) / 500000)) * sb.breakthroughMult));
      const hasParadigmDiv = (s.purchasedInnovations || []).includes("paradigm_dividend");
      const innoEarned   = 1 + (hasParadigmDiv ? 1 : 0);
      // Keep one retained path if innovation purchased
      const retainedPaths = {};
      if ((s.purchasedInnovations || []).includes("retained_research")) {
        const firstPath = Object.entries(s.sciPaths || {})[0];
        if (firstPath) retainedPaths[firstPath[0]] = firstPath[1];
      }
      return {
        ...s,
        sciConverters:           Array(7).fill(0),
        sciAmounts:              Array(7).fill(0),
        science:                 0,
        totalScienceEver:        0,
        sciEra:                  0,
        sciPaths:                retainedPaths,
        sciDiscoveries:          [],
        sciWildcards:            {},
        paradigmShiftCount:      (s.paradigmShiftCount || 0) + 1,
        breakthroughs:           (s.breakthroughs || 0) + btsEarned,
        totalBreakthroughsEarned:(s.totalBreakthroughsEarned || 0) + btsEarned,
        innovations:             (s.innovations || 0) + innoEarned,
        totalInnovationsEarned:  (s.totalInnovationsEarned || 0) + innoEarned,
        log: [`🔄 Paradigm Shift #${(s.paradigmShiftCount || 0) + 1} — +${btsEarned} Breakthroughs, +${innoEarned} Innovations`, ...s.log.slice(0, 49)],
      };
    });
  }, []);

  const buyInnovation = useCallback((upId) => {
    setState(s => {
      const up = INNOVATION_UPGRADES.find(u => u.id === upId);
      if (!up) return s;
      if ((s.purchasedInnovations || []).includes(upId)) return s;
      if ((s.innovations || 0) < up.cost) return s;
      return {
        ...s,
        innovations:          (s.innovations || 0) - up.cost,
        purchasedInnovations: [...(s.purchasedInnovations || []), upId],
        log: [`💡 Innovation: ${up.name}`, ...s.log.slice(0, 49)],
      };
    });
  }, []);

  const buyBreakthrough = useCallback((upId) => {
    setState(s => {
      const up = BREAKTHROUGH_UPGRADES.find(u => u.id === upId);
      if (!up) return s;
      if ((s.purchasedBreakthroughs || []).includes(upId)) return s;
      if ((s.breakthroughs || 0) < up.cost) return s;
      return {
        ...s,
        breakthroughs:          (s.breakthroughs || 0) - up.cost,
        purchasedBreakthroughs: [...(s.purchasedBreakthroughs || []), upId],
        log: [`🌟 Breakthrough: ${up.name}`, ...s.log.slice(0, 49)],
      };
    });
  }, []);

  const doPrestige = useCallback(() => {
    setState(s => {
      const studyBonus = 1 + 0.05 * (s.civEchoStudyLevel || 0);
      const sb         = calcScienceBonuses(s.sciDiscoveries, s.sciPaths, s.paradigmShiftCount, s.purchasedInnovations, s.purchasedBreakthroughs);
      const gained     = Math.floor(calcEchoesFromRun(s.totalQuarksEarned) * studyBonus * (sb.echoMult || 1) * (1 + (sb.echoBonus || 0)));
      const keptUpgrades = s.purchasedUpgrades.filter(id => {
        const up = UPGRADES.find(u => u.id === id);
        return up && up.cost[1] > 0;
      });
      return {
        ...buildInitState(),
        echoes:                 s.echoes + gained,
        totalEchoesEarned:      (s.totalEchoesEarned || 0) + gained,
        prestigeCount:          s.prestigeCount + 1,
        purchasedUpgrades:      keptUpgrades,
        universeOverclockCount: 0,
        lastTick:               Date.now(),
        log:                    [`✨ Prestige #${s.prestigeCount + 1} — gained ${gained} Echoes`, ...s.log.slice(0, 20)],
        civUnlocked:            s.civUnlocked,
        totalCultureEver:       s.totalCultureEver || 0,
        firedEras:              s.firedEras || [],
        eraChoices:             s.eraChoices || {},
        purchasedPolicies:      s.purchasedPolicies || [],
        darkAgesCount:          s.darkAgesCount || 0,
        civEchoStudyLevel:       s.civEchoStudyLevel || 0,
        cultureSurgeLastUsedAt:  s.cultureSurgeLastUsedAt || 0,
        relics:                  s.relics || 0,
        totalRelicsEarned:       s.totalRelicsEarned || 0,
        purchasedRelicUpgrades:  s.purchasedRelicUpgrades || [],
        // Science persists through prestige
        sciUnlocked:             s.sciUnlocked || false,
        sciConverters:           s.sciConverters || Array(7).fill(0),
        sciAmounts:              s.sciAmounts    || Array(7).fill(0),
        science:                 s.science       || 0,
        totalScienceEver:        s.totalScienceEver || 0,
        sciEra:                  s.sciEra        || 0,
        sciPaths:                s.sciPaths      || {},
        sciDiscoveries:          s.sciDiscoveries || [],
        sciWildcards:            s.sciWildcards  || {},
        paradigmShiftCount:      s.paradigmShiftCount || 0,
        breakthroughs:           s.breakthroughs || 0,
        totalBreakthroughsEarned:s.totalBreakthroughsEarned || 0,
        innovations:             s.innovations   || 0,
        totalInnovationsEarned:  s.totalInnovationsEarned || 0,
        purchasedInnovations:    s.purchasedInnovations || [],
        purchasedBreakthroughs:  s.purchasedBreakthroughs || [],
      };
    });
    setShowPrestigeConfirm(false);
    setTab("game");
  }, []);

  const handleExportSave = useCallback(() => {
    try {
      const text = exportSaveFile(stateRef.current);
      if (!text) throw new Error("Export produced empty result");
      setSaveModal(text);
    } catch (err) {
      setLoadStatus({ ok: false, msg: `Save failed: ${err.message}` });
    }
  }, []);

  const handleDeleteSave = useCallback(() => {
    try { localStorage.removeItem("cosmo_universe_save"); } catch {}
    setState(buildInitState());
    setShowDeleteConfirm(false);
    setTab("game");
  }, []);

  const applyParsed = useCallback((parsed) => {
    const s = { ...buildInitState(), ...parsed, lastTick: Date.now(), offlineSeconds: 0 };
    const offlineSecs = Math.min((Date.now() - (parsed.lastTick || Date.now())) / 1000, MAX_OFFLINE_SECS);
    if (offlineSecs > 5) {
      const after = applyTick(s, offlineSecs);
      setState({ ...after, offlineSeconds: offlineSecs, log: [`⏱ Offline ${fmtTime(offlineSecs)} — resources accumulated`, ...after.log.slice(0, 49)] });
    } else {
      setState(s);
    }
    saveGame(s);
  }, []);

  const handleImportSave = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseSaveFile(ev.target?.result);
        applyParsed(parsed);
        setLoadStatus({ ok: true, msg: "Save loaded successfully" });
      } catch (err) {
        setLoadStatus({ ok: false, msg: `Load failed: ${err.message}` });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [applyParsed]);

  const handlePasteLoad = useCallback(() => {
    try {
      const parsed = parseSaveFile(pasteText);
      applyParsed(parsed);
      setShowLoadModal(false);
      setPasteText("");
      setPasteError("");
      setLoadStatus({ ok: true, msg: "Save loaded successfully" });
    } catch (err) {
      setPasteError(`Invalid save: ${err.message}`);
    }
  }, [pasteText, applyParsed]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: theme.bg, color: theme.text,
      fontFamily: "'Courier New', monospace", fontSize: `${fontScale}em`,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "16px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: theme.starfield }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "820px" }}>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "14px", position: "relative" }}>
          <button
            onClick={() => { if (tab === "settings") { setTab(prevTab); } else { setPrevTab(tab); setTab("settings"); } }}
            style={{
              position: "absolute", top: 0, right: 0,
              background: tab === "settings" ? "#1a1a2e" : "transparent",
              border: "1px solid " + (tab === "settings" ? "#c77dff" : "#1a2a40"),
              borderRadius: "5px", color: tab === "settings" ? "#c77dff" : "#4466aa",
              padding: "5px 10px", cursor: "pointer", fontSize: "0.7rem",
              fontFamily: "'Courier New', monospace",
            }}>⚙</button>
          <h1 style={{
            fontSize: "1.9rem", fontWeight: "bold", letterSpacing: "0.3em", textTransform: "uppercase",
            background: "linear-gradient(90deg, #4d96ff, #c77dff, #ff6b6b)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0,
          }}>COSMOGENESIS</h1>
          <div style={{
            fontSize: "0.55rem", letterSpacing: "0.28em", fontWeight: "bold", marginTop: "3px",
            background: "linear-gradient(90deg, #4d96ff, #c77dff)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>— PRIMORDIUM —</div>
          {state.echoes > 0 && (
            <div style={{ fontSize: "0.52rem", color: "#c77dff88", marginTop: "2px", letterSpacing: "0.12em" }}>
              ✨ {state.echoes} ECHOES · ×{pMult.toFixed(2)} PRODUCTION
            </div>
          )}
        </div>

        {/* Offline notice */}
        {state.offlineSeconds > 5 && (
          <div style={{ background: darkMode ? "#0a1a2a" : "#e8f0fa", border: "1px solid #4d96ff55", borderRadius: "6px", padding: "8px 14px", marginBottom: "12px", fontSize: "0.62rem", color: "#4d96ff", textAlign: "center", letterSpacing: "0.1em" }}>
            ⏱ Welcome back. Accumulated resources for {fmtTime(state.offlineSeconds)} while away.
          </div>
        )}

        {/* Nav — two rows: main tabs row + sub-tabs row */}
        <div style={{ marginBottom: "16px" }}>

          {/* Row 1: main tabs, equal-width, full span */}
          <div style={{ display: "flex", gap: "3px" }}>
            {/* UNIVERSE */}
            <button onClick={() => setTab("game")} style={{
              flex: 1, minWidth: 0, textAlign: "center",
              background: (tab === "game" || tab === "upgrades") ? "#0d1e10" : "#080e0a",
              border: "1px solid " + ((tab === "game" || tab === "upgrades") ? "#6bcb77" : "#1a2a40"),
              borderBottom: (tab === "game" || tab === "upgrades") ? "2px solid #6bcb77" : "1px solid #1a2a40",
              color: (tab === "game" || tab === "upgrades") ? "#6bcb77" : "#2a4a30",
              borderRadius: "6px 6px 0 0", padding: "8px 6px", cursor: "pointer",
              fontSize: "0.62rem", letterSpacing: "0.1em",
              fontWeight: (tab === "game" || tab === "upgrades") ? "bold" : "normal",
              transition: "all 0.15s", fontFamily: "'Courier New', monospace",
            }}>⚛ UNIVERSE</button>

            {/* CIVILISATION (unlocked) */}
            {state.civUnlocked && (
              <button onClick={() => setTab("civ")} style={{
                flex: 1, minWidth: 0, textAlign: "center",
                background: (tab === "civ" || tab === "civpolicies") ? "#1a1208" : "#100e06",
                border: "1px solid " + ((tab === "civ" || tab === "civpolicies") ? "#c4a35a" : "#2a2010"),
                borderBottom: (tab === "civ" || tab === "civpolicies") ? "2px solid #c4a35a" : "1px solid #2a2010",
                color: (tab === "civ" || tab === "civpolicies") ? "#c4a35a" : "#5a4a20",
                borderRadius: "6px 6px 0 0", padding: "8px 6px", cursor: "pointer",
                fontSize: "0.62rem", letterSpacing: "0.1em",
                fontWeight: (tab === "civ" || tab === "civpolicies") ? "bold" : "normal",
                transition: "all 0.15s", fontFamily: "'Courier New', monospace",
              }}>🏕 CIV</button>
            )}

            {/* CIVILISATION unlock button */}
            {!state.civUnlocked && state.totalMindsEver >= CIV_UNLOCK_MINDS * 0.5 && (
              <button onClick={unlockCiv} disabled={state.totalMindsEver < CIV_UNLOCK_MINDS} style={{
                flex: 1, minWidth: 0, textAlign: "center",
                background: state.totalMindsEver >= CIV_UNLOCK_MINDS ? "#1a1208" : "#0a0a06",
                border: "1px solid " + (state.totalMindsEver >= CIV_UNLOCK_MINDS ? "#c4a35a88" : "#2a2010"),
                borderRadius: "6px 6px 0 0", padding: "8px 6px",
                cursor: state.totalMindsEver >= CIV_UNLOCK_MINDS ? "pointer" : "not-allowed",
                fontSize: "0.52rem", letterSpacing: "0.06em",
                color: state.totalMindsEver >= CIV_UNLOCK_MINDS ? "#c4a35a" : "#3a3010",
                fontFamily: "'Courier New', monospace",
              }}>
                {state.totalMindsEver >= CIV_UNLOCK_MINDS ? "🏕 UNLOCK CIV" : `🏕 CIV (${fmt(state.totalMindsEver)}/${fmt(CIV_UNLOCK_MINDS)})`}
              </button>
            )}

            {/* SCIENCE (unlocked) */}
            {sciVisible && state.sciUnlocked && (
              <button onClick={() => setTab("science")} style={{
                flex: 1, minWidth: 0, textAlign: "center",
                background: (tab === "science" || tab === "research") ? "#050a18" : "#030610",
                border: "1px solid " + ((tab === "science" || tab === "research") ? "#4d96ff" : "#1a2a40"),
                borderBottom: (tab === "science" || tab === "research") ? "2px solid #4d96ff" : "1px solid #1a2a40",
                color: (tab === "science" || tab === "research") ? "#4d96ff" : "#1a3050",
                borderRadius: "6px 6px 0 0", padding: "8px 6px", cursor: "pointer",
                fontSize: "0.62rem", letterSpacing: "0.1em",
                fontWeight: (tab === "science" || tab === "research") ? "bold" : "normal",
                transition: "all 0.15s", fontFamily: "'Courier New', monospace",
              }}>⚗ SCIENCE</button>
            )}

            {/* SCIENCE unlock button */}
            {sciVisible && !state.sciUnlocked && (
              <button onClick={unlockScience} disabled={(state.relics || 0) < SCI_UNLOCK_RELICS} style={{
                flex: 1, minWidth: 0, textAlign: "center",
                background: (state.relics || 0) >= SCI_UNLOCK_RELICS ? "#050a18" : "#020408",
                border: "1px solid " + ((state.relics || 0) >= SCI_UNLOCK_RELICS ? "#4d96ff88" : "#1a2a40"),
                borderRadius: "6px 6px 0 0", padding: "8px 6px",
                cursor: (state.relics || 0) >= SCI_UNLOCK_RELICS ? "pointer" : "not-allowed",
                fontSize: "0.52rem", letterSpacing: "0.06em",
                color: (state.relics || 0) >= SCI_UNLOCK_RELICS ? "#4d96ff" : "#1a3050",
                fontFamily: "'Courier New', monospace",
              }}>
                {(state.relics || 0) >= SCI_UNLOCK_RELICS
                  ? `⚗ UNLOCK SCI (${SCI_UNLOCK_RELICS}🏺)`
                  : `⚗ SCI (${state.relics || 0}/${SCI_UNLOCK_RELICS}🏺)`}
              </button>
            )}

            {/* PRESTIGE */}
            <button onClick={() => setTab("prestige")} style={{
              flex: 1, minWidth: 0, textAlign: "center",
              background: tab === "prestige" ? "#1a1a2e" : "#0d0d1e",
              border: "1px solid " + (tab === "prestige" ? "#c77dff" : "#4a3a6a"),
              borderBottom: tab === "prestige" ? "2px solid #c77dff" : "1px solid #4a3a6a",
              color: tab === "prestige" ? "#c77dff" : "#7a5aaa",
              borderRadius: "6px 6px 0 0", padding: "8px 6px", cursor: "pointer",
              fontSize: "0.62rem", letterSpacing: "0.1em",
              fontWeight: tab === "prestige" ? "bold" : "normal",
              transition: "all 0.15s", fontFamily: "'Courier New', monospace",
            }}>{`PRESTIGE${canPrestige ? " ★" : ""}`}</button>
          </div>

          {/* Row 2: sub-tabs, left-aligned, shown for unlocked systems */}
          <div style={{ display: "flex", gap: "3px", marginTop: "2px" }}>
            <button onClick={() => setTab("upgrades")} style={{
              textAlign: "center",
              background: tab === "upgrades" ? "#1a1a2e" : "#0a0a18",
              border: "1px solid " + (tab === "upgrades" ? "#c77dff" : "#4a3a6a"),
              color: tab === "upgrades" ? "#c77dff" : "#7a5aaa",
              borderRadius: "0 0 6px 6px", padding: "3px 14px", cursor: "pointer",
              fontSize: "0.48rem", letterSpacing: "0.12em",
              fontWeight: tab === "upgrades" ? "bold" : "normal",
              transition: "all 0.15s", fontFamily: "'Courier New', monospace",
            }}>
              UPGRADES
              {hasAffordableUpgrade && <span style={{ marginLeft: "4px", display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: "#e8c44a", verticalAlign: "middle", boxShadow: "0 0 4px #e8c44a" }} />}
            </button>

            {state.civUnlocked && (
              <button onClick={() => setTab("civpolicies")} style={{
                textAlign: "center",
                background: tab === "civpolicies" ? "#1a1208" : "#0e0b04",
                border: "1px solid " + (tab === "civpolicies" ? "#c4a35a" : "#3a2a10"),
                color: tab === "civpolicies" ? "#c4a35a" : "#7a5a20",
                borderRadius: "0 0 6px 6px", padding: "3px 14px", cursor: "pointer",
                fontSize: "0.48rem", letterSpacing: "0.12em",
                fontWeight: tab === "civpolicies" ? "bold" : "normal",
                transition: "all 0.15s", fontFamily: "'Courier New', monospace",
              }}>POLICIES</button>
            )}

            {sciVisible && state.sciUnlocked && (
              <button onClick={() => setTab("research")} style={{
                textAlign: "center",
                background: tab === "research" ? "#050a18" : "#020408",
                border: "1px solid " + (tab === "research" ? "#4d96ff" : "#1a2a3a"),
                color: tab === "research" ? "#4d96ff" : "#2a4a6a",
                borderRadius: "0 0 6px 6px", padding: "3px 14px", cursor: "pointer",
                fontSize: "0.48rem", letterSpacing: "0.12em",
                fontWeight: tab === "research" ? "bold" : "normal",
                transition: "all 0.15s", fontFamily: "'Courier New', monospace",
              }}>RESEARCH</button>
            )}
          </div>

        </div>

        {/* Tab content */}
        {tab === "game" && (
          <GameTab
            state={state} stats={stats} rates={rates} theme={theme}
            handleClick={handleClick} buyConverter={buyConverter}
            dismissDiscovery={dismissDiscovery}
          />
        )}
        {tab === "upgrades" && (
          <UpgradesTab
            state={state} stats={stats} theme={theme}
            showPurchased={showPurchased} setShowPurchased={setShowPurchased}
            buyUpgrade={buyUpgrade} buyUniverseOverclock={buyUniverseOverclock}
          />
        )}
        {tab === "prestige" && (
          <PrestigeTab
            state={state} pMult={pMult} prestigePreview={prestigePreview}
            canPrestige={canPrestige} theme={theme} doPrestige={doPrestige}
            showPrestigeConfirm={showPrestigeConfirm} setShowPrestigeConfirm={setShowPrestigeConfirm}
          />
        )}
        {(tab === "civ" || tab === "civpolicies") && (
          <CivilisationTab
            state={state} theme={theme}
            buyCivConverter={buyCivConverter} dismissEra={dismissEra}
            chooseEra={chooseEra} handleBuyPolicy={handleBuyPolicy}
            doDarkAges={doDarkAges} buyCivStudy={buyCivStudy}
            civEchoStudyLevel={civEchoStudyLevel} civEchoStudyBonus={civEchoStudyBonus}
            civProdBonus={civProdBonus} civFestival={civFestival}
            surgeActive={surgeActive} activateCultureSurge={activateCultureSurge}
            relicCultureMult={relicCultureMult} hasDarkWisdom={hasDarkWisdom}
            buyRelicUpgrade={buyRelicUpgrade}
            view={tab === "civpolicies" ? "civpolicies" : "civ"}
          />
        )}
        {(tab === "science" || tab === "research") && (
          <ScienceTab
            state={state} theme={theme}
            view={tab === "research" ? "research" : "science"}
            buySciConverter={buySciConverter}
            purchaseDiscovery={purchaseDiscovery}
            chooseSciPath={chooseSciPath}
            doParadigmShift={doParadigmShift}
            buyInnovation={buyInnovation}
            buyBreakthrough={buyBreakthrough}
          />
        )}
        {tab === "settings" && (
          <SettingsTab
            theme={theme} darkMode={darkMode} setDarkMode={setDarkMode}
            fontScale={fontScale} setFontScale={setFontScale}
            autopilot={autopilot} setAutopilot={setAutopilot}
            autopilotRunning={autopilotRunning} autopilotResults={autopilotResults}
            autopilotProgress={autopilotProgress}
            simClickRate={simClickRate} setSimClickRate={setSimClickRate}
            handleExportSave={handleExportSave} loadStatus={loadStatus}
            onShowLoadModal={() => { setShowLoadModal(true); setPasteText(""); setPasteError(""); }}
            onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
          />
        )}

        <div style={{ textAlign: "center", marginTop: "10px", fontSize: "0.5rem", color: theme.textFaint, letterSpacing: "0.18em" }}>
          AUTO-SAVES EVERY 5 SECONDS · OFFLINE PROGRESS UP TO 4 HOURS
        </div>
      </div>

      {/* Modals */}
      <SaveModal saveModal={saveModal} setSaveModal={setSaveModal} />
      <LoadModal
        show={showLoadModal} theme={theme}
        pasteText={pasteText} setPasteText={setPasteText}
        pasteError={pasteError} setPasteError={setPasteError}
        onPasteLoad={handlePasteLoad}
        onImportFile={handleImportSave}
        onClose={() => setShowLoadModal(false)}
      />
      <DeleteConfirmModal
        show={showDeleteConfirm} theme={theme}
        onConfirm={handleDeleteSave}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <style>{`
        * { box-sizing: border-box; }
        button { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0f1a; }
        ::-webkit-scrollbar-thumb { background: #1a3a5a; border-radius: 2px; }
        @keyframes discoveryPulse {
          0%   { opacity: 0; transform: translateY(-6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Helper: compute per-element rate given pre-calculated stats
function BASE_RATE_FROM_STATS(stats, i, pMult) {
  const { prodMult, globalMult } = stats;
  // BASE_RATE is 0.1 — imported via tick but duplicated here to avoid circular dep
  return 0.1 * prodMult[i] * globalMult * pMult;
}

import { useState, useEffect, useRef } from "react";
import { ELEMENTS, BASE_RATE, ECHO_THRESHOLD } from "../data/elements";
import { CIV_UNLOCK_MINDS } from "../data/civilisation";
import { buildInitState } from "../game/state";
import { calcStats, prestigeMultiplier, calcEchoesFromRun } from "../game/stats";
import { maxConverters, converterCost } from "../game/converters";

function simStep(s, dt) {
  const { prodMult, globalMult } = calcStats(s.purchasedUpgrades, 0);
  const pMult      = prestigeMultiplier(s.totalEchoesEarned || 0);
  const amounts    = [...s.amounts];
  const converters = [...s.converters];

  let quarkProduced = 0;
  for (let i = 0; i < ELEMENTS.length; i++) {
    if (converters[i] > 0) {
      const produced = converters[i] * BASE_RATE * prodMult[i] * globalMult * pMult * dt;
      amounts[i] += produced;
      if (i === 0) quarkProduced += produced;
    }
  }

  const totalMindsEver    = Math.max(s.totalMindsEver || 0, amounts[8]);
  const totalQuarksEarned = (s.totalQuarksEarned || 0) + quarkProduced;
  s = { ...s, amounts, converters, totalMindsEver, totalQuarksEarned };

  // Buy all affordable quark-cost upgrades greedily
  let upgraded = true;
  while (upgraded) {
    upgraded = false;
    for (const up of [...(s.availableUpgrades || [])].sort((a, b) => a.cost[0] - b.cost[0])) {
      if (s.purchasedUpgrades.includes(up.id)) continue;
      const [cq, ce] = up.cost;
      if (ce > 0 || cq === 0) continue;
      if (s.amounts[0] >= cq) {
        const a2 = [...s.amounts];
        a2[0] -= cq;
        s = { ...s, amounts: a2, purchasedUpgrades: [...s.purchasedUpgrades, up.id] };
        upgraded = true;
      }
    }
  }

  // Buy converters greedily
  for (let i = 0; i < ELEMENTS.length; i++) {
    let safety = 0;
    while (safety++ < 200) {
      const cap     = maxConverters(i, s.converters, s.totalQuarksEarned);
      if (s.converters[i] >= cap) break;
      const cost    = converterCost(i, s.converters[i]);
      const payTier = i === 0 ? 0 : i - 1;
      if (s.amounts[payTier] < cost) break;
      const a2 = [...s.amounts];
      const c2 = [...s.converters];
      a2[payTier] -= cost;
      c2[i] += 1;
      s = { ...s, amounts: a2, converters: c2 };
    }
  }

  return s;
}

export function useAutopilot(simClickRate, UPGRADES) {
  const [autopilot,         setAutopilot]         = useState(false);
  const [autopilotResults,  setAutopilotResults]  = useState(null);
  const [autopilotRunning,  setAutopilotRunning]  = useState(false);
  const [autopilotProgress, setAutopilotProgress] = useState(null);
  const autopilotRunId = useRef(0);

  useEffect(() => {
    if (!autopilot) { setAutopilotRunning(false); return; }

    const runId = ++autopilotRunId.current;
    setAutopilotRunning(true);
    setAutopilotResults(null);
    setAutopilotProgress({ phase: "Simulating...", elapsed: 0 });

    let sim = { ...buildInitState(), availableUpgrades: UPGRADES };
    const DT           = 1.0;
    const MAX_SIM_SECS = 60 * 60 * 48;
    let elapsed        = 0;
    const milestones   = {};
    const CHUNK        = 500;

    const runChunk = () => {
      if (runId !== autopilotRunId.current) { setAutopilotRunning(false); return; }

      for (let i = 0; i < CHUNK; i++) {
        elapsed += DT;

        const { clickMult } = calcStats(sim.purchasedUpgrades, 0);
        const clickQuarks   = clickMult * simClickRate * DT;
        const a2 = [...sim.amounts];
        a2[0] += clickQuarks;
        sim = { ...sim, amounts: a2, totalQuarksEarned: (sim.totalQuarksEarned || 0) + clickQuarks };

        sim = simStep(sim, DT);

        if (!milestones.firstPrestige && calcEchoesFromRun(sim.totalQuarksEarned) >= 1) {
          milestones.firstPrestige = elapsed;
        }
        if (!milestones.civVisible && sim.totalMindsEver >= CIV_UNLOCK_MINDS * 0.5) {
          milestones.civVisible = elapsed;
        }
        if (!milestones.civUnlock && sim.totalMindsEver >= CIV_UNLOCK_MINDS) {
          milestones.civUnlock = elapsed;
        }

        if (
          (milestones.firstPrestige && milestones.civVisible && milestones.civUnlock) ||
          elapsed >= MAX_SIM_SECS
        ) {
          setAutopilotResults({
            firstPrestige: milestones.firstPrestige || null,
            civVisible:    milestones.civVisible    || null,
            civUnlock:     milestones.civUnlock     || null,
            simElapsed:    elapsed,
            capped:        elapsed >= MAX_SIM_SECS,
            quarksAtEnd:   sim.totalQuarksEarned,
            mindsAtEnd:    sim.totalMindsEver,
            clickRate:     simClickRate,
          });
          setAutopilotRunning(false);
          setAutopilotProgress(null);
          return;
        }
      }

      setAutopilotProgress({ phase: "Simulating...", elapsed });
      setTimeout(runChunk, 0);
    };

    setTimeout(runChunk, 0);
    return () => { autopilotRunId.current++; setAutopilotRunning(false); };
  }, [autopilot, simClickRate, UPGRADES]);

  return { autopilot, setAutopilot, autopilotRunning, autopilotResults, autopilotProgress };
}

import { Buffer } from "node:buffer";
import fs from "node:fs";
import { performance } from "node:perf_hooks";
import {
  basketballGameFlow,
  basketballProbabilityHistory,
  basketballStepPath,
} from "../utils/sports/basketball/basketballCharts.ts";
import { orderedBasketballEvents } from "../utils/sports/basketball/basketballEvents.ts";

if (!process.argv[2])
  throw new Error("Provide a backend-normalized game response JSON file.");
const file = fs.readFileSync(process.argv[2], "utf8");
const score = JSON.parse(file).score;
if (!Array.isArray(score?.plays))
  throw new Error("Expected a normalized response with score.plays.");
const cases = {
  "full game": score.plays,
  "duplicate delivery": [...score.plays, ...score.plays.slice(-20)],
  "out-of-order delivery": [...score.plays].reverse(),
};
const result = {
  plays: score.plays.length,
  probabilityObservations: score.winProbability?.length ?? 0,
  normalizedPayloadBytes: Buffer.byteLength(file),
  cases: {},
};
for (const [name, plays] of Object.entries(cases)) {
  const samples = [];
  let flow, history, events;
  for (let i = 0; i < 225; i++) {
    const start = performance.now();
    events = orderedBasketballEvents(plays, score.lastPlay);
    flow = basketballGameFlow(plays);
    history = basketballProbabilityHistory(score.winProbability);
    basketballStepPath(
      flow,
      "home",
      (n) => n / 10,
      (n) => 100 - n,
    );
    basketballStepPath(
      history,
      "home",
      (n) => n / 10,
      (n) => 100 - n,
    );
    basketballStepPath(
      history,
      "away",
      (n) => n / 10,
      (n) => 100 - n,
    );
    if (i >= 25) samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  result.cases[name] = {
    uniqueEvents: events.length,
    scoringEvents: flow.length,
    probabilityObservations: history.length,
    medianMs: Number(samples[100].toFixed(3)),
    p95Ms: Number(samples[190].toFixed(3)),
  };
}
console.log(JSON.stringify(result, null, 2));

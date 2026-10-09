import type { MMAFightLog } from "../types/mma/fightLog";

export function getLatestFighterFight(log: MMAFightLog | null, now = Date.now()) {
  return log?.fights.reduce<MMAFightLog["fights"][number] | null>((latest, fight) => {
    const date = fight.date ? Date.parse(fight.date) : NaN;
    if (!fight.result || !Number.isFinite(date) || date > now) return latest;
    return !latest || date > Date.parse(latest.date!) ? fight : latest;
  }, null) ?? null;
}

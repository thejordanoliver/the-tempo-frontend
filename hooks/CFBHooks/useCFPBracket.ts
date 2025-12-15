// hooks/CFBHooks/useCFPBracket.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BracketData, BracketGame, BracketTeam } from "types/cfb";

/* -----------------------------------------------------
   STABLE HELPERS (memo-safe, defined once)
----------------------------------------------------- */

function generateDateRange(start: string, end: string) {
  const results: string[] = [];
  let current = new Date(start);
  const endDate = new Date(end);

  while (current <= endDate) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    results.push(`${yyyy}${mm}${dd}`);
    current.setDate(current.getDate() + 1);
  }
  return results;
}

async function fetchScoreboard(date: string) {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${date}`
    );
    return res.json();
  } catch {
    return null;
  }
}

function getCFPPlayoffGames(scoreboard: any) {
  if (!scoreboard?.events) return [];
  return scoreboard.events.filter((ev: any) => {
    const comp = ev.competitions?.[0];
    const notes = comp?.notes ?? [];
    return notes.some((n: any) =>
      (n.headline ?? "").toLowerCase().includes("college football playoff")
    );
  });
}

function detectRound(ev: any): string {
  const comp = ev.competitions?.[0];
  const headline =
    comp?.notes
      ?.find((n: any) => n.type === "event")
      ?.headline?.toLowerCase() ?? "";

  if (headline.includes("first round")) return "first";
  if (headline.includes("quarterfinal")) return "quarterfinal";
  if (headline.includes("semifinal")) return "semifinal";
  if (headline.includes("championship")) return "championship";
  return "unknown";
}

function buildTeam(c: any): BracketTeam | null {
  const seed = c.curatedRank?.current ?? null;

  // If ESPN returns seed 99 → treat team as null (TBD)
  if (seed === 99) return null;

  // Extract overall record
  const overallRecord =
    c.records?.find((r: any) => r.name?.toLowerCase() === "overall")
      ?.summary ?? null;

  return {
    id: c.team.id,
    espnID: c.team.id,
    name: c.team.name ?? "",
    code: c.team.abbreviation ?? "",
    seed,
    score: c.score ?? undefined,
    logo: c.team.logo,
    logoLight: c.team.logoLight,

    // ⭐ NEW
    record: overallRecord,
  };
}


function transformEventToBracketGame(ev: any): BracketGame {
  const comp = ev.competitions?.[0];
  const awayRaw = comp?.competitors?.find((x: any) => x.homeAway === "away");
  const homeRaw = comp?.competitors?.find((x: any) => x.homeAway === "home");

  const away = awayRaw ? buildTeam(awayRaw) : null;
  const home = homeRaw ? buildTeam(homeRaw) : null;

  const statusName = comp?.status?.type?.name ?? "";
  let state: "scheduled" | "live" | "final" = "scheduled";
  if (statusName === "STATUS_FINAL") state = "final";
  if (statusName === "STATUS_IN_PROGRESS") state = "live";

  /* -----------------------------------------
     ⭐ NEW — Parse ESPN Broadcasts
  ------------------------------------------ */
  const broadcasts =
    comp?.broadcasts?.map((b: any) => ({
      name: b.names?.[0] ?? b.shortName ?? "Broadcast",
      type: b.type ?? "tv",
    })) ?? [];

  return {
    id: ev.id,
    top: away,
    bottom: home,
    status: state,
    startTime: ev.date,
    topScore: awayRaw?.score ? Number(awayRaw.score) : null,
    bottomScore: homeRaw?.score ? Number(homeRaw.score) : null,

    broadcasts, // ⭐ Added here
  };
}


/* -----------------------------------------------------
   SORTING HELPERS (stable)
----------------------------------------------------- */

function getGameSeeds(g: BracketGame): number[] {
  const arr: number[] = [];
  if (typeof g.top?.seed === "number") arr.push(g.top.seed);
  if (typeof g.bottom?.seed === "number") arr.push(g.bottom.seed);
  return arr.sort((a, b) => a - b);
}

function sortFirstRoundGames(games: BracketGame[]) {
  const map: Record<string, number> = {
    "5-12": 0,
    "8-9": 1,
    "6-11": 2,
    "7-10": 3,
  };

  return games
    .map((g) => {
      const seeds = getGameSeeds(g);
      return {
        game: g,
        key: seeds.length === 2 ? map[`${seeds[0]}-${seeds[1]}`] ?? 99 : 99,
      };
    })
    .sort((a, b) => a.key - b.key)
    .map((x) => x.game);
}

function sortQuarterfinalGames(games: BracketGame[]) {
  const hostOrder: Record<number, number> = { 4: 0, 1: 1, 3: 2, 2: 3 };

  return games
    .map((g) => {
      const seeds = getGameSeeds(g);
      const host = seeds.length ? Math.min(...seeds) : 99;
      return { game: g, key: hostOrder[host] ?? 99 };
    })
    .sort((a, b) => a.key - b.key)
    .map((x) => x.game);
}

/* -----------------------------------------------------
   BUILD BRACKET (memo-safe)
----------------------------------------------------- */

function buildBracket(events: any[]): BracketData {
  const rounds = {
    first: [],
    quarterfinal: [],
    semifinal: [],
    championship: [],
  } as Record<string, any[]>;

  events.forEach((ev) => {
    const r = detectRound(ev);
    if (r !== "unknown") rounds[r].push(ev);
  });

  const first = rounds.first.map(transformEventToBracketGame);
  const qf = rounds.quarterfinal.map(transformEventToBracketGame);
  const semi = rounds.semifinal.map(transformEventToBracketGame);
  const champ = rounds.championship.map(transformEventToBracketGame);

  return {
    first: { title: "First Round", games: sortFirstRoundGames(first) },
    quarterfinal: { title: "Quarterfinals", games: sortQuarterfinalGames(qf) },
    semifinal: { title: "Semifinals", games: semi },
    championship: { title: "National Championship", games: champ },
  };
}

/* -----------------------------------------------------
   HOOK — NOW MEMOIZED & OPTIMIZED
----------------------------------------------------- */

export function useCFPBracket() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 Cache raw CFP events — persists across renders
  const eventsRef = useRef<any[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dates = generateDateRange("2025-12-19", "2026-01-20");
   const map = new Map<string, any>();

for (const d of dates) {
  const sb = await fetchScoreboard(d);
  if (!sb) continue;

  const games = getCFPPlayoffGames(sb);

  for (const ev of games) {
    // 🔑 ESPN event ID is globally unique
    map.set(ev.id, ev);
  }
}

// ✅ Only unique CFP games survive
eventsRef.current = Array.from(map.values());

    } catch (err) {
      console.error(err);
      setError("Failed to load CFP bracket.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // 🧠 Memoize bracket so it **never recomputes** unless events change
  const data = useMemo(() => {
    return eventsRef.current.length > 0
      ? buildBracket(eventsRef.current)
      : null;
  }, [eventsRef.current.length]);

  return { data, loading, error, refresh };
}

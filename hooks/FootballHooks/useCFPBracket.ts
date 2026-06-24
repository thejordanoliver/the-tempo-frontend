// hooks/CFBHooks/useCFPBracket.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  BracketData,
  BracketGame,
  BracketTeam,
  Round,
} from "types/football";

/* -----------------------------------------------------
   STABLE HELPERS
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
      `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${date}`,
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
      (n.headline ?? "").toLowerCase().includes("college football playoff"),
    );
  });
}

/* -----------------------------------------------------
   ROUND DETECTION
----------------------------------------------------- */

function detectRound(ev: any): Round {
  const comp = ev.competitions?.[0];

  const headline =
    comp?.notes
      ?.find((n: any) => n.type === "event")
      ?.headline?.toLowerCase() ?? "";

  if (headline.includes("first round")) return "first";
  if (headline.includes("quarterfinal")) return "quarterfinal";
  if (headline.includes("semifinal")) return "semifinal";
  if (headline.includes("championship")) return "championship";

  return "first";
}

/* -----------------------------------------------------
   TEAM BUILDER
----------------------------------------------------- */

function buildTeam(c: any): BracketTeam | null {
  const seed = c.curatedRank?.current ?? null;

  if (seed === 99) return null;

  const overallRecord =
    c.records?.find((r: any) => r.name?.toLowerCase() === "overall")?.summary ??
    null;

  return {
    id: c.team.id,
    espnId: c.team.id,
    name: c.team.name ?? "",
    code: c.team.abbreviation ?? "",
    seed,
    score: c.score ?? undefined,
    logo: c.team.logo,
    logoLight: c.team.logoLight,
    record: overallRecord,
  };
}

/* -----------------------------------------------------
   TRANSFORM GAME
----------------------------------------------------- */

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

  const broadcasts =
    comp?.broadcasts?.map((b: any) => ({
      name: b.names?.[0] ?? b.shortName ?? "Broadcast",
      type: b.type ?? "tv",
    })) ?? [];

  const round = detectRound(ev);

  return {
    id: ev.id,
    round,
    top: away,
    bottom: home,
    status: state,
    startTime: ev.date,
    topScore: awayRaw?.score ? Number(awayRaw.score) : null,
    bottomScore: homeRaw?.score ? Number(homeRaw.score) : null,
    broadcasts,
  };
}

/* -----------------------------------------------------
   SORT HELPERS
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
        key: seeds.length === 2 ? (map[`${seeds[0]}-${seeds[1]}`] ?? 99) : 99,
      };
    })
    .sort((a, b) => a.key - b.key)
    .map((x) => x.game);
}

function sortQuarterfinalGames(games: BracketGame[]) {
  const hostOrder: Record<number, number> = {
    4: 0,
    1: 1,
    3: 2,
    2: 3,
  };

  return games
    .map((g) => {
      const seeds = getGameSeeds(g);
      const host = seeds.length ? Math.min(...seeds) : 99;

      return {
        game: g,
        key: hostOrder[host] ?? 99,
      };
    })
    .sort((a, b) => a.key - b.key)
    .map((x) => x.game);
}

/* -----------------------------------------------------
   BUILD BRACKET
----------------------------------------------------- */

function buildBracket(events: any[]): BracketData {
  const rounds: Record<Round, any[]> = {
    first: [],
    quarterfinal: [],
    semifinal: [],
    championship: [],
  };

  events.forEach((ev) => {
    const r = detectRound(ev);
    rounds[r].push(ev);
  });

  return {
    first: {
      title: "First Round",
      games: sortFirstRoundGames(rounds.first.map(transformEventToBracketGame)),
    },
    quarterfinal: {
      title: "Quarterfinals",
      games: sortQuarterfinalGames(
        rounds.quarterfinal.map(transformEventToBracketGame),
      ),
    },
    semifinal: {
      title: "Semifinals",
      games: rounds.semifinal.map(transformEventToBracketGame),
    },
    championship: {
      title: "National Championship",
      games: rounds.championship.map(transformEventToBracketGame),
    },
  };
}

/* -----------------------------------------------------
   HOOK
----------------------------------------------------- */

export function useCFPBracket() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [events, setEvents] = useState<any[]>([]);

  /* ================= FETCH ================= */

  const fetchBracket = useCallback(async () => {
    try {
      setError(null);

      const dates = generateDateRange("2025-12-19", "2026-01-20");

      // 🔥 parallel fetch (faster)
      const results = await Promise.all(dates.map((d) => fetchScoreboard(d)));

      const map = new Map<string, any>();

      results.forEach((sb) => {
        if (!sb) return;

        const games = getCFPPlayoffGames(sb);

        for (const ev of games) {
          map.set(ev.id, ev);
        }
      });

      setEvents(Array.from(map.values()));
    } catch (err) {
      console.error(err);
      setError("Failed to load CFP bracket.");
    }
  }, []);

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        await fetchBracket();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [fetchBracket]);

  /* ================= REFRESH ================= */

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBracket();
    setRefreshing(false);
  }, [fetchBracket]);

  /* ================= DERIVED ================= */

  const data = useMemo(() => {
    return events.length > 0 ? buildBracket(events) : null;
  }, [events]);

  return {
    data,
    loading,
    refreshing,
    error,
    onRefresh,
  };
}

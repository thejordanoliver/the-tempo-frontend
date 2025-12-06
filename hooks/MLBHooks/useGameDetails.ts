import axios from "axios";
import { useEffect, useState } from "react";

// ------------------ Types ------------------
export interface Official {
  fullName: string;
  displayName: string;
  position: { name: string; displayName: string; id: string };
  order: number;
}

export interface MLBInjury {
  status: string;
  date?: string;
  athlete: {
    id: string;
    displayName: string;
    shortName?: string;
    headshot?: { href: string };
    position?: { displayName?: string; abbreviation?: string };
    jersey?: string;
  };
  details?: {
    type?: string;
    location?: string;
    returnDate?: string;
  };
}

export interface MLBTeamInjuries {
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    logo?: string;
  };
  injuries: MLBInjury[];
}

export interface LeaderGroup {
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    logos?: { href: string }[];
  };
  leaders: {
    name: string;
    displayName: string;
    leaders: {
      athlete: {
        id: string;
        fullName: string;
        displayName: string;
        shortName?: string;
        headshot?: string;
        position?: { abbreviation?: string };
        team?: { id: string };
      };
      value: number;
    }[];
  }[];
}

export interface MLBLineScore {
  home: number[];
  away: number[];
  totals: {
    homeHits: number;
    awayHits: number;
    homeErrors: number;
    awayErrors: number;
  };
}

export interface UseGameDetails {
  officials: Official[];
  injuries: MLBTeamInjuries[];
  highlights: any[];
  plays: any[];
  lineScore: MLBLineScore | null;
  boxScore: any | null;
  teamStats: any[];
  playerStats: any[];
  leaders: LeaderGroup[];
  neutralSite: boolean;
  venue: any | null;
  attendance: number | null;

  /** ⭐ ADDED FIELDS */
  seriesSummary: string | null;
  headline: string | null;
  gameNote: string | null;
  isPostseason: boolean;
  seasonState: string | null;
  playoffRound: string | null; // ⭐ NEW — ALDS/ALCS/NLDS/NLCS/World Series

  timeouts: { home: number | null; away: number | null };
  loading: boolean;
  error: string | null;
}

// ------------------ Hook ------------------
export const useGameDetails = (
  league: "mlb" | "cbb",
  awayTeamId?: string | number,
  homeTeamId?: string | number,
  date?: string | { date?: string; utc?: string; timestamp?: number }
): UseGameDetails => {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [injuries, setInjuries] = useState<MLBTeamInjuries[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [plays, setPlays] = useState<any[]>([]);
  const [lineScore, setLineScore] = useState<MLBLineScore | null>(null);
  const [boxScore, setBoxScore] = useState<any | null>(null);
  const [teamStats, setTeamStats] = useState<any[]>([]);
  const [playerStats, setPlayerStats] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<LeaderGroup[]>([]);
  const [neutralSite, setNeutralSite] = useState<boolean>(false);
  const [venue, setVenue] = useState<any | null>(null);
  const [attendance, setAttendance] = useState<number | null>(null);
  const [seriesSummary, setSeriesSummary] = useState<string | null>(null);
  const [gameNote, setGameNote] = useState<string | null>(null);
  const [headline, setHeadline] = useState<string | null>(null);
  const [isPostseason, setIsPostseason] = useState<boolean>(false);
  const [seasonState, setSeasonState] = useState<string | null>(null);

  const [playoffRound, setPlayoffRound] = useState<string | null>(null); // ⭐ NEW

  const [timeouts, setTimeouts] = useState({ home: null, away: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!league || !homeTeamId || !awayTeamId || !date) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // ------------------- DATE PARSING -------------------
        const parseDate = (value: any): Date => {
          if (!value) return new Date();
          if (typeof value === "object" && typeof value.timestamp === "number")
            return new Date(value.timestamp * 1000);
          if (typeof value === "object" && typeof value.utc === "string")
            return new Date(value.utc);
          if (typeof value === "object" && typeof value.date === "string")
            return new Date(value.date);
          if (typeof value === "string")
            return new Date(value.replace("T", " ").replace("Z", ""));
          return new Date();
        };

        const parsedDate = parseDate(date);

        const d0 = new Date(parsedDate);
        const dPrev = new Date(parsedDate);
        const dNext = new Date(parsedDate);
        dPrev.setDate(dPrev.getDate() - 1);
        dNext.setDate(dNext.getDate() + 1);

        const datesToCheck = [
          dPrev.toISOString().split("T")[0].replace(/-/g, ""),
          d0.toISOString().split("T")[0].replace(/-/g, ""),
          dNext.toISOString().split("T")[0].replace(/-/g, ""),
        ];

        const sportPath =
          league === "mlb" ? "baseball/mlb" : "baseball/college-baseball";
        const params = league === "cbb" ? "&groups=50&limit=500" : "";

        // ---------------- FIND GAME ----------------
        let found: any = null;
        let foundSeasonState: string | null = null;

        for (const ds of datesToCheck) {
          const url = `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard?dates=${ds}${params}`;
          const res = await axios.get(url);
          const events = res.data?.events ?? [];

          const match = events.find((g: any) =>
            g?.competitions?.some((comp: any) => {
              const ids = (comp?.competitors ?? []).map((c: any) =>
                String(c.team.id)
              );
              return (
                ids.includes(String(homeTeamId)) &&
                ids.includes(String(awayTeamId))
              );
            })
          );

          if (match) {
            found = match;
            foundSeasonState = match?.season?.slug ?? null;
            break;
          }
        }

        if (!found) {
          setError("Game not found");
          return;
        }

        setSeasonState(foundSeasonState);

        // ---------------- SUMMARY ----------------
        const gameId = found?.competitions?.[0]?.id ?? found?.id;
        const sumURL = `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/summary?event=${gameId}`;
        const { data: summary } = await axios.get(sumURL);

        const comp0 = summary?.header?.competitions?.[0];

        // ---------------- PLAYOFF CHECK ----------------
        const isPost =
          comp0?.series?.[0]?.competitors?.length > 0 &&
          comp0?.series?.[0]?.summary;

        setIsPostseason(!!isPost);

        // ---------------- SERIES SUMMARY ----------------
        setSeriesSummary(isPost ? comp0.series[0].summary : null);

        // ---------------- HEADLINE / GAME NOTE ----------------
        setHeadline(
          summary?.header?.gameNote ?? comp0?.status?.type?.shortDetail ?? null
        );

        setGameNote(summary?.header?.gameNote);

        // ---------------- PLAYOFF ROUND (⭐ NEW) ----------------
        const playoffSeries = summary?.seasonseries?.find(
          (s: any) => s.type === "playoff"
        );

        if (playoffSeries) {
          setPlayoffRound(playoffSeries.round ?? null); // ALDS, NLCS, World Series...
        }

        // ---------------- DATA LOAD ----------------
        setHighlights(summary?.videos ?? []);
        setOfficials(summary?.gameInfo?.officials ?? []);
        setInjuries(summary?.injuries ?? []);
        setPlays(summary?.plays ?? []);
        setLeaders(summary?.leaders ?? []);
        setBoxScore(summary?.boxscore ?? null);
        setVenue(summary?.gameInfo?.venue ?? null);
        setAttendance(summary?.gameInfo?.attendance ?? null);

        // ---------------- TEAM + PLAYER STATS ----------------
        const teams = summary?.boxscore?.teams ?? [];
        setTeamStats(
          teams.map((t: any) => ({
            team: t.team,
            stats: t.statistics ?? [],
          }))
        );

        const players = summary?.boxscore?.players ?? [];
        setPlayerStats(
          players.map((p: any) => {
            const block = p?.statistics?.find((s: any) =>
              Array.isArray(s?.athletes)
            );
            return {
              team: p.team,
              names: block?.names ?? [],
              keys: block?.keys ?? [],
              labels: block?.labels ?? [],
              athletes: (block?.athletes ?? []).map((ath: any) => ({
                ...ath,
                statValues: ath.stats ?? [],
              })),
            };
          })
        );

        // ---------------- LINE SCORE ----------------
        const homeTeam = comp0?.competitors?.find(
          (c: any) => c.homeAway === "home"
        );
        const awayTeam = comp0?.competitors?.find(
          (c: any) => c.homeAway === "away"
        );

        setLineScore({
          home: (homeTeam?.linescores ?? []).map(
            (i: any) => Number(i.displayValue) || 0
          ),
          away: (awayTeam?.linescores ?? []).map(
            (i: any) => Number(i.displayValue) || 0
          ),
          totals: {
            homeHits: homeTeam?.hits ?? 0,
            awayHits: awayTeam?.hits ?? 0,
            homeErrors: homeTeam?.errors ?? 0,
            awayErrors: awayTeam?.errors ?? 0,
          },
        });

        setTimeouts({
          home: homeTeam?.timeoutsRemaining ?? null,
          away: awayTeam?.timeoutsRemaining ?? null,
        });
      } catch (err: any) {
        console.error("❌ [MLB GameDetails] ERROR:", err);
        setError(err.message || "Failed to fetch");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [league, homeTeamId, awayTeamId, date]);

  return {
    seriesSummary,
    gameNote,
    headline,
    isPostseason,
    seasonState,
    playoffRound, // ⭐ return it
    officials,
    injuries,
    highlights,
    plays,
    lineScore,
    boxScore,
    teamStats,
    playerStats,
    leaders,
    neutralSite,
    venue,
    attendance,
    timeouts,
    loading,
    error,
  };
};

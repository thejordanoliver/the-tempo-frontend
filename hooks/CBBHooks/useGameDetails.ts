import axios from "axios";
import { useEffect, useState } from "react";

// ------------------ Types ------------------
export interface Official {
  fullName: string;
  displayName: string;
  position: { name: string; displayName: string; id: string };
  order: number;
}

export interface Injury {
  team?: { id?: string; displayName?: string; abbreviation?: string };
  athletes?: {
    fullName: string;
    shortName?: string;
    position?: { displayName?: string };
    status?: { type?: string; description?: string };
  }[];
}

export interface Fouls {
  teamFouls: number;
  teamFoulsCurrent: number;
  foulsToGive: number;
  bonusState: "NONE";
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

export interface VenueInfo {
  name?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  capacity?: number | null;
  grass?: boolean | null;
  indoor?: boolean | null;
  image?: string | null;
  raw?: any; // Original ESPNN venue object
  latitude?: number | null;
  longitude?: number | null;
}

export interface UseGameDetails {
  officials: Official[];
  injuries: Injury[];
  highlights: any[];
  plays: any[];
  boxScore: any | null;
  teamStats: any[];
  playerStats: any[];
  leaders: LeaderGroup[];
  neutralSite: boolean;
  timeouts: { home: number | null; away: number | null };
  fouls: { home: Fouls | null; away: Fouls | null }; // 👈 ADD
  venue: VenueInfo | null;
  loading: boolean;
  error: string | null;
}

// ------------------ Hook ------------------
export const useGameDetails = (
  league: "nba" | "cbb" | "wcbb",
  awayTeamId?: string | number,
  homeTeamId?: string | number,
  date?: string | { date?: string; utc?: string; timestamp?: number }
): UseGameDetails => {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [plays, setPlays] = useState<any[]>([]);
  const [boxScore, setBoxScore] = useState<any | null>(null);
  const [teamStats, setTeamStats] = useState<any[]>([]);
  const [playerStats, setPlayerStats] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<LeaderGroup[]>([]);
  const [neutralSite, setNeutralSite] = useState<boolean>(false);
  const [timeouts, setTimeouts] = useState({ home: null, away: null });
  const [venue, setVenue] = useState<VenueInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fouls, setFouls] = useState<{
    home: Fouls | null;
    away: Fouls | null;
  }>({ home: null, away: null });

  useEffect(() => {
    if (!league || !homeTeamId || !awayTeamId || !date) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // ---------------- FORMAT DATE ----------------
        let d: Date | null = null;

        if (typeof date === "string") d = new Date(date);
        else if ("timestamp" in date && date.timestamp)
          d = new Date(date.timestamp * 1000);
        else if ("utc" in date && date.utc) d = new Date(date.utc);
        else if ("date" in date && date.date) d = new Date(date.date);

        if (!d) return;

        const ymd = (x: Date) => x.toISOString().slice(0, 10).replace(/-/g, "");

        const datesToCheck = [
          ymd(new Date(d.getTime() - 86400000)),
          ymd(d),
          ymd(new Date(d.getTime() + 86400000)),
        ];

        // ---------------- ESPN PATH ----------------
        // ---------------- ESPN PATH ----------------
        const sportPath =
          league === "nba"
            ? "basketball/nba"
            : league === "wcbb"
            ? "basketball/womens-college-basketball"
            : "basketball/mens-college-basketball";

        // ESPN needs groups/limit for both men & women
        const params =
          league === "cbb" || league === "wcbb" ? "&groups=50&limit=500" : "";

        // ---------------- FIND GAME ----------------
        let found: any = null;

        for (const dateStr of datesToCheck) {
          const url = `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard?dates=${dateStr}${params}`;
          const res = await axios.get(url);
          const events = res.data.events || [];

          const match = events.find((g: any) => {
            const comps = g?.competitions?.[0]?.competitors ?? [];
            const ids = comps.map((c: any) => String(c.team.id));
            return (
              ids.includes(String(homeTeamId)) &&
              ids.includes(String(awayTeamId))
            );
          });

          if (match) {
            found = match;
            break;
          }
        }

        if (!found) {
          setError("Game not found");
          return;
        }

        // ---------------- SUMMARY ----------------
        const gameId = found?.competitions?.[0]?.id ?? found?.id ?? null;

        if (!gameId) throw new Error("Missing game ID");

        const summaryURL = `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/summary?event=${gameId}`;
        const { data: summary } = await axios.get(summaryURL);

        setNeutralSite(
          summary?.header?.competitions?.[0]?.neutralSite ?? false
        );
        setHighlights(summary?.videos ?? []);
        setOfficials(summary?.gameInfo?.officials ?? []);
        setInjuries(summary?.injuries ?? []);
        setPlays(summary?.plays ?? []);
        setLeaders(summary?.leaders ?? []);
        setBoxScore(summary?.boxscore ?? null);

        // ---------------- VENUE ----------------
        const venueRaw = summary?.gameInfo?.venue ?? null;

        if (venueRaw) {
          setVenue({
            name: venueRaw.fullName ?? venueRaw.name ?? null,
            city: venueRaw.address?.city ?? null,
            state: venueRaw.address?.state ?? null,
            address: venueRaw.address?.fullAddress ?? null,
            capacity: venueRaw.capacity ?? null,
            grass: venueRaw.surface?.toLowerCase?.().includes("grass") ?? null,
            indoor: venueRaw.indoor ?? null,
            image: venueRaw.images?.[0]?.href ?? null,
            raw: venueRaw,
          });
        } else {
          setVenue(null);
        }

        // ---------------- TEAM STATS ----------------
        const teams = summary?.boxscore?.teams ?? [];
        const parsedTeams = teams.map((t: any) => ({
          team: t.team,
          stats: t.statistics ?? [],
        }));
        setTeamStats(parsedTeams);

        // ---------------- PLAYER STATS ----------------
        const players = summary?.boxscore?.players ?? [];

        const parsedPlayers = players.map((p: any) => {
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
        });

        setPlayerStats(parsedPlayers);

        // ---------------- TIMEOUTS ----------------
        const comp = summary?.header?.competitions?.[0]?.competitors ?? [];
        const home = comp.find((c: any) => c.homeAway === "home");
        const away = comp.find((c: any) => c.homeAway === "away");

        setTimeouts({
          home: home?.timeoutsRemaining ?? null,
          away: away?.timeoutsRemaining ?? null,
        });

        // ---------------- FOULS ----------------
        const competitors =
          summary?.header?.competitions?.[0]?.competitors ?? [];

        const homeComp = competitors.find((c: any) => c.homeAway === "home");
        const awayComp = competitors.find((c: any) => c.homeAway === "away");

        setFouls({
          home: homeComp?.fouls ?? null,
          away: awayComp?.fouls ?? null,
        });
      } catch (err: any) {
        console.error("❌ useGameDetails error:", err);
        setError(err.message || "Failed to fetch");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [league, homeTeamId, awayTeamId, date]);

  return {
    officials,
    injuries,
    highlights,
    plays,
    boxScore,
    teamStats,
    playerStats,
    leaders,
    neutralSite,
    timeouts,
    fouls, // 👈 ADD THIS
    venue,
    loading,
    error,
  };
};

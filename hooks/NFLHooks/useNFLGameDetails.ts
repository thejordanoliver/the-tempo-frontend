import axios from "axios";
import { useEffect, useState } from "react";

interface NormalizedVenue {
  name?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  image?: string | null;
  capacity?: number | string | null;
  attendance?: number | null;
  grass?: boolean | null; // <-- add this
  raw?: any; // original object for debugging if needed
}

interface NFLGameDetailsResult {
  officials: any[];
  injuries: any[];
  previousDrives: any[];
  currentDrives: any[];
  venue: NormalizedVenue | null;
  scoringPlays: any[]; // <-- added
  loading: boolean;
  error: string | null;
  gameId?: string | null;
}

const SCOREBOARD_CACHE: Record<string, any[]> = {}; // in-memory cache for scoreboard data

export const useNFLGameDetails = (
  awayId: string | null | undefined,
  homeId: string | null | undefined,
  date?: string | { date?: string; utc?: string; timestamp?: number }
): NFLGameDetailsResult => {
  const [officials, setOfficials] = useState<any[]>([]);
  const [injuries, setInjuries] = useState<any[]>([]);
  const [previousDrives, setPreviousDrives] = useState<any[]>([]);
  const [currentDrives, setCurrentDrives] = useState<any[]>([]);
  const [venue, setVenue] = useState<NormalizedVenue | null>(null);
  const [scoringPlays, setScoringPlays] = useState<any[]>([]); // <-- new state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);

  useEffect(() => {
    if (!homeId || !awayId || !date) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // --- Normalize date ---
        let targetDate: Date | null = null;
        if (typeof date === "string") targetDate = new Date(date);
        else if (typeof date === "object") {
          targetDate = date.timestamp
            ? new Date(date.timestamp * 1000)
            : date.utc
            ? new Date(date.utc)
            : date.date
            ? new Date(date.date)
            : null;
        }
        if (!targetDate || isNaN(targetDate.getTime())) {
          setError("Invalid date provided");
          setLoading(false);
          return;
        }

        const makeYMD = (d: Date) =>
          d.toISOString().slice(0, 10).replace(/-/g, "");

        const datesToCheck = [
          makeYMD(new Date(targetDate.getTime() - 24 * 60 * 60 * 1000)),
          makeYMD(targetDate),
          makeYMD(new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)),
        ];

        let foundGame: any = null;

        // --- Try 3 consecutive days to locate the game ---
        for (const yyyymmdd of datesToCheck) {
          let games: any[] = [];

          if (SCOREBOARD_CACHE[yyyymmdd]) {
            games = SCOREBOARD_CACHE[yyyymmdd];
          } else {
            const scoreboardUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${yyyymmdd}`;
            const scoreboardRes = await axios.get(scoreboardUrl);
            games = scoreboardRes.data.events || [];
            SCOREBOARD_CACHE[yyyymmdd] = games;
          }

          const game = games.find((g: any) => {
            const competition = g.competitions?.[0] || g.competition;
            const ids =
              competition?.competitors?.map((c: any) => String(c.team?.id)) ??
              [];
            return ids.includes(String(awayId)) && ids.includes(String(homeId));
          });

          if (game) {
            foundGame = game;
            break;
          }
        }

        if (!foundGame) {
          setError("Game not found on ESPN for any nearby date.");
          setOfficials([]);
          setInjuries([]);
          setCurrentDrives([]);
          setPreviousDrives([]);
          setVenue(null);
          setScoringPlays([]); // <-- clear scoring plays
          setGameId(null);
          return;
        }

        const gameId = foundGame.id;
        setGameId(gameId);

        // --- Fetch summary ---
        const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${gameId}`;
        const { data: summary } = await axios.get(summaryUrl);

        const rawVenue = summary?.gameInfo?.venue ?? null;
        const attendanceFromSummary = summary?.gameInfo?.attendance ?? null;

   const normalizedVenue: NormalizedVenue | null = rawVenue
  ? {
      name: rawVenue.fullName ?? rawVenue.name ?? null,
      city: rawVenue.address?.city ?? null,
      state: rawVenue.address?.state ?? null,
      address: rawVenue.address
        ? [rawVenue.address?.city, rawVenue.address?.state, rawVenue.address?.zipCode]
            .filter(Boolean)
            .join(", ")
        : null,
      // ✅ Use second image if available, otherwise fallback
      image:
        rawVenue?.images?.[1]?.href ?? 
        rawVenue?.images?.[0]?.href ??
        rawVenue?.image ??
        rawVenue?.venueImage ??
        null,
      capacity: rawVenue?.capacity ?? rawVenue?.venueCapacity ?? null,
      grass: rawVenue?.grass ??  null,
      attendance:
        typeof attendanceFromSummary === "number" ? attendanceFromSummary : null,
      raw: rawVenue,
    }
  : null;

        // --- Update states ---
        setOfficials(summary?.gameInfo?.officials ?? []);
        setVenue(normalizedVenue);
        setInjuries(summary?.injuries?.items ?? []);
        setPreviousDrives(summary?.drives?.previous ?? []);
        setCurrentDrives(summary?.drives?.current ?? []);
        setScoringPlays(summary?.scoringPlays ?? []); // <-- add scoring plays here
      } catch (err: any) {
        console.error("⚠️ Error fetching NFL game details:", err);
        setError(err?.message || "Failed to fetch NFL game details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [awayId, homeId, date]);

  return {
    officials,
    injuries,
    currentDrives,
    previousDrives,
    venue,
    scoringPlays, // <-- return scoring plays
    loading,
    error,
    gameId,
  };
};

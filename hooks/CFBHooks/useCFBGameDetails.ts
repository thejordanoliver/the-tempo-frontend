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
  grass?: boolean | null;
  raw?: any;
}

interface CFBGameDetailsResult {
  officials: any[];
  injuries: any[];
  previousDrives: any[];
  currentDrives: any[];
  venue: NormalizedVenue | null;
  scoringPlays: any[];
  loading: boolean;
  neutralSite: boolean;
  highlights: any[];
  error: string | null;
  gameId?: string | null;
}

const SCOREBOARD_CACHE: Record<string, any[]> = {};

export const useCFBGameDetails = (
  awayId: string | null | undefined,
  homeId: string | null | undefined,
  date?: string | { date?: string; utc?: string; timestamp?: number }
): CFBGameDetailsResult => {
  const [officials, setOfficials] = useState<any[]>([]);
  const [neutralSite, setNeutralSite] = useState<boolean>(false);
  const [injuries, setInjuries] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [previousDrives, setPreviousDrives] = useState<any[]>([]);
  const [currentDrives, setCurrentDrives] = useState<any[]>([]);
  const [venue, setVenue] = useState<NormalizedVenue | null>(null);
  const [scoringPlays, setScoringPlays] = useState<any[]>([]);
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

        const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");

        const datesToCheck = [
          fmt(new Date(targetDate.getTime() - 86400000)),
          fmt(targetDate),
          fmt(new Date(targetDate.getTime() + 86400000)),
        ];

        let foundGame: any = null;
        let scoreboardVenue: any = null;

        // --- Find game in scoreboard ---
        for (const yyyymmdd of datesToCheck) {
          let games: any[] = [];

          if (SCOREBOARD_CACHE[yyyymmdd]) {
            games = SCOREBOARD_CACHE[yyyymmdd];
          } else {
            const scoreboardUrl = `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${yyyymmdd}`;
            const scoreboardRes = await axios.get(scoreboardUrl);
            games = scoreboardRes.data.events || [];
            SCOREBOARD_CACHE[yyyymmdd] = games;
          }

          for (const g of games) {
            const comp = g.competitions?.[0] || g.competition;

            const competitorIds =
              comp?.competitors?.map((c: any) =>
                String(
                  c.team?.id ?? c.id ?? (c.uid ? c.uid.split("~").pop() : "")
                )
              ) ?? [];

            if (
              competitorIds.includes(String(awayId)) &&
              competitorIds.includes(String(homeId))
            ) {
              foundGame = g;

              // Venue fallback: comp.venue → root.g.venue → null
              scoreboardVenue = comp?.venue || g.venue || null;

              break;
            }
          }

          if (foundGame) break;
        }

        if (!foundGame) {
          setError("Game not found on ESPN for any nearby date.");
          setVenue(null);
          setOfficials([]);
          setInjuries([]);
          setPreviousDrives([]);
          setCurrentDrives([]);
          setScoringPlays([]);
          setHighlights([]);
          setGameId(null);
          return;
        }

        const id = foundGame.id;
        setGameId(id);

        // --- Fetch summary ---
        const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/football/college-football/summary?event=${id}`;
        const { data: summary } = await axios.get(summaryUrl);

        const summaryVenue = summary?.gameInfo?.venue ?? null;
        const attendance = summary?.gameInfo?.attendance ?? null;
        const neutral =
          summary?.header?.competitions?.[0]?.neutralSite ?? false;

        // Avoid shadowing: call this summaryHighlights
        const summaryHighlights = summary?.videos ?? [];

        // --- Robust venue merge ---
        const mergedVenueRaw = summaryVenue
          ? { ...scoreboardVenue, ...summaryVenue } // summary overrides fields
          : scoreboardVenue;

        const normalizedVenue: NormalizedVenue | null = mergedVenueRaw
          ? {
              name: mergedVenueRaw.fullName ?? mergedVenueRaw.name ?? null,
              city: mergedVenueRaw.address?.city ?? null,
              state: mergedVenueRaw.address?.state ?? null,
              address: mergedVenueRaw.address
                ? [
                    mergedVenueRaw.address?.city,
                    mergedVenueRaw.address?.state,
                    mergedVenueRaw.address?.zipCode,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : null,
              image:
                mergedVenueRaw.images?.[1]?.href ??
                mergedVenueRaw.images?.[0]?.href ??
                mergedVenueRaw.image ??
                mergedVenueRaw.venueImage ??
                null,
              capacity:
                mergedVenueRaw.capacity ?? mergedVenueRaw.venueCapacity ?? null,
              grass: mergedVenueRaw.grass ?? mergedVenueRaw.isGrass ?? null,
              attendance: typeof attendance === "number" ? attendance : null,
              raw: mergedVenueRaw,
            }
          : null;

        // --- Fix ESPN drive inconsistencies ---
        const prev =
          summary?.drives?.previous ??
          summary?.drives?.all ??
          summary?.drives?.complete ??
          [];
        const curr = summary?.drives?.current ? [summary.drives.current] : [];

        // --- Update states ---
        setVenue(normalizedVenue);
        setNeutralSite(neutral);
        setOfficials(summary?.gameInfo?.officials ?? []);
        setInjuries(summary?.injuries?.items ?? []);
        setScoringPlays(summary?.scoringPlays ?? []);
        setPreviousDrives(prev);
        setCurrentDrives(curr);
        setHighlights(summaryHighlights);
      } catch (err: any) {
        console.error("⚠️ Error fetching CFB game details:", err);
        setError(err?.message || "Failed to fetch CFB game details");
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
    neutralSite,
    highlights,
    venue,
    scoringPlays,
    loading,
    error,
    gameId,
  };
};

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
  neutralSite: boolean;         // final resolved neutral site (summary > scoreboard)
  scoreboardNeutral: boolean;   // raw scoreboard neutral site
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
  const [neutralSite, setNeutralSite] = useState<boolean>(false);    // final neutral
  const [scoreboardNeutral, setScoreboardNeutral] = useState<boolean>(false); // raw scoreboard neutral

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
        // ---------- Normalize incoming date ----------
        let targetDate: Date | null = null;

        if (typeof date === "string") targetDate = new Date(date);
        else if (typeof date === "object") {
          if (date.timestamp) targetDate = new Date(date.timestamp * 1000);
          else if (date.utc) targetDate = new Date(date.utc);
          else if (date.date) targetDate = new Date(date.date);
        }

        if (!targetDate || isNaN(targetDate.getTime())) {
          setError("Invalid date provided");
          setLoading(false);
          return;
        }

        const fmt = (d: Date) =>
          d.toISOString().slice(0, 10).replace(/-/g, "");

        const datesToCheck = [
          fmt(new Date(targetDate.getTime() - 86400000)),
          fmt(targetDate),
          fmt(new Date(targetDate.getTime() + 86400000)),
        ];

        // ---------- Scoreboard search ----------
        let foundGame: any = null;
        let scoreboardVenue: any = null;
        let scoreboardNeutralValue = false;

        for (const yyyymmdd of datesToCheck) {
          let games =
            SCOREBOARD_CACHE[yyyymmdd] ??
            (await axios
              .get(
                `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${yyyymmdd}`
              )
              .then((res) => res.data.events || []));

          SCOREBOARD_CACHE[yyyymmdd] = games;

          for (const g of games) {
            const comp = g.competitions?.[0] || g.competition;

            const competitorIds =
              comp?.competitors?.map((c: any) =>
                String(c.team?.id ?? c.id ?? c.uid?.split("~").pop())
              ) ?? [];

            if (
              competitorIds.includes(String(awayId)) &&
              competitorIds.includes(String(homeId))
            ) {
              foundGame = g;

              scoreboardVenue = comp?.venue || g.venue || null;

              scoreboardNeutralValue =
                comp?.neutralSite ??
                comp?.competitions?.[0]?.neutralSite ??
                false;

              // store raw scoreboard neutral
              setScoreboardNeutral(scoreboardNeutralValue);

              // provisional final neutral value
              setNeutralSite(scoreboardNeutralValue);

              break;
            }
          }

          if (foundGame) break;
        }

        if (!foundGame) {
          setError("Game not found on ESPN for any nearby date.");
          return;
        }

        const id = foundGame.id;
        setGameId(id);

        // ---------- Summary fetch ----------
        const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/football/college-football/summary?event=${id}`;
        const { data: summary } = await axios.get(summaryUrl);

        // summary neutral override
        const summaryNeutral =
          summary?.header?.competitions?.[0]?.neutralSite ?? null;

        if (summaryNeutral !== null) {
          setNeutralSite(summaryNeutral);
        }

        // ---------- Venue merging ----------
        const summaryVenue = summary?.gameInfo?.venue ?? null;
        const attendance = summary?.gameInfo?.attendance ?? null;

        const mergedVenueRaw = summaryVenue
          ? { ...scoreboardVenue, ...summaryVenue }
          : scoreboardVenue;

        const normalizedVenue: NormalizedVenue | null = mergedVenueRaw
          ? {
              name: mergedVenueRaw.fullName ?? mergedVenueRaw.name ?? null,
              city: mergedVenueRaw.address?.city ?? null,
              state: mergedVenueRaw.address?.state ?? null,
              address: mergedVenueRaw.address
                ? [
                    mergedVenueRaw.address.city,
                    mergedVenueRaw.address.state,
                    mergedVenueRaw.address.zipCode,
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
              attendance:
                typeof attendance === "number" ? attendance : null,
              raw: mergedVenueRaw,
            }
          : null;

        // ---------- Drives ----------
        const prev =
          summary?.drives?.previous ??
          summary?.drives?.all ??
          summary?.drives?.complete ??
          [];

        const curr = summary?.drives?.current
          ? [summary.drives.current]
          : [];

        // ---------- Update state ----------
        setVenue(normalizedVenue);
        setOfficials(summary?.gameInfo?.officials ?? []);
        setInjuries(summary?.injuries?.items ?? []);
        setScoringPlays(summary?.scoringPlays ?? []);
        setPreviousDrives(prev);
        setCurrentDrives(curr);
        setHighlights(summary?.videos ?? []);
      } catch (err: any) {
        console.error("⚠️ CFB details error:", err);
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
    previousDrives,
    currentDrives,
    venue,
    scoringPlays,
    highlights,
    loading,
    error,
    neutralSite,       // final resolved value (summary > scoreboard)
    scoreboardNeutral, // raw scoreboard value
    gameId,
  };
};

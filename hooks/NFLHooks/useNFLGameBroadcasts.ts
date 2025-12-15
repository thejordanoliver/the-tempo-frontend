import axios from "axios";
import { useEffect, useState } from "react";

function parseDateString(d: string) {
  const isoMatch = /^\d{4}-\d{1,2}-\d{1,2}/.test(d);
  if (isoMatch) return new Date(d);

  const mdMatch = /^(\d{1,2})\/(\d{1,2})$/.exec(d);
  if (mdMatch) {
    const year = new Date().getFullYear();
    const month = mdMatch[1].padStart(2, "0");
    const day = mdMatch[2].padStart(2, "0");
    return new Date(`${year}-${month}-${day}`);
  }

  const parsed = Date.parse(d);
  if (!isNaN(parsed)) return new Date(parsed);

  console.warn("Cannot parse date:", d);
  return null;
}

export const useNFLGameBroadcasts = (
  homeTeamId: string | number | undefined,
  awayTeamId: string | number | undefined,
  date:
    | string
    | { date?: string; utc?: string; timestamp?: number }
    | undefined
) => {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!homeTeamId || !awayTeamId || !date) return;

    const fetchBroadcasts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Normalize target date → Date object
        let targetDate: Date | null = null;
        if (typeof date === "string") {
          targetDate = parseDateString(date);
        } else if (typeof date === "object") {
          targetDate = date.timestamp
            ? new Date(date.timestamp * 1000)
            : date.utc
            ? new Date(date.utc)
            : date.date
            ? new Date(date.date)
            : null;
        }
        if (!targetDate) return;

        // Format ESPN date YYYYMMDD
        const makeYMD = (d: Date) =>
          d.toISOString().slice(0, 10).replace(/-/g, "");

        const datesToCheck = [
          makeYMD(new Date(targetDate.getTime() - 24 * 60 * 60 * 1000)), // day before
          makeYMD(targetDate), // same day
          makeYMD(new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)), // day after
        ];

        let foundGame: any = null;

        for (const yyyymmdd of datesToCheck) {
          const scoreboardUrl =
            `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${yyyymmdd}`;

          const scoreboardRes = await axios.get(scoreboardUrl);
          const games = scoreboardRes.data.events || [];

          const game = games.find((g: any) => {
            const competitors =
              g.competitions?.[0]?.competitors?.map((c: any) =>
                Number(c.team.id)
              ) ?? [];

            return (
              competitors.includes(Number(homeTeamId)) &&
              competitors.includes(Number(awayTeamId))
            );
          });

          if (game) {
            foundGame = game;
            break;
          }
        }

        if (!foundGame) {
          setError("Game not found on ESPN");
          setBroadcasts([]);
          return;
        }

        // Extract broadcasts
        const eventBroadcasts =
          foundGame.competitions?.[0]?.broadcasts || [];

        setBroadcasts(eventBroadcasts);
      } catch (err: any) {
        console.error("Error fetching broadcasts:", err);
        setError(err.message || "Failed to fetch broadcasts");
      } finally {
        setLoading(false);
      }
    };

    fetchBroadcasts();
  }, [homeTeamId, awayTeamId, date]);

  return { broadcasts, loading, error };
};

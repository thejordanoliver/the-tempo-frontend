import { useEffect, useState } from "react";
import axios from "axios";

export type Highlight = {
  id: string;
  headline: string;
  description: string;
  thumbnail: string;
  links: {
    web: string;
    mobile: string;
    hls?: string;
    mp4?: string;
  };
};

export type GameHighlights = {
  gameId: string;
  highlights: Highlight[];
};

type SportType = "nfl" | "cfb" | "nba" | "cbb";

export const useGameHighlights = (
  sport: SportType,
  homeEspnID?: number,
  awayEspnID?: number,
  date?:
    | string
    | {
        date?: string;
        utc?: string;
        timestamp?: number | { timestamp?: number; utc?: string; date?: string };
      }
) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [highlightsLoading, setLoading] = useState(false);
  const [highlightsError, setError] = useState<string | null>(null);

  const skipFetch = !sport || !homeEspnID || !awayEspnID || !date;

  const fetchHighlights = async () => {
    if (skipFetch) return;
    setLoading(true);
    setError(null);

    try {
      // --- Parse the date into YYYYMMDD ---
      let targetDate: Date | null = null;

      if (typeof date === "string") {
        targetDate = new Date(date);
      } else if (typeof date === "object") {
        let tsObj: any =
          date.timestamp && typeof date.timestamp === "object"
            ? date.timestamp
            : date;

        if (tsObj.timestamp !== undefined) {
          targetDate =
            tsObj.timestamp < 1e12
              ? new Date(tsObj.timestamp * 1000)
              : new Date(tsObj.timestamp);
        } else if (tsObj.utc) {
          targetDate = new Date(tsObj.utc);
        } else if (tsObj.date) {
          targetDate = new Date(tsObj.date);
        }
      }

      if (!targetDate || isNaN(targetDate.getTime())) {
        throw new Error("Invalid date provided to useGameHighlights");
      }

      const yyyymmdd = `${targetDate.getFullYear()}${String(
        targetDate.getMonth() + 1
      ).padStart(2, "0")}${String(targetDate.getDate()).padStart(2, "0")}`;

      // --- Call correct backend route ---
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/game-highlights/${sport}`;


      const { data } = await axios.get(apiUrl, {
        params: { date: yyyymmdd, homeEspnID, awayEspnID },
      });

      const highlightsList = data?.response || [];
      setHighlights(highlightsList);
    } catch (err: any) {
      console.error("Highlights fetch error:", err.message);
      setError(err.message || "Failed to fetch highlights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (skipFetch) return;
    fetchHighlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sport, homeEspnID, awayEspnID, JSON.stringify(date)]);

  return { highlights, highlightsLoading, highlightsError, refresh: fetchHighlights };
};

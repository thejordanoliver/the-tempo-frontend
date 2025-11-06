import { useEffect, useState } from "react";
import axios from "axios";
import { teams } from "constants/teamsCFB";

export type CFBHighlight = {
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

export type CFBGameHighlights = {
  gameId: string;
  highlights: CFBHighlight[];
};

// --- ESPN → internal mapping ---
const espnToInternal: Record<string, number> = {};
teams.forEach((t) => {
  if (t.espnID) espnToInternal[String(t.espnID)] = Number(t.id);
});

export const useCFBHighlights = (
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
  const [highlights, setHighlights] = useState<CFBHighlight[]>([]);
  const [highlightsLoading, setLoading] = useState(false);
  const [highlightsError, setError] = useState<string | null>(null);

  const skipFetch = !homeEspnID || !awayEspnID || !date;

  const fetchHighlights = async () => {
    if (skipFetch) return;
    setLoading(true);
    setError(null);

    try {
      // --- Parse target date into YYYYMMDD ---
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
        throw new Error("Invalid date provided to useCFBHighlights");
      }

      const yyyymmdd = `${targetDate.getFullYear()}${String(
        targetDate.getMonth() + 1
      ).padStart(2, "0")}${String(targetDate.getDate()).padStart(2, "0")}`;

      // --- Fetch from your backend route ---
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/highlights/cfb`;
      const { data } = await axios.get(apiUrl, {
        params: { date: yyyymmdd, homeEspnID, awayEspnID },
      });

      const highlightsList = data?.response || [];
      setHighlights(highlightsList);
    } catch (err: any) {
      setError(err.message || "Failed to fetch highlights");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Only trigger when stable values actually change
  useEffect(() => {
    if (skipFetch) return;
    fetchHighlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeEspnID, awayEspnID, JSON.stringify(date)]); // stabilize date changes

  return { highlights, highlightsLoading, highlightsError, refresh: fetchHighlights };
};

import axios from "axios";
import { useEffect, useState } from "react";
import { MMAEvent } from "types/mma";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export function useSeasonFights() {
  const [events, setEvents] = useState<MMAEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const date = new Date();
  const currentSeason = date.getFullYear();
  const fetchFights = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const res = await axios.get(
        `${API_BASE}/api/fights/mma/season/${currentSeason}`,
      );

      const rawEvents: MMAEvent[] = res.data?.events ?? [];
      setEvents(rawEvents);
    } catch (err: any) {
      console.error("[useSeasonFights] error:", err);
      const message = err?.message || "Failed to load fights";
      setError(new Error(message));
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshFights = () => fetchFights(true);

  useEffect(() => {
    fetchFights();
  }, []);

  return { events, loading, refreshing, error, refreshFights };
}

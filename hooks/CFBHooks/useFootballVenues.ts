import axios from "axios";
import { useEffect, useState } from "react";

import { BASE_URL } from "utils/apiClient";

export interface FootballVenues {
  id: number;
  espn_id: number | null;
  full_name: string;
  venue: string;
  venue_capacity: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  venue_image: string | null;
}

export const useFootballVenues = () => {
  const [data, setData] = useState<FootballVenues[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchVenues = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/venues`);

        if (!mounted) return;

        setData(res.data.venues || []);
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.response?.data?.error || "Failed to fetch CFB venues");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchVenues();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
};

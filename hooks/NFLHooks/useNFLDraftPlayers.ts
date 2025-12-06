import axios from "axios";
import { useEffect, useState } from "react";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const useNFLDraftPlayers = (
  year: number,
  team?: string,
  school?: string,
  conference?: string,
  position?: string
) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!year) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(`${BASE_URL}/api/cfbd/draft/picks`, {
          params: {
            year,
            team,
            school,
            conference,
            position,
          },
        });

        setData(res.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            err.message ||
            "Failed to load CFBD recruits"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, team, school, conference, position]);

  return { data, loading, error };
};

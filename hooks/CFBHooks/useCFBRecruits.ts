import axios from "axios";
import { useState, useEffect } from "react";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const useCFBRecruits = (year: number, team?: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!year) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(`${BASE_URL}/api/cfbd/recruits`, {
          params: {
            year,
            team,
          },
        });

        setData(res.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            err.message ||
            "Failed to load recruits"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, team]);

  return { data, loading, error };
};

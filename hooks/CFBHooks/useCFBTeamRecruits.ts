import axios from "axios";
import { useState, useEffect } from "react";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const useCFBTeamRecruits = (year: number) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!year) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(`${BASE_URL}/api/cfbd/team/recruits`, {
          params: { year },   // ⭐ ONLY year
        });

        setData(res.data);    // Expect array like [{ team, rank, points }]
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            err.message ||
            "Failed to load team recruiting rankings"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  return { data, loading, error };
};

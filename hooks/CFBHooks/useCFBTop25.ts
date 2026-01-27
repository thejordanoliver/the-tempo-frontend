import { useEffect, useState } from "react";
import axios from "axios";

export type Top25Team = {
  id: number;
  school: string;
  rank: number;
  conference: string;
  team_id: number;
  espn_id: number;
};

export function useCFBTop25(week: number) {
  const [top25, setTop25] = useState<Top25Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:4000/api/cfb-rankings/all?week=${week}`)
      .then((res) => {
        // Filter to AP Top 25 only
        const apTop25 = res.data["AP Top 25"] || [];
        setTop25(apTop25);
      })
      .catch((err) => setError(err.message || "Error fetching Top 25"))
      .finally(() => setLoading(false));
  }, [week]);

  return { top25, loading, error };
}

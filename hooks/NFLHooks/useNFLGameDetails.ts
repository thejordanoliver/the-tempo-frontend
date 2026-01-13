import axios from "axios";
import { useEffect, useState } from "react";

interface NormalizedVenue {
  name?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  image?: string | null;
  capacity?: number | null;
  attendance?: number | null;
  grass?: boolean | null;
}




export const useNFLGameDetails = (
  homeId?: string | null,
  awayId?: string | null,
  date?: any
) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!homeId || !awayId || !date) return;

    setLoading(true);
    setError(null);

    axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/api/nfl/game-details`, {
        params: { homeId, awayId, date },
      })
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [homeId, awayId, date]);

  return { ...data, loading, error };
};

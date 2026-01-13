import axios from "axios";
import { useEffect, useState } from "react";


export interface Broadcasts {
  type: {
    id: string;
    shortName: "TV";
  };
  market: {
    id: string;
    type: "National";
  };
  media: {
    shortName: string;
  };
  lang: string;
  region: string;
  isNational: boolean;
}


/* -------------------------------------------------- */
/* Hook                                               */
/* -------------------------------------------------- */

export const useCFBGameDetails = (
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
      .get(`${process.env.EXPO_PUBLIC_API_URL}/api/cfb/details/game-details`, {
        params: { homeId, awayId, date },
      })
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [homeId, awayId, date]);

  return { ...data, loading, error };
};

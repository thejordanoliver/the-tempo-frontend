import { useState, useEffect } from "react";
import axios from "axios";
import { MMAFighter } from "types/mma";

interface useMMAFighterReturn {
  fighter: MMAFighter | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch a MMA fighter by API Sports ID
 * @param fighterId - API Sports ID of the fighter
 */
const useMMAFighter = (fighterId: number | string): useMMAFighterReturn => {
  const [fighter, setFighter] = useState<MMAFighter | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fighterId) return;

    let isMounted = true; // prevent setting state on unmounted component

    const fetchFighter = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<{ success: boolean; fighter: MMAFighter | null }>(
          `/api/mma_fighters/${fighterId}`
        );

        if (isMounted) {
          setFighter(response.data.fighter);
        }
      } catch (err: unknown) {
        if (isMounted) {
          if (axios.isAxiosError(err)) {
            setError(err.response?.data?.error || err.message || "Failed to fetch fighter");
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Failed to fetch fighter");
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFighter();

    return () => {
      isMounted = false; // cleanup on unmount
    };
  }, [fighterId]);

  return { fighter, loading, error };
};

export default useMMAFighter;
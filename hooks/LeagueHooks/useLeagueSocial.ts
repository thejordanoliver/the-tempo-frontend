import { XCardProps } from "components/League/Social/XCard";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LeagueType } from "types/types";
import { apiClient } from "utils/apiClient";

type State = {
  socialData: XCardProps[];
  socialLoading: boolean;
  socialError: string | null;
  sources: string[];
  count: number;
  refetch: () => Promise<void>;
};

export function useLeagueSocial(
  sport?: LeagueType,
  limit: number = 10,
  sourcesOverride?: string[]
): State {
  const [socialData, setSocialData] = useState<XCardProps[]>([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [sourceList, setSourceList] = useState<string[]>([]);
  const [count, setCount] = useState(0);

  // ✅ derive sources safely
  const sources = useMemo(() => {
    if (sourcesOverride?.length) return sourcesOverride;
    if (sport) return [sport.toLowerCase()];
    return [];
  }, [sport, sourcesOverride]);

  const fetchTweets = useCallback(async () => {
    if (!sources.length) return;

    setSocialLoading(true);
    setSocialError(null);

    try {
      const res = await apiClient.get("api/social", {
        params: {
          limit,
          sources: sources.join(","),
        },
      });

      if (res.data?.success) {
        setSocialData(res.data.posts ?? []);
        setSourceList(res.data.sources ?? []);
        setCount(res.data.count ?? 0);
      } else {
        setSocialError(res.data?.message || "Failed to load social feed");
      }
    } catch (err: any) {
      setSocialError(
        err?.response?.data?.message ||
          err.message ||
          "Unknown error fetching social feed",
      );
    } finally {
      setSocialLoading(false);
    }
  }, [limit, sources]);

  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  return {
    socialData,
    socialLoading,
    socialError,
    sources: sourceList,
    count,
    refetch: fetchTweets,
  };
}
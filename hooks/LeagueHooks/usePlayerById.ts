import { isAxiosError, isCancel } from "axios";
import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export function usePlayerById(
  playerId?: number,
  league: string = "nfl",
  enabled = true,
) {
  const [player, setPlayer] = useState<any>(null);
  const [identity, setIdentity] = useState<{
    league: string;
    playerId: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedRequestKey, setResolvedRequestKey] = useState<string | null>(
    null,
  );
  const canFetch =
    enabled && Number.isSafeInteger(playerId) && Number(playerId) > 0;
  const requestKey = canFetch ? `${league}:${playerId}` : null;

  useEffect(() => {
    if (!requestKey || !playerId) {
      return;
    }

    const controller = new AbortController();

    async function fetchPlayer() {
      try {
        setLoading(true);
        setError(null);
        setPlayer(null);
        setIdentity(null);
        setResolvedRequestKey(null);

        const url = `api/roster/${league}/player/${playerId}`;

        const res = await apiClient.get(url, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        const resolvedId = Number(res.data.player?.id ?? playerId);
        const profileLinks: Record<string, { league: string; column: string }> =
          {
            cfb: { league: "nfl", column: "cfb_player_id" },
            mcbb: { league: "nba", column: "mcbb_player_id" },
            wcbb: { league: "wnba", column: "wcbb_player_id" },
          };
        const linkedProfile = profileLinks[league];
        setIdentity({
          league:
            linkedProfile && res.data.player?.[linkedProfile.column] != null
              ? linkedProfile.league
              : league,
          playerId:
            Number.isSafeInteger(resolvedId) && resolvedId > 0
              ? resolvedId
              : playerId!,
        });
        setPlayer(res.data.player ?? null);
        setResolvedRequestKey(requestKey);
      } catch (err: unknown) {
        if (isCancel(err) || controller.signal.aborted) return;

        console.error("Player fetch error:", err);
        setPlayer(null);
        setIdentity(null);
        setError(
          isAxiosError<{ error?: string; message?: string }>(err)
            ? err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to load player"
            : "Failed to load player",
        );
        setResolvedRequestKey(requestKey);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchPlayer();

    return () => controller.abort();
  }, [league, playerId, requestKey]);

  const hasCurrentResult =
    requestKey !== null && resolvedRequestKey === requestKey;

  return {
    player: hasCurrentResult ? player : null,
    resolvedPlayerId: hasCurrentResult ? identity?.playerId : undefined,
    resolvedLeague: hasCurrentResult ? (identity?.league ?? league) : league,
    loading: canFetch ? loading || !hasCurrentResult : false,
    error: hasCurrentResult ? error : null,
  };
}

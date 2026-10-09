import { isAxiosError, isCancel } from "axios";
import { useEffect, useMemo, useState } from "react";
import type { MMAFightLog } from "types/mma/fightLog";
import type { MMAFight } from "types/mma/mma";
import { apiClient } from "utils/apiClient";
import { getLatestFighterFight } from "utils/mmaFightLog";

type Result = { key: string; game: MMAFight | null; error: string | null };

export function useFighterLatestGame(fightLog: MMAFightLog | null) {
  const latestEntry = useMemo(() => getLatestFighterFight(fightLog), [fightLog]);
  const eventId = latestEntry?.eventId;
  const fightId = latestEntry?.fightId;
  const date = latestEntry?.date;
  const requestKey = eventId && fightId && date ? `${eventId}:${fightId}:${date}` : null;
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!requestKey || !eventId || !fightId || !date) return;
    const controller = new AbortController();
    void apiClient.get<{ game: MMAFight }>(
      `/api/games/mma/game/ufc/${eventId}/${fightId}`,
      { params: { date }, signal: controller.signal },
    ).then(response => {
      if (controller.signal.aborted) return;
      const game = String(response.data.game?.id) === fightId
        && String(response.data.game?.eventId) === eventId
        && response.data.game?.competitors?.length === 2
          ? response.data.game : null;
      setResult({ key: requestKey, game, error: game ? null : "Latest fight is unavailable" });
    }).catch((error: unknown) => {
      if (controller.signal.aborted || isCancel(error)) return;
      setResult({
        key: requestKey,
        game: null,
        error: isAxiosError<{ error?: string }>(error)
          ? error.response?.data?.error || "Unable to load latest fight"
          : "Unable to load latest fight",
      });
    });
    return () => controller.abort();
  }, [requestKey, eventId, fightId, date]);

  const currentResult = result?.key === requestKey ? result : null;
  return {
    game: currentResult?.game ?? null,
    loading: requestKey !== null && currentResult === null,
    error: currentResult?.error ?? null,
  };
}

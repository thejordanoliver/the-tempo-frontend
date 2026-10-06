import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { isAxiosError } from "axios";
import { useFanPrediction } from "./useFanPrediction";
import { castRankedPrediction } from "services/fanPredictionsApi";
import type { FeedPrediction, FanPredictionTeamId } from "types/fanPredictions";

export function useFeedPrediction(game: FeedPrediction) {
  const [open, setOpen] = useState(() => Date.parse(game.startsAt) > Date.now());

  useEffect(() => {
    const remaining = Date.parse(game.startsAt) - Date.now();
    const timer = setTimeout(
      () => setOpen(false),
      Math.max(0, Math.min(remaining, 2147483647)),
    );
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") setOpen(Date.parse(game.startsAt) > Date.now());
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [game.startsAt]);

  const castVote = useCallback(async (teamId: FanPredictionTeamId) => {
    if (Date.parse(game.startsAt) <= Date.now()) {
      setOpen(false);
      return { ok: false as const, error: "Predictions closed at kickoff." };
    }
    try {
      await castRankedPrediction(game.gameId, teamId, {
        sport: game.sport,
        league: game.league,
        date: game.startsAt,
      });
      return { ok: true as const };
    } catch (error) {
      const serverMessage = isAxiosError(error) ? error.response?.data?.error : null;
      return {
        ok: false as const,
        error: typeof serverMessage === "string"
          ? serverMessage
          : "Couldn't save your pick. Try again.",
      };
    }
  }, [game]);

  const prediction = useFanPrediction({
    gameId: game.gameId,
    awayId: game.away.id,
    awayCode: game.away.code,
    homeId: game.home.id,
    homeCode: game.home.code,
    state: open ? "pre" : "in",
    initialState: game,
    votes: null,
    castVote,
  });
  return { ...prediction, open };
}

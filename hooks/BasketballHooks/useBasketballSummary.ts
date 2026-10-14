import { useMemo } from "react";
import type { Play } from "./useBasketballGameDetails";
import { basketballSummaryModel } from "utils/games/gameSummaryModels";

export function useBasketballSummary(plays: readonly Play[], league: string) {
  return useMemo(() => basketballSummaryModel(plays, league), [plays, league]);
}

import { useMemo } from "react";
import type { FootballDrives, PlayObject } from "./useFootballGameDetails";
import { useFootballSummaryPlays } from "./useFootballSummaryPlays";
import { footballSummaryModel } from "utils/games/gameSummaryModels";

export function useFootballSummary(plays: readonly PlayObject[], drives?: FootballDrives | null) {
  const sorted = useFootballSummaryPlays(plays, drives);
  return useMemo(() => footballSummaryModel(sorted), [sorted]);
}

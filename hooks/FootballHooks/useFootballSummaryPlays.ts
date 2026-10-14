import { useMemo } from "react";
import type { FootballDrives, PlayObject } from "./useFootballGameDetails";
import { collectFootballSummaryPlays } from "utils/sports/football/footballSummary";

export function useFootballSummaryPlays(
  plays: readonly PlayObject[],
  drives?: FootballDrives | null,
) {
  return useMemo(
    () => collectFootballSummaryPlays(plays, drives),
    [plays, drives],
  );
}

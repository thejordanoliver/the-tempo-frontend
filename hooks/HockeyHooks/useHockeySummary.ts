import { useMemo } from "react";
import type { Play } from "./useHockeyGameDetails";
import { hockeySummaryModel } from "utils/games/gameSummaryModels";

export function useHockeySummary(plays: readonly Play[]) {
  return useMemo(() => hockeySummaryModel(plays), [plays]);
}

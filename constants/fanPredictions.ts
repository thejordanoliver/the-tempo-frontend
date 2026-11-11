import type { FanPredictionSportFilter } from "types/fanPredictions";

export const FAN_PREDICTION_SPORT_FILTERS = [
  { label: "All Sports", value: "all" },
  { label: "Basketball", value: "basketball" },
  { label: "Football", value: "football" },
  { label: "Baseball", value: "baseball" },
  { label: "Hockey", value: "hockey" },
  { label: "Soccer", value: "soccer" },
  { label: "MMA", value: "mma" },
  { label: "Volleyball", value: "volleyball" },
] as const satisfies readonly {
  label: string;
  value: FanPredictionSportFilter;
}[];

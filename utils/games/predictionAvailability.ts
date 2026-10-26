import type { FanPredictionPick } from "types/fanPredictions";

export function isUnavailablePrediction(
  pick: Pick<FanPredictionPick, "statusDescription">,
) {
  return /postponed|cancelled|canceled|abandoned|no contest/i.test(
    pick.statusDescription ?? "",
  );
}

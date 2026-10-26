import type { Play } from "hooks/BasketballHooks/useBasketballGameDetails";
import { useScreenActivity } from "hooks/useScreenActivity";
import { memo, useMemo } from "react";
import { View } from "react-native";
import type { BasketballWinProbability } from "types/basketball/visualizations";
import {
  basketballGameFlow,
  basketballProbabilityHistory,
} from "utils/sports/basketball/basketballCharts";
import BasketballTimelineChart from "./BasketballTimelineChart";

const EMPTY_HISTORY: BasketballWinProbability[] = [];
function BasketballGameCharts({
  plays,
  winProbability = EMPTY_HISTORY,
  league,
  state,
  ...props
}: {
  plays: readonly Play[];
  winProbability?: readonly BasketballWinProbability[];
  league: string;
  state?: string | null;
  scope: string;
  homeCode: string;
  awayCode: string;
  homeColor: string;
  awayColor: string;
  isDark: boolean;
}) {
  const flow = useMemo(() => basketballGameFlow(plays), [plays]);
  const probability = useMemo(
    () => basketballProbabilityHistory(winProbability),
    [winProbability],
  );
  const { active } = useScreenActivity();
  if (league !== "nba" || (state !== "in" && state !== "post")) return null;
  return (
    <View style={{ gap: 20 }}>
      <BasketballTimelineChart
        {...props}
        active={active}
        points={probability}
        mode="probability"
      />
      <BasketballTimelineChart
        {...props}
        active={active}
        points={flow}
        mode="margin"
      />
    </View>
  );
}
export default memo(BasketballGameCharts);

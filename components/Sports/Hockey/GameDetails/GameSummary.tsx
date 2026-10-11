import GameSummary from "@/components/Sports/Basketball/GameDetails/GameSummary/GameSummary";
import type { Play } from "hooks/HockeyHooks/useHockeyGameDetails";
import { useHockeySummary } from "hooks/HockeyHooks/useHockeySummary";
import type { ImageSourcePropType } from "react-native";

type Props = {
  plays?: Play[];
  loading?: boolean;
  isDark: boolean;
  homeId: string | number;
  awayId: string | number;
  homeLogo: ImageSourcePropType;
  awayLogo: ImageSourcePropType;
};

const EMPTY_PLAYS: Play[] = [];

export default function HockeyGameSummary({
  plays = EMPTY_PLAYS,
  ...props
}: Props) {
  const model = useHockeySummary(plays);
  return (
    <GameSummary
      {...props}
      model={model}
      scope={`nhl:${props.homeId}:${props.awayId}`}
    />
  );
}

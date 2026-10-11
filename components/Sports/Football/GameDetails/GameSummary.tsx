import GameSummary from "@/components/Sports/Basketball/GameDetails/GameSummary/GameSummary";
import type {
  FootballDrives,
  PlayObject,
} from "hooks/FootballHooks/useFootballGameDetails";
import { useFootballSummary } from "hooks/FootballHooks/useFootballSummary";
import type { ImageSourcePropType } from "react-native";

type Props = {
  plays?: PlayObject[];
  drives?: FootballDrives | null;
  gameId: string | number;
  state?: string | null;
  loading?: boolean;
  isDark: boolean;
  homeId: string | number;
  awayId: string | number;
  homeLogo: ImageSourcePropType;
  awayLogo: ImageSourcePropType;
};

const EMPTY_PLAYS: PlayObject[] = [];

export default function FootballGameSummary({
  plays = EMPTY_PLAYS,
  drives,
  gameId,
  ...props
}: Props) {
  const model = useFootballSummary(plays, drives);
  return <GameSummary {...props} model={model} scope={`football:${gameId}`} />;
}

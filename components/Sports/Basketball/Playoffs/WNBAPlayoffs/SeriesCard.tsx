import { activeOpacity } from "constants/styles";
import { Pressable } from "react-native";
import {
  getWNBASeriesLayout,
  WNBAPlayoffBracketStyles,
} from "styles/PlayoffStyles/WNBAPlayoffBracketStyles";
import type { NBABracketMatchup } from "types/basketball/basketball";
import type { WNBAPlayoffSeries } from "types/basketball/wnbaPlayoffs";
import { MatchupCard } from "../NBAPlayoffs/MatchupCard";

type Props = {
  series: WNBAPlayoffSeries;
  roundIndex: number;
  seriesIndex: number;
  roundLabel: string;
  isFinals: boolean;
  isDark: boolean;
  onPress: (series: WNBAPlayoffSeries) => void;
};

export default function SeriesCard({
  series,
  roundIndex,
  seriesIndex,
  roundLabel,
  isFinals,
  isDark,
  onPress,
}: Props) {
  const styles = WNBAPlayoffBracketStyles(isDark);
  const layout = getWNBASeriesLayout(roundIndex, seriesIndex);
  const disabled = series.games.length === 0;
  const matchupName = series.teams
    .map((team) => team?.name ?? "To be determined")
    .join(" versus ");
  const matchup: NBABracketMatchup = {
    id: series.id,
    round: roundIndex + 1,
    conference: "finals",
    topTeam: series.teams[0] ?? undefined,
    bottomTeam: series.teams[1] ?? undefined,
    wins: series.wins,
    games: series.games,
  };

  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${roundLabel}, ${matchupName}`}
      accessibilityState={{ disabled }}
      onPress={() => onPress(series)}
      style={({ pressed }) => [
        styles.seriesCard,
        {
          left: layout.x,
          top: layout.y,
          width: layout.width,
          height: layout.height,
          opacity: pressed ? activeOpacity : 1,
        },
      ]}
    >
      <MatchupCard
        matchup={matchup}
        layout={{ ...layout, x: 0, y: 0 }}
        isDark={isDark}
        finals={isFinals}
        league="wnba"
        bestOf={series.bestOf}
      />
    </Pressable>
  );
}

import HeadingTwo from "components/Headings/HeadingTwo";
import HeadToHeadSkeleton from "components/Skeletons/GameDetails/HeadToHeadSkeleton";
import { globalStyles } from "constants/Styles";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { BlurView } from "expo-blur";
import {
  HeadToHead,
  useHeadToHeadGames,
} from "hooks/NBAHooks/useHeadToHeadGames";
import { StyleSheet, Text, View } from "react-native";
import { headToHeadStyles } from "styles/GameDetailStyles/HeadToHeadStyles";
import { getNBASeason } from "utils/dateUtils";
import HeadToHeadGameRow from "./HeadToHeadGameRow";
type Props = {
  homeTeamId: number;
  awayTeamId: number;
  homeTeamColor: string | undefined;
  awayTeamColor: string | undefined;
  isDark: boolean;
};

export default function HeadToHeadGames({
  homeTeamId,
  awayTeamId,
  homeTeamColor,
  awayTeamColor,
  isDark,
}: Props) {
  const styles = headToHeadStyles(isDark);
  const global = globalStyles(isDark);

  const homeTeam = getNBATeam(homeTeamId);
  const awayTeam = getNBATeam(awayTeamId);

  const homeLogo = getTeamLogo(homeTeamId, isDark);
  const awayLogo = getTeamLogo(awayTeamId, isDark);

  const homeTeamCode = homeTeam?.code;
  const awayTeamCode = awayTeam?.code;

  const homeTeamEspnId = String(homeTeam?.espnID) ?? "";
  const awayTeamEspnId = String(awayTeam?.espnID) ?? "";

  const { data, loading, error } = useHeadToHeadGames(
    homeTeamId,
    awayTeamId,
    Number(getNBASeason()),
  );

  if (loading) return <HeadToHeadSkeleton />;
  if (error) return <Text style={global.errorText}>Error loading games</Text>;

  if (!data)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>Series Not Available</Text>
      </View>
    );

  const { series, games } = data as HeadToHead;

  const isAwayTeam1 = series.team1 === awayTeamId;

  const awayWins = isAwayTeam1 ? series.team1Wins : series.team2Wins;
  const homeWins = isAwayTeam1 ? series.team2Wins : series.team1Wins;

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Series Matchup</HeadingTwo>
      <View style={styles.wrapper}>
       

   
        <Text style={styles.seriesText}>
          {awayTeamCode} {awayWins} - {homeWins} {homeTeamCode}
        </Text>

        <View style={{ marginTop: 16 }}>
          {games.map((game: any, index: number) => {
            const isLast = index === games.length - 1;

            return (
              <HeadToHeadGameRow
                key={game.id}
                game={game}
                homeTeamEspnId={homeTeamEspnId}
                awayTeamEspnId={awayTeamEspnId}
                homeTeamId={homeTeamId}
                awayTeamId={awayTeamId}
                homeLogo={homeLogo}
                awayLogo={awayLogo}
                homeTeamCode={homeTeamCode}
                awayTeamCode={awayTeamCode}
                isDark={isDark}
                isLast={isLast} // <-- pass this prop
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

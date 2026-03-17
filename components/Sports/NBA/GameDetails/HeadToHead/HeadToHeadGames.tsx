import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts, globalStyles } from "constants/Styles";
import { getNBATeam, getTeamLogo } from "constants/teams";
import {
  HeadToHead,
  useHeadToHeadGames,
} from "hooks/NBAHooks/useHeadToHeadGames";
import { StyleSheet, Text, View } from "react-native";
import { getNBASeason } from "utils/dateUtils";
import HeadToHeadGameRow from "./HeadToHeadGameRow";
type Props = {
  homeTeamId: number;
  awayTeamId: number;
  isDark: boolean;
};

export default function HeadToHeadGames({
  homeTeamId,
  awayTeamId,
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

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text style={global.errorText}>Error loading games</Text>;

  if (!data)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>Series Not Available</Text>
      </View>
    );

  const { series, games } = data as HeadToHead;

  const awayWins = series[String(awayTeamId)] ?? 0;
  const homeWins = series[String(homeTeamId)] ?? 0;

  return (
    <View style={styles.container}>
      <HeadingTwo>Series Matchup</HeadingTwo>

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

export const headToHeadStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1 },

    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      paddingTop: 12,
      overflow: "hidden",
    },

    seriesText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },

    gameCard: {
      padding: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.lightGray : Colors.darkGray,
    },

    lastGameCard: {
      borderBottomWidth: 0,
    },

    info: {
      alignItems: "center",
      justifyContent: "center",
      width: 100,
    },
    teamInfo: {
      alignItems: "center",
      justifyContent: "center",
    },

    teamRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 20,
    },

    teamLogo: {
      width: 40,
      height: 40,
      resizeMode: "contain",
    },

    teamName: {
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },

    teamScore: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 24,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    teamRecord: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    loserScore: {
      opacity: 0.5,
    },
    gameDate: {
      textAlign: "center",
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontSize: 16,
    },
    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    date: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 14,
    },
    period: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 14,
    },
    finalText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    clock: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    broadcast: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontSize: 10,
      textAlign: "center",
    },
    statusDivider: {
      height: 14,
      width: 1,
      backgroundColor: isDark ? Colors.dark.text : Colors.light.text,
    },
    finalStatusDivider: {
      height: 14,
      width: 1,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });

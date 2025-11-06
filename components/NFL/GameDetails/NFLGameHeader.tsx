import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getNFLTeamsLogo, getTeamName } from "constants/teamsNFL";
import { StyleSheet, Text, View } from "react-native";
import { NFLGameCenterInfo } from "./GameInfo";
import { NFLTeamRow } from "./NFLTeamRow";
type Props = {
  homeTeam: any;
  awayTeam: any;
  scores: any;
  possessionTeamId?: string;
  homeTimeouts?: number;
  awayTimeouts?: number;
  colors: any;
  status: string;
  period?: string;
  displayClock?: string;
  possessionText?: string;
  isDark: boolean;
  homeRecord?: string;
  awayRecord?: string;
  formattedDate?: string;
  formattedTime?: string;
  playoffInfo?: string;
  networkString?: string;
  headlineText?: string;
};

export default function NFLGameHeader({
  homeTeam,
  awayTeam,
  scores,
  possessionTeamId,
  homeTimeouts = 0,
  awayTimeouts = 0,
  colors,
  status,
  period,
  displayClock,
  possessionText,
  isDark,
  homeRecord,
  awayRecord,
  networkString = "",
  formattedDate = "",
  formattedTime = "",
  playoffInfo = "",
  headlineText,
}: Props) {
  const styles = getStyles(isDark);

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <View style={[styles.teamsContainer, { borderColor: colors.border }]}>
        {/* Away Team */}
        <NFLTeamRow
          team={{
            id: String(awayTeam.id),
            code: awayTeam.code,
            name:
              getTeamName(awayTeam.id, awayTeam.nickname) ||
              awayTeam.nickname ||
              "Away",
            logo: getNFLTeamsLogo(awayTeam.id, isDark),
            record: awayRecord ?? "0-0",
          }}
          isDark={isDark}
          isHome={false}
          score={scores?.away?.total}
          opponentScore={scores?.home?.total}
          isWinner={(scores?.away?.total ?? 0) > (scores?.home?.total ?? 0)}
          colors={colors}
          status={status}
          possessionTeamId={possessionTeamId}
          timeouts={awayTimeouts}
        />

        <View>

            {/* Headline (optional) */}
          {headlineText ? (
            <View style={styles.headlineContainer}>
              <Text style={styles.headlineText} numberOfLines={2}>
                {headlineText}
              </Text>
            </View>
          ) : null}

       
          {/* Game Info */}
          <NFLGameCenterInfo
            headlineText={headlineText}
            status={status}
            date={formattedDate}
            time={formattedTime}
            period={period}
            clock={displayClock}
            colors={colors}
            isDark={isDark}
            playoffInfo={playoffInfo}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            broadcastNetworks={networkString}
            downAndDistance={possessionText}
          />
        </View>
        {/* Home Team */}
        <NFLTeamRow
          team={{
            id: String(homeTeam.id),
            code: homeTeam.code,
            name:
              getTeamName(homeTeam.id, homeTeam.nickname) ||
              homeTeam.nickname ||
              "Home",
            logo: getNFLTeamsLogo(homeTeam.id, isDark),
            record: homeRecord ?? "0-0",
          }}
          isDark={isDark}
          isHome
          score={scores?.home?.total}
          opponentScore={scores?.away?.total}
          isWinner={(scores?.home?.total ?? 0) > (scores?.away?.total ?? 0)}
          colors={colors}
          status={status}
          possessionTeamId={possessionTeamId}
          timeouts={homeTimeouts}
        />
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      borderBottomWidth: 1,
      backgroundColor: isDark ? Colors.netural.black : Colors.netural.white,
    },

    teamsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingTop: 4,
      paddingBottom: 4,
    },
    headlineContainer: {
      paddingHorizontal: 12,
      paddingTop: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    headlineText: {
      fontSize: 12,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.OSEXTRALIGHT,
      textAlign: "center",
      position: "absolute",
      width: 200,
      top: -8,
    },
  });

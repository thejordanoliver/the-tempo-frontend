import { getNFLTeamsLogo, getTeamName } from "constants/teamsNFL";
import { StyleSheet, View } from "react-native";
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
  formattedDate = "",
  formattedTime = "",
  playoffInfo = "",
}: Props) {
  const styles = getStyles(isDark);

  return (
    <View style={[styles.teamsContainer, { borderColor: colors.border }]}>
      {/* Away Team */}
      <NFLTeamRow
        team={{
          id: String(awayTeam.id),
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

      {/* Game Info */}
      <NFLGameCenterInfo
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
        downAndDistance={possessionText}
      />

      {/* Home Team */}
      <NFLTeamRow
        team={{
          id: String(homeTeam.id),
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
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    teamsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      borderBottomWidth: 1,
      paddingBottom: 12,
      backgroundColor: isDark ? "#1d1d1d" : "#fff",
    },
  });

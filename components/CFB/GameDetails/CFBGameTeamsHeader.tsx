import { getTeamLogo, getTeamName } from "constants/teamsCFB";
import { StyleSheet, View } from "react-native";
import { CFBGameCenterInfo } from "./CFBGameCenterInfo";
import { CFBTeamRow } from "./CFBTeamRow";

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
  downAndDistance?: string;
  isDark: boolean;
  homeRecord?: string;
  awayRecord?: string;
  formattedDate?: string; // ✅ new props
  formattedTime?: string; // ✅ new props
};

export default function CFBGameHeader({
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
  downAndDistance,
  isDark,
  homeRecord,
  awayRecord,
  formattedDate = "", // default
  formattedTime = "", // default
}: Props) {
  const styles = getStyles(isDark);

  return (
    <View style={[styles.teamsContainer, { borderColor: colors.border }]}>
      <CFBTeamRow
        team={{
          id: String(awayTeam.id),
          espnID: String(awayTeam.espnID),
          shortName: awayTeam.shortName,
          name:
            getTeamName(awayTeam.id, awayTeam.nickname) ||
            awayTeam.nickname ||
            "Away",
          logo: getTeamLogo(awayTeam.id, isDark),
          record: awayRecord ?? "0-0",
        }}
        isDark={isDark}
        isHome={false}
        score={scores?.away?.total}
        opponentScore={scores?.home?.total}
        isWinner={scores?.away?.total > scores?.home?.total}
        colors={colors}
        status={status}
        possessionTeamId={possessionTeamId}
        timeouts={awayTimeouts}
      />

      <CFBGameCenterInfo
        status={status}
        date={formattedDate} // ✅ pass formatted date
        time={formattedTime} // ✅ pass formatted time
        period={period}
        clock={displayClock}
        colors={colors}
        isDark={isDark}
        playoffInfo=""
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        downAndDistance={downAndDistance}
      />

      <CFBTeamRow
        team={{
          id: String(homeTeam.id),
          espnID: String(homeTeam.espnID),
          shortName: homeTeam.shortName,
          name:
            getTeamName(homeTeam.id, homeTeam.nickname) ||
            homeTeam.nickname ||
            "Home",
          logo: getTeamLogo(homeTeam.id, isDark),
          record: homeRecord ?? "0-0",
        }}
        isDark={isDark}
        isHome
        score={scores?.home?.total}
        opponentScore={scores?.away?.total}
        isWinner={scores?.home?.total > scores?.away?.total}
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

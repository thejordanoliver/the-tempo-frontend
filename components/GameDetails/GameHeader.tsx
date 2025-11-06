import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { TeamRecord } from "hooks/useTeamRecords";
import { StyleSheet, Text, View } from "react-native";
import { GameInfo } from "./GameInfo";
import { TeamRow } from "./TeamRow";
type StatusType =
  | string
  | {
      long?: string;
      short?: string | number;
      clock?: string | null;
      halftime?: boolean;
    };

type Props = {
  homeTeamData: any;
  awayTeamData: any;
  home: { name: string; record?: string };
  away: { name: string; record?: string };
  homeScore: number;
  awayScore: number;
  status: StatusType;
  period?: string;
  displayClock?: string;
  colors: any;
  isDark: boolean;
  formattedDate?: string;
  headlineText?: string;
  time?: string;
  networkString?: string;
  seriesSummary?: string;
  getGameNumberLabel?: () => string | null;
  refreshTick?: number;
  homeRecord?: TeamRecord | string;
  awayRecord?: TeamRecord | string;
  halftime?: boolean; // 👈 add this
  league?: "nba" | "cbb"; // ✅ new addition
};

export default function GameHeader({
  homeTeamData,
  awayTeamData,
  headlineText,
  home,
  away,
  homeScore,
  awayScore,
  status,
  period,
  displayClock,
  colors,
  isDark,
  formattedDate = "",
  time = "",
  networkString = "",
  seriesSummary = "",
  getGameNumberLabel = () => null,
  refreshTick = 0,
  homeRecord,
  halftime, // ← add this
  awayRecord,
  league = "nba", // ✅ default league
}: Props) {
  const styles = getStyles(isDark);

  // Normalize status
  const normalizedStatus = (() => {
    const s =
      typeof status === "string"
        ? status.toLowerCase()
        : (status?.long ?? "").toLowerCase();

    if (["final", "finished", "completed"].some((k) => s.includes(k)))
      return "Final";
    if (["canceled", "cancelled"].some((k) => s.includes(k))) return "Canceled";
    if (["postponed", "delayed"].some((k) => s.includes(k))) return "Postponed";
    if (
      ["in play", "progress", "live", "halftime", "quarter"].some((k) =>
        s.includes(k)
      )
    )
      return "In Play";
    return "Scheduled";
  })();

  const awayIsWinner =
    normalizedStatus === "Final" && (awayScore ?? 0) > (homeScore ?? 0);
  const homeIsWinner =
    normalizedStatus === "Final" && (homeScore ?? 0) > (awayScore ?? 0);

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      {/* Headline (optional) */}
      {headlineText ? (
        <View style={styles.headlineContainer}>
          <Text style={styles.headlineText} numberOfLines={2}>
            {headlineText}
          </Text>
        </View>
      ) : null}

      <View style={styles.teamsContainer}>
        {/* Away Team Row */}
        <TeamRow
          key={`away-${refreshTick}`}
          team={{
            id: awayTeamData.id,
            code: awayTeamData.code,
            name: away.name,
            record:
              typeof awayRecord === "object"
                ? awayRecord?.overall ?? away.record ?? "0-0"
                : awayRecord || away.record,
            logo:
              isDark && awayTeamData.logoLight
                ? awayTeamData.logoLight
                : awayTeamData.logo ||
                  require("../../assets/Placeholders/teamPlaceholder.png"),
          }}
          isDark={isDark}
          score={awayScore}
          isWinner={awayIsWinner}
          colors={colors}
          status={normalizedStatus}
          league={league}
        />

        <View>
          {/* Game Info */}
          <GameInfo
            headlineText={headlineText}
            key={`gameinfo-${refreshTick}`}
            status={normalizedStatus}
            date={formattedDate || new Date().toISOString()}
            time={time}
            clock={halftime ? undefined : displayClock} // ❌ hide clock if halftime
            period={period}
            colors={colors}
            isDark={isDark}
            homeTeam={home.name}
            awayTeam={away.name}
            broadcastNetworks={networkString}
            playoffInfo={[
              getGameNumberLabel() ?? "",
              seriesSummary ?? "",
            ].filter(Boolean)}
            halftime={halftime} // ✅ pass flag
          />
        </View>

        {/* Home Team Row */}
        <TeamRow
          key={`home-${refreshTick}`}
          team={{
            id: homeTeamData.id,
            code: homeTeamData.code,
            name: home.name,
            record:
              typeof homeRecord === "object"
                ? homeRecord?.overall ?? home.record ?? "0-0"
                : homeRecord || home.record,
            logo:
              isDark && homeTeamData.logoLight
                ? homeTeamData.logoLight
                : homeTeamData.logo ||
                  require("../../assets/Placeholders/teamPlaceholder.png"),
          }}
          isDark={isDark}
          isHome
          score={homeScore}
          isWinner={homeIsWinner}
          colors={colors}
          status={normalizedStatus}
          league={league}
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
      paddingBottom: 4,
    },
    headlineContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    headlineText: {
      fontSize: 12,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.OSEXTRALIGHT,
      textAlign: "center",
    },
  });

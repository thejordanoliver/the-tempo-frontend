import { StyleSheet, View } from "react-native";
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
  time?: string;
  networkString?: string;
  seriesSummary?: string;
  getGameNumberLabel?: () => string | null;
  refreshTick?: number; // passed from parent to force re-render
};

export default function GameHeader({
  homeTeamData,
  awayTeamData,
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
}: Props) {
  const styles = getStyles(isDark);

  const awayIsWinner =
    status === "Finished" && (awayScore ?? 0) > (homeScore ?? 0);
  const homeIsWinner =
    status === "Finished" && (homeScore ?? 0) > (awayScore ?? 0);
  // Normalize the status to one of the allowed GameInfo values
  const normalizedStatus = (() => {
    const lower =
      typeof status === "string"
        ? status.toLowerCase()
        : (status?.long ?? "").toLowerCase();
    if (lower.includes("finished")) return "Final";
    if (lower.includes("canceled")) return "Canceled";
    if (lower.includes("postponed")) return "Postponed";
    if (lower.includes("progress") || lower.includes("live"))
      return "In Progress";
    return "Scheduled";
  })();

  return (
    <View style={[styles.teamsContainer, { borderColor: colors.border }]}>
      {/* Away Team Row */}
      <TeamRow
        key={`away-${refreshTick}`}
        team={{
          id: awayTeamData.id,
          code: awayTeamData.code,
          name: away.name,
          record: away.record,
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
          status={normalizedStatus} // ✅ pass it here

      />

      {/* Game Info (center) */}
      <GameInfo
        key={`gameinfo-${refreshTick}`}
        status={normalizedStatus}
        date={homeTeamData.gameDate ?? new Date().toISOString()} // ISO string
        time={time}
        clock={displayClock}
        period={period}
        colors={colors}
        isDark={isDark}
        homeTeam={home.name}
        awayTeam={away.name}
        broadcastNetworks={networkString}
        playoffInfo={[getGameNumberLabel() ?? "", seriesSummary ?? ""].filter(
          Boolean
        )}
      />

      {/* Home Team Row */}
      <TeamRow
        key={`home-${refreshTick}`}
        team={{
          id: homeTeamData.id,
          code: homeTeamData.code,
          name: home.name,
          record: home.record,
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
  status={normalizedStatus} // ✅ pass it here

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

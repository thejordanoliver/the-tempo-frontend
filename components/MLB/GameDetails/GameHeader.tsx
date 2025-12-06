import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { TeamRecord } from "hooks/MLBHooks/useTeamRecords";
import { StyleSheet, Text, View } from "react-native";
import { GameInfo } from "./GameInfo";
import { TeamRow } from "./TeamRow";

type StatusType =
  | string
  | {
      long?: string;
      short?: string | number;
    };

type Props = {
  seriesSummary: string;
  seasonState?: string | null;
  gameNote: string;
  homeTeamData: any;
  awayTeamData: any;
  home: { name: string; record?: string };
  away: { name: string; record?: string };
  rankHome?: string;
  rankAway?: string;
  homeScore: number;
  awayScore: number;
  status: StatusType;
  inning?: string;
  colors: any;
  isDark: boolean;
  formattedDate?: string;
  headlineText?: string;
  time?: string;
  networkString?: string;
  refreshTick?: number;
  homeRecord?: TeamRecord | string;
  awayRecord?: TeamRecord | string;
  halftime?: boolean; // 👈 add this
  league?: "mlb" | "cbb"; // ✅ new addition
};

export default function GameHeader({
  homeTeamData,
  awayTeamData,
  seriesSummary,
  seasonState,
  headlineText,
  gameNote,
  home,
  away,
  rankHome,
  rankAway,
  homeScore,
  awayScore,
  status,
  inning,
  colors,
  isDark,
  formattedDate = "",
  time = "",
  networkString = "",
  refreshTick = 0,
  homeRecord,
  awayRecord,
  league = "mlb", // ✅ default league
}: Props) {
  const styles = getStyles(isDark);

  const normalizedStatus = (() => {
    let raw = "";

    if (typeof status === "string") {
      raw = status.toLowerCase();
    } else if (typeof status === "object" && status !== null) {
      raw = (status.long || String(status.short || "") || "").toLowerCase();
    }

    // FINAL
    if (
      ["final", "finished", "status_final", "fulltime", "ft"].some((k) =>
        raw.includes(k)
      ) ||
      raw === "f"
    ) {
      return "Final";
    }

    // CANCELED
    if (["canceled", "cancelled"].some((k) => raw.includes(k))) {
      return "Canceled";
    }

    // POSTPONED
    if (["postponed", "delayed"].some((k) => raw.includes(k))) {
      return "Postponed";
    }

    // IN PLAY
    if (
      ["in_play", "in progress", "live", "quarter", "halftime"].some((k) =>
        raw.includes(k)
      )
    ) {
      return "In Play";
    }

    return "Scheduled";
  })();

  const awayIsWinner =
    normalizedStatus === "Final" && (awayScore ?? 0) > (homeScore ?? 0);
  const homeIsWinner =
    normalizedStatus === "Final" && (homeScore ?? 0) > (awayScore ?? 0);

  const filteredHeadline =
    headlineText && !headlineText.toLowerCase().includes("final")
      ? headlineText
      : null;

  const renderHeadline = () => (
    <>
      {seasonState === "post-season" ? (
        <View style={styles.headlineContainer}>
          {gameNote ? (
            <>
              <Text style={styles.headlineText}>{gameNote}</Text>
              <View style={styles.divider} />
            </>
          ) : null}

          {seriesSummary ? (
            <Text style={styles.headlineText}>{seriesSummary}</Text>
          ) : null}
        </View>
      ) : filteredHeadline ? (
        <View style={styles.headlineContainer}>
          <Text style={styles.headlineText}>{filteredHeadline}</Text>
        </View>
      ) : null}
    </>
  );

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      {/* ------------------------- */}
      {/*   POSTSEASON HEADLINES    */}
      {/* ------------------------- */}
      {renderHeadline()}

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
                  require("assets/Placeholders/teamPlaceholder.png"),
          }}
          isDark={isDark}
          rank={rankAway}
          score={awayScore}
          isWinner={awayIsWinner}
          colors={colors}
          status={normalizedStatus}
          league={league}
        />

        <View>
          {/* Game Info */}
          <GameInfo
            key={`gameinfo-${refreshTick}`}
            status={normalizedStatus}
            date={formattedDate || new Date().toISOString()}
            time={time}
            inning={inning}
            colors={colors}
            isDark={isDark}
            broadcastNetworks={networkString}
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
                  require("assets/Placeholders/teamPlaceholder.png"),
          }}
          isDark={isDark}
          rank={rankHome}
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
      backgroundColor: isDark ? Colors.black : Colors.white,
      paddingVertical: 4,
    },
    teamsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
    headlineContainer: {
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    headline: {
      flexDirection: "row",
      position: "absolute",
      width: "100%",
      top: 2,
      fontSize: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    divider: {
      width: 1,
      height: 10,
      marginHorizontal: 4,
      backgroundColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
    headlineText: {
      fontSize: 10,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.OSEXTRALIGHT,
      textAlign: "center",
    },
  });

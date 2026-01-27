import CustomActivityIndicator from "components/CustomActivityIndicator";
import { useGameDetails } from "hooks/useGameDetails";
import { useTeamRecord } from "hooks/useTeamRecords";
import { Image, Text, View, useColorScheme } from "react-native";
import { gameWidgetStyles } from "styles/ExploreStyles/GameWidgetStyles";
import { formatQuarter } from "utils/games";
import displayeValue from "utils/widgetUtils";

export type GameWidgetProps = {
  league: "NBA";
  id: number;
  date: string;
  time: string;
  gameDateISO: string;

  homeTeam: {
    id: number;
    espnID: string;
    name: string;
    code: string;
    logo: any;
    logoLight: any;
  };
  awayTeam: {
    id: number;
    espnID: string;
    name: string;
    code: string;
    logo: any;
    logoLight: any;
  };
  homeScore: number;
  awayScore: number;
  status?: string;
  halftime?: boolean;
  clock?: string | null;
  periods: number;
  leaders?: any[];
  height?: number;
  width?: number;
  loading: boolean;
};

export default function GameWidget({
  height = 150,
  width = 150,
  loading,
  ...props
}: GameWidgetProps) {
  // -------------------------
  // Appearance & styles
  // -------------------------
  const isDark = useColorScheme() === "dark";
  const styles = gameWidgetStyles(isDark, height, width);

  // -------------------------
  // Game date/time formatting
  // -------------------------
  const gameDate = new Date(props.gameDateISO);
  const localDate = gameDate.toLocaleString(undefined, { month: "short", day: "numeric" });
  const localTime = gameDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const gameDateStr = props.gameDateISO;

  // -------------------------
  // Team records
  // -------------------------
  const homeRecord = useTeamRecord(props.homeTeam.espnID, "nba").record.overall ?? "";
  const awayRecord = useTeamRecord(props.awayTeam.espnID, "nba").record.overall ?? "";

  // -------------------------
  // Live game data
  // -------------------------
  const { score: liveScore, loading: scoreLoading } = useGameDetails(
    "nba",
    props.homeTeam.espnID,
    props.awayTeam.espnID,
    gameDateStr
  );

  const clock = liveScore?.displayClock ?? props.clock;
  const period = liveScore?.period ?? props.periods;
  const gameStatusDescription = liveScore?.gameStatusDescription ?? props.status;
  const gameStatusDetail = liveScore?.gameStatusDetail ?? props.status;

  // -------------------------
  // Game status flags
  // -------------------------
  const isScheduled = gameStatusDescription === "Scheduled";
  const isFinal = gameStatusDescription === "Final";
  const inProgress =
    gameStatusDescription === "In Progress" || gameStatusDescription === "End of Period";
  const isHalftime = gameStatusDescription === "Halftime";
  const endOfPeriod = gameStatusDescription === "End of Period";

  // -------------------------
  // Scores & winner
  // -------------------------
  const homeScore = isFinal ? props.homeScore : liveScore?.home?.total ?? 0;
  const awayScore = isFinal ? props.awayScore : liveScore?.away?.total ?? 0;

  const homeIsWinner = isFinal && homeScore > awayScore;
  const awayIsWinner = isFinal && awayScore > homeScore;

  // -------------------------
  // Display components for scores
  // -------------------------
  const homeDisplay = displayeValue(
    true,
    isScheduled,
    isFinal,
    homeIsWinner,
    homeRecord,
    homeScore,
    isDark
  );
  const awayDisplay = displayeValue(
    false,
    isScheduled,
    isFinal,
    awayIsWinner,
    awayRecord,
    awayScore,
    isDark
  );

  // -------------------------
  // Loading state
  // -------------------------
  if (loading || scoreLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomActivityIndicator />
      </View>
    );
  }

  // -------------------------
  // Render widget
  // -------------------------
  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        {/* ---------------------- */}
        {/* Away Team Section */}
        {/* ---------------------- */}
        <View style={styles.awaySection}>
          <View style={styles.teamWrapper}>
            <Image
              style={styles.teamLogo}
              source={isDark ? props.awayTeam.logoLight : props.awayTeam.logo}
            />
            <Text style={styles.teamName}>{props.awayTeam.code}</Text>
          </View>
          {awayDisplay}
        </View>

        {/* ---------------------- */}
        {/* Game Info Section */}
        {/* ---------------------- */}
        <View style={styles.gameInfo}>
          {isScheduled && (
            <View style={styles.infoWrapper}>
              <Text style={styles.dateTime}>{localDate}</Text>
              <View style={styles.divider} />
              <Text style={styles.dateTime}>{localTime}</Text>
            </View>
          )}

          {isFinal && <Text style={styles.finalText}>{gameStatusDetail}</Text>}

          {inProgress && !isHalftime && endOfPeriod && (
            <Text style={styles.finalText}>End of {formatQuarter(period)}</Text>
          )}

          {inProgress && !isHalftime && !endOfPeriod && (
            <View style={styles.infoWrapper}>
              <Text style={styles.period}>{formatQuarter(period)}</Text>
              <View style={styles.divider} />
              {clock && <Text style={styles.clock}>{clock}</Text>}
            </View>
          )}

          {isHalftime && <Text style={styles.finalText}>Halftime</Text>}
        </View>

        {/* ---------------------- */}
        {/* Home Team Section */}
        {/* ---------------------- */}
        <View style={styles.homeSection}>
          {homeDisplay}
          <View style={styles.teamWrapper}>
            <Image
              style={styles.teamLogo}
              source={isDark ? props.homeTeam.logoLight : props.homeTeam.logo}
            />
            <Text style={styles.teamName}>{props.homeTeam.code}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

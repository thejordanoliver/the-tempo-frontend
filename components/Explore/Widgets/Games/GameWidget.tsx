import CustomActivityIndicator from "components/CustomActivityIndicator";
import { useGameDetails } from "hooks/useGameDetails";
import { useTeamRecord } from "hooks/useTeamRecords";
import { Image, Text, View, useColorScheme } from "react-native";
import { gameWidgetStyles } from "styles/Explore/GameWidgetStyles";
import displayeValue from "utils/widgetUtils";
export type GameWidgetProps = {
  league: "NBA";
  id: number;
  date: string;
  time: string;
  gameDateISO: string; // ✅ stable

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
  height?: number; // NEW
  width?: number; // NEW
  loading: boolean;
};

export default function GameWidget({
  height = 150,
  width = 150,
  loading,
  ...props
}: GameWidgetProps) {
  const isDark = useColorScheme() === "dark";
  const styles = gameWidgetStyles(isDark, height, width);

  const gameDateStr = props.gameDateISO;

  const homeId = props.homeTeam?.id;
  const awayId = props.awayTeam?.id;
  const homeEspnId = props.homeTeam?.espnID;
  const awayEspnId = props.awayTeam?.espnID;
  const homeRecord = useTeamRecord(homeEspnId, "nba").record.overall ?? "";
  const awayRecord = useTeamRecord(awayEspnId, "nba").record.overall ?? "";


  const gameDate = new Date(props.gameDateISO); // parse ISO date
  // Format local date with short month
  const localDate = gameDate.toLocaleString(undefined, {
    month: "short", // Jan, Feb, etc.
    day: "numeric", // day of month
  });
  const localTime = gameDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const { score: liveScore, loading: scoreLoading } = useGameDetails(
    "nba",
    String(props.homeTeam.espnID),
    String(props.awayTeam.espnID),
    gameDateStr
  );

  const clock = liveScore?.displayClock;
  const period = liveScore?.period ?? props.periods;
  const gameStatusDescription = liveScore?.gameStatusDescription;
  const gameStatusDetail = liveScore?.gameStatusDetail;

  const isScheduled = gameStatusDescription === "Scheduled";
  const isFinal = gameStatusDescription === "Final";
  const inProgress =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "End of Period";
  const isHalftime = gameStatusDescription === "Halftime";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const homeScore = isFinal ? props.homeScore : liveScore?.home.total ?? 0;
  const awayScore = isFinal ? props.awayScore : liveScore?.away.total ?? 0;

  const homeIsWinner = isFinal && props.homeScore > props.awayScore;
  const awayIsWinner = isFinal && props.awayScore > props.homeScore;
  // Compute values at top-level
  const awayDisplay = displayeValue(
    false,
    isScheduled,
    isFinal,
    awayIsWinner,
    awayRecord,
    awayScore,
    isDark,
  );
  const homeDisplay = displayeValue(
    true,
    isScheduled,
    isFinal,
    homeIsWinner,
    homeRecord,
    homeScore,
    isDark
  ); // fixed: used correct winner

  function formatQuarter(period: number) {
    if (period === 1) return "1st";
    if (period === 2) return "2nd";
    if (period === 3) return "3rd";
    if (period === 4) return "4th";
  }

  if (loading || scoreLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        {/* Away Team */}
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

        {/* Game Info */}
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
            <>
              <Text style={styles.finalText}>
                End of {formatQuarter(period)}
              </Text>
            </>
          )}
          {inProgress && !isHalftime && (
            <View style={styles.infoWrapper}>
              <Text style={styles.period}>{formatQuarter(period)}</Text>
              <View style={styles.divider} />
              <Text style={styles.clock}>{clock}</Text>
            </View>
          )}
          {isHalftime && (
            <>
              <Text style={styles.finalText}>Halftime</Text>
            </>
          )}
        </View>

        {/* Home Team */}
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

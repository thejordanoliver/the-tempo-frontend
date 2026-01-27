import CustomActivityIndicator from "components/CustomActivityIndicator";
import { useGameDetails } from "hooks/useGameDetails";
import { Image, Text, View, useColorScheme } from "react-native";
import { gameWidgetStyles } from "styles/ExploreStyles/GameWidgetStyles";
import { formatCBBQuarter } from "utils/games";
import displayeValue from "utils/widgetUtils";

export type CBBGameWidgetProps = {
  league: "CBB" | "WCBB";
  id: number;
  date: string;
  time: string;
  gameDateISO: string; // ✅ stable

  homeTeam: {
    id: number;
    wid?: number;
    espnID: string;
    name: string;
    code: string;
    logo: any;
    logoLight: any;
    wLogo?: any; // ✅ WCBB only
  };
  awayTeam: {
    id: number;
    wid?: number;
    espnID: string;
    name: string;
    code: string;
    logo: any;
    logoLight: any;
    wLogo?: any; // ✅ WCBB only
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
  isWomen?: boolean; // ✅ optional override
  loading: boolean;
};

export default function CBBGameWidget({
  height = 150,
  width = 150,
  isWomen: isWomenOverride,
  loading,
  ...props
}: CBBGameWidgetProps) {
  const isDark = useColorScheme() === "dark";
  const styles = gameWidgetStyles(isDark, height, width);

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

  const isWomen = isWomenOverride ?? props.league === "WCBB"; // use override if passed

  const detailsLeague = isWomen ? "wcbb" : "cbb";
  const {
    score: liveScore,
    details,
    loading: scoreLoading,
  } = useGameDetails(
    detailsLeague,
    String(props.homeTeam.espnID),
    String(props.awayTeam.espnID),
    props.gameDateISO
  );

  const homeLogo = isWomen
    ? isDark
      ? props.homeTeam.wLogo ?? props.homeTeam.logoLight
      : props.homeTeam.wLogo ?? props.homeTeam.logo
    : isDark
    ? props.homeTeam.logoLight
    : props.homeTeam.logo;

  const awayLogo = isWomen
    ? isDark
      ? props.awayTeam.wLogo ?? props.awayTeam.logoLight
      : props.awayTeam.wLogo ?? props.awayTeam.logo
    : isDark
    ? props.awayTeam.logoLight
    : props.awayTeam.logo;

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
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";
  const homeRank = details?.homeRank;
  const awayRank = details?.awayRank;
  const homeScore = liveScore?.home.total ?? props.homeScore ?? 0;
  const awayScore = liveScore?.away.total ?? props.awayScore ?? 0;

  const homeIsWinner = isFinal && homeScore > awayScore;
  const awayIsWinner = isFinal && awayScore > homeScore;
  // Compute values at top-level
  const awayDisplay = displayeValue(
    false,
    isScheduled,
    isFinal,
    awayIsWinner,
    awayRecord,
    awayScore,
    isDark
  );
  const homeDisplay = displayeValue(
    true,
    isScheduled,
    isFinal,
    homeIsWinner,
    homeRecord,
    homeScore,
    isDark
  );

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
            <Image style={styles.teamLogo} source={awayLogo} />
            <Text style={styles.teamName}>
              {awayRank && <Text style={styles.teamRank}>{awayRank} </Text>}
              {props.awayTeam.code}
            </Text>
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
                End of {formatCBBQuarter(period, isWomen)}
              </Text>
            </>
          )}
          {inProgress && !isHalftime && (
            <View style={styles.infoWrapper}>
              <Text style={styles.period}>{formatCBBQuarter(period)}</Text>
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
            <Image style={styles.teamLogo} source={homeLogo} />
            <Text style={styles.teamName}>
              {homeRank && <Text style={styles.teamRank}>{homeRank} </Text>}
              {props.homeTeam.code}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

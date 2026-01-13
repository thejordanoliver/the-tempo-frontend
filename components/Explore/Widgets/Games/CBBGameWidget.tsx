import CustomActivityIndicator from "components/CustomActivityIndicator";
import { useGameDetails } from "hooks/useGameDetails";
import { Image, Text, View, useColorScheme } from "react-native";
import { gameWidgetStyles } from "styles/Explore/GameWidgetStyles";
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
  loading: boolean,
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

  const isWomen = isWomenOverride ?? props.league === "WCBB"; // use override if passed

  const detailsLeague = isWomen ? "wcbb" : "cbb";
  const {
    score: liveScore,
    details,
   loading:  scoreLoading,
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

  const isFinal = gameStatusDescription === "Final";
  const inProgress = gameStatusDescription === "In Progress";
  const isHalftime = gameStatusDescription === "Halftime";

  const homeScore = liveScore?.home.total ?? props.homeScore ?? 0;
  const awayScore = liveScore?.away.total ?? props.awayScore ?? 0;

  const homeIsWinner = isFinal && homeScore > awayScore;
  const awayIsWinner = isFinal && awayScore > homeScore;

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
            <Image style={styles.teamLogo} source={awayLogo} />
            <Text style={styles.teamName}>{props.awayTeam.code}</Text>
          </View>
          <Text
            style={[
              styles.awayScore,
              isFinal && { opacity: awayIsWinner ? 1 : 0.5 },
            ]}
          >
            {awayScore}
          </Text>
        </View>

        {/* Game Info */}
        <View style={styles.gameInfo}>
          {isFinal && <Text style={styles.finalText}>{gameStatusDetail}</Text>}
          {inProgress && !isHalftime && (
            <>
              <Text style={styles.finalText}>{formatQuarter(period)}</Text>
              <View style={styles.divider} />
              <Text style={styles.finalText}>{clock}</Text>
            </>
          )}
          {inProgress && isHalftime && (
            <Text style={styles.finalText}>Halftime</Text>
          )}
        </View>

        {/* Home Team */}
        <View style={styles.homeSection}>
          <View style={styles.teamWrapper}>
            <Image style={styles.teamLogo} source={homeLogo} />
            <Text style={styles.teamName}>{props.homeTeam.code}</Text>
          </View>
          <Text
            style={[
              styles.homeScore,
              isFinal && { opacity: homeIsWinner ? 1 : 0.5 },
            ]}
          >
            {homeScore}
          </Text>
        </View>
      </View>
    </View>
  );
}

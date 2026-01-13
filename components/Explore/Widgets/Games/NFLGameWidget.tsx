import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { useNFLGamePossession } from "hooks/NFLHooks/useNFLGamePossession";
import { useNFLTeamRecord } from "hooks/NFLHooks/useNFLTeamRecord";
import { Image, Text, View, useColorScheme } from "react-native";
import { gameWidgetStyles } from "styles/Explore/GameWidgetStyles";
import displayeValue from "utils/widgetUtils";
export type FootballGameWidgetProps = {
  league: "NFL" | "CFB";
  id: number;
  date: string;
  time: string;
  gameDateISO: string; // ✅ stable

  homeTeam: {
    id: number;
    espnID: number;
    name: string;
    code: string;
    logo: any;
    logoLight: any;
  };
  awayTeam: {
    id: number;
    espnID: number;
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

export default function NFLGameWidget({
  height = 150,
  width = 150,
  loading,
  ...props
}: FootballGameWidgetProps) {
  const isDark = useColorScheme() === "dark";
  const styles = gameWidgetStyles(isDark, height, width);

  const gameDateStr = props.gameDateISO;

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

  const possession = useNFLGamePossession(
    props.homeTeam?.espnID,
    props.awayTeam?.espnID,
    gameDateStr
  );

  const homeRecord =
    useNFLTeamRecord(String(props.homeTeam?.espnID)).record.overall ?? "0-0";
  const awayRecord =
    useNFLTeamRecord(String(props.awayTeam?.espnID)).record.overall ?? "0-0";

  const scoreLoading = possession.loading;
  const period = possession.period;
  const displayClock = possession.displayClock;
  const downAndDistance = possession.downDistanceText;
  const isScheduled = possession.gameStatusDescription === "Scheduled";
  const isFinal = possession.gameStatusDescription === "Final";
  const inProgress =
    possession.gameStatusDescription === "In Progress" ||
    possession.gameStatusDescription === "End of Period";
  const isHalftime = possession.gameStatusDescription === "Halftime";
  const endOfPeriod = possession.gameStatusDescription === "End of Period";
  const possessingTeamId = possession.possessionTeamId;

  const homeHasPossession =
    possessingTeamId != null &&
    String(possessingTeamId) === String(props.homeTeam?.espnID);
  const awayHasPossession =
    possessingTeamId != null &&
    String(possessingTeamId) === String(props.awayTeam?.espnID);

  const homeScore = isFinal
    ? props.homeScore ?? 0
    : possession.score?.home.total ?? 0;
  const awayScore = isFinal
    ? props.awayScore ?? 0
    : possession.score?.away.total ?? 0;

  const homeIsWinner = isFinal && homeScore > awayScore;
  const awayIsWinner = isFinal && awayScore > homeScore;

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
  ); // fixed: used correct winner

  function formatQuarter(period: string) {
    if (period === "1") return "1st";
    if (period === "2") return "2nd";
    if (period === "3") return "3rd";
    if (period === "4") return "4th";
  }

  if (loading && scoreLoading) {
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
          <View style={styles.scorePossession}>
            {awayDisplay}
            {awayHasPossession && (
              <Image
                style={styles.awayPossession}
                source={isDark ? FootballLight : Football}
              />
            )}
          </View>
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
          {isFinal && (
            <View style={styles.infoWrapper}>
              <Text style={styles.finalText}>
                {possession.gameStatusShortDetail}
              </Text>
            </View>
          )}
          {inProgress && !isHalftime && endOfPeriod && (
            <>
              <Text style={styles.finalText}>
                End of {formatQuarter(period ?? "")}
              </Text>
            </>
          )}
          {inProgress && !isHalftime && !endOfPeriod && (
            <>
              <View style={styles.infoWrapper}>
                <Text style={styles.period}>{formatQuarter(period ?? "")}</Text>
                <View style={styles.divider} />
                <Text style={styles.finalText}>{displayClock}</Text>
              </View>
              <Text style={styles.downAndDistance}>{downAndDistance}</Text>
            </>
          )}
          {inProgress && isHalftime && (
            <>
              <Text style={styles.finalText}>Halftime</Text>
            </>
          )}
        </View>

        {/* Home Team */}
        <View style={styles.homeSection}>
          <View style={styles.homeSection}>
            <View style={styles.scorePossession}>
              {homeDisplay}
              {/* Home Team */}
              {homeHasPossession && (
                <Image
                  style={styles.homePossession}
                  source={isDark ? FootballLight : Football}
                />
              )}
            </View>
          </View>
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

import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { useFootballGameDetails } from "hooks/NFLHooks/useFootballGameDetails";
import { useFootballGamePossession } from "hooks/NFLHooks/useFootballGamePossesion";
import { Image, Text, View, useColorScheme } from "react-native";
import { gameWidgetStyles } from "styles/ExploreStyles/GameWidgetStyles";
import { formatQuarter } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import displayeValue from "utils/widgetUtils";

export type FootballGameWidgetProps = {
  league: "NFL" | "CFB";
  id: number;
  date: string;
  time: string;
  gameDateISO: string;

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
  height?: number;
  width?: number;
  loading: boolean;
};

export default function NFLGameWidget({
  height = 150,
  width = 150,
  loading,
  ...props
}: FootballGameWidgetProps) {
  // -------------------------
  // Appearance & styles
  // -------------------------
  const isDark = useColorScheme() === "dark";
  const styles = gameWidgetStyles(isDark, height, width);

  // -------------------------
  // Game date/time formatting
  // -------------------------
  const gameDate = new Date(props.gameDateISO);
  const localDate = gameDate.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
  });
  const localTime = gameDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const gameDateStr = props.gameDateISO;

  // -------------------------
  // Live game hooks
  // -------------------------
  const possession = useFootballGamePossession(
    props.homeTeam.espnID,
    props.awayTeam.espnID,
    gameDateStr,
    "nfl"
  );
  const { data: details } = useFootballGameDetails(
    String(props.homeTeam.espnID),
    String(props.awayTeam.espnID),
    gameDateStr,
    "nfl"
  );

  // -------------------------
  // Team records and broadcast
  // -------------------------
  const homeRecord = details?.homeRecords.total?.summary ?? "0-0";
  const awayRecord = details?.awayRecords.total?.summary ?? "0-0";
  const broadcast = getBroadcastDisplay(details?.broadcasts);

  // -------------------------
  // Game status flags
  // -------------------------
  const status = possession.gameStatusDescription;
  const isScheduled = status === "Scheduled";
  const isFinal = status === "Final";
  const inProgress = status === "In Progress" || status === "End of Period";
  const isHalftime = status === "Halftime";
  const endOfPeriod = status === "End of Period";

  // -------------------------
  // Possession info
  // -------------------------
  const possessingTeamId = possession.possessionTeamId;
  const homeHasPossession =
    possessingTeamId != null &&
    String(possessingTeamId) === String(props.homeTeam.espnID);
  const awayHasPossession =
    possessingTeamId != null &&
    String(possessingTeamId) === String(props.awayTeam.espnID);

  // -------------------------
  // Scores & winner determination
  // -------------------------
  const homeScore = isFinal
    ? props.homeScore ?? 0
    : possession.score?.home ?? 0;
  const awayScore = isFinal
    ? props.awayScore ?? 0
    : possession.score?.away ?? 0;
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
  if (loading && possession.loading) {
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

          {isFinal && (
            <View style={styles.infoWrapper}>
              <Text style={styles.finalText}>
                {possession.gameStatusShortDetail}
              </Text>
            </View>
          )}

          {inProgress && !isHalftime && endOfPeriod && (
            <Text style={styles.finalText}>
              End of {formatQuarter(possession.period ?? "")}
            </Text>
          )}

          {inProgress && !isHalftime && !endOfPeriod && (
            <>
              <View style={styles.infoWrapper}>
                <Text style={styles.period}>
                  {formatQuarter(possession.period ?? "")}
                </Text>
                <View style={styles.divider} />
                <Text style={styles.finalText}>{possession.displayClock}</Text>
              </View>
              {possession.downDistanceText && (
                <Text style={styles.downAndDistance}>
                  {possession.downDistanceText}
                </Text>
              )}
            </>
          )}

          {inProgress && isHalftime && (
            <Text style={styles.finalText}>Halftime</Text>
          )}

          {broadcast && <Text style={styles.broadcast}>{broadcast}</Text>}
        </View>

        {/* ---------------------- */}
        {/* Home Team Section */}
        {/* ---------------------- */}
        <View style={styles.homeSection}>
          <View style={styles.scorePossession}>
            {homeDisplay}
            {homeHasPossession && (
              <Image
                style={styles.homePossession}
                source={isDark ? FootballLight : Football}
              />
            )}
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

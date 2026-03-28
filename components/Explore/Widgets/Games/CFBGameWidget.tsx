import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";

import { useGameDetails } from "hooks/NFLHooks/useGameDetails";
import { Image, Text, View, useColorScheme } from "react-native";
import { gameWidgetStyles } from "styles/ExploreStyles/GameWidgetStyles";
import { Team } from "types/nfl";
import { getHolidayLabel } from "utils/dateUtils";
import { formatQuarter } from "utils/games";
import displayeValue from "utils/widgetUtils";

export type FootballGameWidgetProps = {
  league: "NFL" | "CFB";
  id: number;
  date: string;
  time: string;
  gameDateISO: string;
  homeTeam: Team;
  awayTeam: Team;
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
  const homeTeam = getCFBTeam(props?.homeTeam?.id);
  const awayTeam = getCFBTeam(props?.awayTeam?.id);
  const awayLogo = getCFBTeamLogo(props?.awayTeam?.id, isDark);
  const homeLogo = getCFBTeamLogo(props?.homeTeam?.id, isDark);
  const awayName = awayTeam?.code
  const homeName = homeTeam?.code
  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  const {
    details,
    score,
    loading: gameDetailsLoading,
  } = useGameDetails("cfb", homeEspnId, awayEspnId, gameDateStr);

  const gameStatusDescription = score?.gameStatusDescription ?? "";
  const gameStatusDetail = score?.gameStatusDetail ?? "";
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isHalftime = gameStatusDescription === "Halftime";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const endOfPeriod = gameStatusDescription === "End of Period";

  const displayClock = score?.displayClock;
  const period = score?.period;
  const redzone = score?.possession.isRedZone;
  const isRedzone = redzone;
  const headlineText = details?.headline;
  const broadcast = details?.broadcast ?? "";
  const downDistanceText = score?.possession.downDistanceText;
  const holidayLabel = getHolidayLabel(gameDate);
  const headline = headlineText ?? holidayLabel ?? "";
  const possessionTeamId = score?.possession.teamId;
  const homeRecord = details?.records.home.total.summary;
  const awayRecord = details?.records.away.total.summary;
  const homeScore = score?.home.total ?? 0;
  const awayScore = score?.away.total ?? 0;
  const football = isDark ? FootballLight : Football;

  const homeHasPossession =
    inProgress && possessionTeamId === props.homeTeam.espnID;
  const awayHasPossession =
    inProgress && possessionTeamId === props.awayTeam.espnID;

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
    isDark,
  );
  const awayDisplay = displayeValue(
    false,
    isScheduled,
    isFinal,
    awayIsWinner,
    awayRecord,
    awayScore,
    isDark,
  );

  // -------------------------
  // Loading state
  // -------------------------
  if (!details) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomActivityIndicator isDark={isDark} />
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
            <Image style={styles.teamLogo} source={awayLogo} />
            <Text style={styles.teamName}>{awayName}</Text>
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
              <Text style={styles.finalText}>{gameStatusDetail}</Text>
            </View>
          )}

          {inProgress && !isHalftime && endOfPeriod && (
            <Text style={styles.finalText}>End of {formatQuarter(period)}</Text>
          )}

          {inProgress && !isHalftime && !endOfPeriod && (
            <>
              <View style={styles.infoWrapper}>
                <Text style={styles.period}>{formatQuarter(period ?? "")}</Text>
                <View style={styles.divider} />
                <Text style={styles.finalText}>{displayClock}</Text>
              </View>
              {downDistanceText && (
                <Text style={styles.downAndDistance}>{downDistanceText}</Text>
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
            <Image style={styles.teamLogo} source={homeLogo} />
            <Text style={styles.teamName}>{homeName}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

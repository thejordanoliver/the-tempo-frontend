import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { globalStyles } from "constants/styles";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { useGameDetails } from "hooks/FootballHooks/useGameDetails";
import { Image, Text, View } from "react-native";
import {
  gameWidgetStyles,
  isSmallGameWidgetLayout,
} from "styles/ExploreStyles/GameWidgetStyles";
import { FootballGame } from "types/football";
import { getHolidayLabel } from "utils/dateUtils";
import { formatQuarter } from "utils/games";
import displayeValue from "utils/widgetUtils";

export type FootballGameWidgetProps = {
  league: "NFL" | "CFB";
  game: FootballGame;
  height?: number;
  width?: number;
  isDark: boolean;
  loading?: boolean;
};

export default function FootballGameWidget({
  game,
  league,
  height = 150,
  width = 150,
  loading = false,
  isDark,
}: FootballGameWidgetProps) {
  const styles = gameWidgetStyles(isDark, height, width);
  const isSmallLayout = isSmallGameWidgetLayout(height, width);
  const showHeadline = !isSmallLayout || height >= 170;
  const global = globalStyles(isDark);
  const isNFL = league === "NFL";

  // -------------------------
  // Game date/time formatting
  // -------------------------
  const gameDate = new Date(game?.game?.date?.date);
  const localDate = gameDate.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
  });
  const localTime = gameDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const gameDateStr = game?.game?.date?.date;
  const homeTeam = isNFL
    ? getNFLTeam(game?.teams?.home?.id)
    : getCFBTeam(game?.teams?.home?.id);
  const awayTeam = isNFL
    ? getNFLTeam(game?.teams?.away?.id)
    : getCFBTeam(game?.teams?.away?.id);
  const awayLogo = isNFL
    ? getNFLTeamLogo(game?.teams?.away?.id, isDark)
    : getCFBTeamLogo(game?.teams?.away?.id, isDark);
  const homeLogo = isNFL
    ? getNFLTeamLogo(game?.teams?.home?.id, isDark)
    : getCFBTeamLogo(game?.teams?.home?.id, isDark);
  const awayName = awayTeam?.code;
  const homeName = homeTeam?.code;
  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  const { details, score } = useGameDetails(
    isNFL ? "nfl" : "cfb",
    homeEspnId,
    awayEspnId,
    gameDateStr,
  );

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
  const showBroadcast = Boolean(broadcast) && (!isSmallLayout || height >= 180);
  const downDistanceText = score?.possession.downDistanceText;
  const holidayLabel = getHolidayLabel(gameDate);
  const headline = headlineText ?? holidayLabel ?? "";
  const possessionTeamId = score?.possession.teamId;
  const homeRecord = details?.records.home.total.summary;
  const awayRecord = details?.records.away.total.summary;
  const homeScore = score?.home.total ?? 0;
  const awayScore = score?.away.total ?? 0;
  const football = isDark ? FootballLight : Football;
  const homeRank = details?.homeRank;
  const awayRank = details?.awayRank;
  const isLoading = !score;

  const homeHasPossession =
    inProgress && possessionTeamId === game.teams.home.espnID;
  const awayHasPossession =
    inProgress && possessionTeamId === game.teams.away.espnID;

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
    height,
    width,
  );
  const awayDisplay = displayeValue(
    false,
    isScheduled,
    isFinal,
    awayIsWinner,
    awayRecord,
    awayScore,
    isDark,
    height,
    width,
  );

  // -------------------------
  // Loading state
  // -------------------------
  if (loading || isLoading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  const awayTeamContent = (
    <View style={styles.teamWrapper}>
      <Image style={styles.teamLogo} source={awayLogo} />
      <Text style={styles.teamName} numberOfLines={1}>
        {awayRank && <Text style={styles.teamRank}>{awayRank} </Text>}
        {awayName}
      </Text>
    </View>
  );

  const awayScoreContent = (
    <View style={styles.scorePossession}>
      {awayDisplay}
      {awayHasPossession && (
        <Image style={styles.awayPossession} source={football} />
      )}
    </View>
  );

  const homeTeamContent = (
    <View style={styles.teamWrapper}>
      <Image style={styles.teamLogo} source={homeLogo} />
      <Text style={styles.teamName} numberOfLines={1}>
        {homeRank && <Text style={styles.teamRank}>{homeRank} </Text>}
        {homeName}
      </Text>
    </View>
  );

  const homeScoreContent = (
    <View style={styles.scorePossession}>
      {homeDisplay}
      {homeHasPossession && (
        <Image style={styles.homePossession} source={football} />
      )}
    </View>
  );

  // -------------------------
  // Render widget
  // -------------------------
  return (
    <View style={styles.container}>
      {showHeadline && (
        <View style={styles.headlineContainer}>
          <Text style={styles.headline} numberOfLines={1}>
            {headline}
          </Text>
        </View>
      )}
      <View style={styles.wrapper}>
        {/* ---------------------- */}
        {/* Away Team Section */}
        {/* ---------------------- */}
        <View style={styles.awaySection}>
          {awayTeamContent}
          {awayScoreContent}
        </View>

        {/* ---------------------- */}
        {/* Game Info Section */}
        {/* ---------------------- */}

        <View style={styles.gameInfo}>
          {isScheduled && (
            <View style={styles.infoWrapper}>
              <Text style={styles.dateTime} numberOfLines={1}>
                {localDate}
              </Text>
              <View style={styles.divider} />
              <Text style={styles.dateTime} numberOfLines={1}>
                {localTime}
              </Text>
            </View>
          )}

          {isFinal && (
            <View style={styles.infoWrapper}>
              <Text style={styles.finalText} numberOfLines={1}>
                {gameStatusDetail}
              </Text>
            </View>
          )}

          {inProgress && !isHalftime && endOfPeriod && (
            <Text style={styles.finalText} numberOfLines={1}>
              End of {formatQuarter(period)}
            </Text>
          )}

          {inProgress && !isHalftime && !endOfPeriod && (
            <>
              <View style={styles.infoWrapper}>
                <Text style={styles.period} numberOfLines={1}>
                  {formatQuarter(period ?? "")}
                </Text>
                <View style={styles.divider} />
                <Text style={styles.finalText} numberOfLines={1}>
                  {displayClock}
                </Text>
              </View>
              {downDistanceText && (
                <Text style={styles.downAndDistance} numberOfLines={1}>
                  {downDistanceText}
                </Text>
              )}
            </>
          )}

          {inProgress && isHalftime && (
            <Text style={styles.finalText} numberOfLines={1}>
              Halftime
            </Text>
          )}

          {showBroadcast && (
            <Text style={styles.broadcast} numberOfLines={1}>
              {broadcast}
            </Text>
          )}
        </View>

        {/* ---------------------- */}
        {/* Home Team Section */}
        {/* ---------------------- */}
        <View style={styles.homeSection}>
          {isSmallLayout ? (
            <>
              {homeTeamContent}
              {homeScoreContent}
            </>
          ) : (
            <>
              {homeScoreContent}
              {homeTeamContent}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

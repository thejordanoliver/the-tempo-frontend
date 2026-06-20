import CustomActivityIndicator from "components/CustomActivityIndicator";
import { globalStyles } from "constants/styles";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { getCBBTeam, getCBBTeamLogo } from "constants/teamsCBB";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { Image, Text, View } from "react-native";
import {
  gameWidgetStyles,
  isSmallGameWidgetLayout,
} from "styles/ExploreStyles/GameWidgetStyles";
import { BasketballGame } from "types/basketball";
import { getHolidayLabel } from "utils/dateUtils";
import { formatPeriod, getBroadcastDisplay } from "utils/games";
import displayeValue from "utils/widgetUtils";

type GameWidgetProps = {
  game: BasketballGame;
  height?: number;
  width?: number;
  isDark: boolean;
  loading?: boolean;
  isWCBB?: boolean;
  isCBB?: boolean;
  isWNBA?: boolean;
};

export default function BasketballGameWidget({
  game,
  height = 150,
  width = 150,
  loading = false,
  isDark,
  isCBB,
  isWCBB,
  isWNBA,
}: GameWidgetProps) {
  const styles = gameWidgetStyles(isDark, height, width);
  const isSmallLayout = isSmallGameWidgetLayout(height, width);
  const showHeadline = !isSmallLayout || height >= 170;
  const global = globalStyles(isDark);

  const home = game.home;
  const away = game.away;

  const homeId = isWCBB ? (home.wid ?? 0) : home?.id;
  const awayId = isWCBB ? (away.wid ?? 0) : away?.id;

  const homeTeam = isCBB
    ? getCBBTeam(homeId, false)
    : isWCBB
      ? getCBBTeam(homeId, true)
      : isWNBA
        ? getWNBATeam(homeId)
        : getNBATeam(homeId);

  const awayTeam = isCBB
    ? getCBBTeam(awayId, false)
    : isWCBB
      ? getCBBTeam(awayId, true)
      : isWNBA
        ? getWNBATeam(awayId)
        : getNBATeam(awayId);

  const homeLogo = isWNBA
    ? getWNBATeamLogo(homeId, isDark)
    : isCBB
      ? getCBBTeamLogo(homeId, isDark, false)
      : isWCBB
        ? getCBBTeamLogo(homeId, isDark, true)
        : getTeamLogo(homeId, isDark);

  const awayLogo = isWNBA
    ? getWNBATeamLogo(awayId, isDark)
    : isCBB
      ? getCBBTeamLogo(awayId, isDark, false)
      : isWCBB
        ? getCBBTeamLogo(awayId, isDark, true)
        : getTeamLogo(awayId, isDark);

  const homeName = homeTeam?.code;
  const awayName = awayTeam?.code;

  const homeRank = home?.rank;
  const awayRank = away?.rank;

  const homeScore = home.score;
  const awayScore = away.score;

  const homeRecord = game.home.record ?? "0-0";
  const awayRecord = game.away.record ?? "0-0";

  const safeDate = (date?: string | null) => {
    if (!date) return new Date();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  };
  const gameDate = safeDate(game?.date);
  const holidayLabel = getHolidayLabel(gameDate);

  const period = formatPeriod({ period: game.status.period, isCBB: isCBB });
  const clock = game?.status.clock;

  const gameStatusDescription = game.status?.description;
  const gameStatusDetail = game.status?.shortDetail;
  const isFinal = gameStatusDescription === "Final";
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isHalftime = gameStatusDescription === "Halftime";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const headlineText = game?.headline;
  const headline = headlineText || holidayLabel;
  const broadcast = getBroadcastDisplay(game.broadcasts);
  const showBroadcast = Boolean(broadcast) && (!isSmallLayout || height >= 180);

  const formattedDate = gameDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const formattedTime =
    gameDate?.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) || "";

  // -----------------------------------------------------
  // SCORE TEXT COMPONENT
  // -----------------------------------------------------
  const homeWins = (homeScore ?? 0) > (awayScore ?? 0);
  const awayWins = (awayScore ?? 0) > (homeScore ?? 0);

  // -------------------------
  // Display components for scores
  // -------------------------
  const homeDisplay = displayeValue(
    true,
    isScheduled,
    isFinal,
    homeWins,
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
    awayWins,
    awayRecord,
    awayScore,
    isDark,
    height,
    width,
  );

  // -------------------------
  // Loading state
  // -------------------------
  if (loading) {
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
        <Text style={styles.teamName}>{awayRank} </Text>
        {awayName}
      </Text>
    </View>
  );

  const homeTeamContent = (
    <View style={styles.teamWrapper}>
      <Image style={styles.teamLogo} source={homeLogo} />
      <Text style={styles.teamName} numberOfLines={1}>
        <Text style={styles.teamName}>{homeRank} </Text>
        {homeName}
      </Text>
    </View>
  );

  const renderStatus = () => {
    if (inProgress)
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.period}>{period}</Text>
          <View style={styles.divider} />
          <Text style={styles.clock}>{clock}</Text>
        </View>
      );

    if (isDelayed || isCanceled || isPostponed || isForfeited)
      return <Text style={styles.finalText}>{gameStatusDescription}</Text>;

    if (isHalftime) return <Text style={styles.finalText}>Halftime</Text>;

    if (endOfPeriod) return <Text style={styles.clock}>End of {period}</Text>;

    if (isFinal)
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDetail}</Text>
          <View style={styles.finalDivder} />
          <Text style={styles.finalText}>{formattedDate}</Text>
        </View>
      );

    return (
      <View style={styles.infoWrapper}>
        <Text style={styles.dateTime}>{formattedDate}</Text>
        <View style={styles.divider} />
        <Text style={styles.dateTime}>{formattedTime}</Text>
      </View>
    );
  };

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
          {awayDisplay}
        </View>

        {/* ---------------------- */}
        {/* Game Info Section */}
        {/* ---------------------- */}
        {!isSmallLayout && (
          <View style={styles.gameInfo}>
            {renderStatus()}
            {showBroadcast && (
              <Text style={styles.broadcast} numberOfLines={1}>
                {broadcast}
              </Text>
            )}
          </View>
        )}

        {/* ---------------------- */}
        {/* Home Team Section */}
        {/* ---------------------- */}
        <View style={styles.homeSection}>
          {isSmallLayout ? (
            <>
              {homeTeamContent}
              {homeDisplay}
            </>
          ) : (
            <>
              {homeDisplay}
              {homeTeamContent}
            </>
          )}
        </View>
        {isSmallLayout && (
          <View style={styles.gameInfo}>
            {renderStatus()}
            {showBroadcast && (
              <Text style={styles.broadcast} numberOfLines={1}>
                {broadcast}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

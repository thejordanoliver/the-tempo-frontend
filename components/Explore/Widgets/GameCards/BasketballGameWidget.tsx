import CustomActivityIndicator from "components/CustomActivityIndicator";
import { globalStyles } from "constants/styles";
import { getTeamBySummerId, getTeamLogo } from "constants/teams";
import { getCBBTeam, getCBBTeamLogo } from "constants/teamsCBB";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { Image, Text, View } from "react-native";
import { gameWidgetStyles } from "styles/ExploreStyles/GameWidgetStyles";
import { BasketballGame } from "types/types";
import { getHolidayLabel } from "utils/dateUtils";
import { formatQuarter } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import displayeValue from "utils/widgetUtils";

type GameWidgetProps = {
  game: BasketballGame;
  height?: number;
  width?: number;
  isDark: boolean;
  loading?: boolean;
  league: "CBB" | "WCBB" | "WNBA" | "SL";
};

export default function BasketballGameWidget({
  game,
  league,
  height = 150,
  width = 150,
  loading = false,
  isDark,
}: GameWidgetProps) {
  const styles = gameWidgetStyles(isDark, height, width);
  const global = globalStyles(isDark);
  const homeId = Number(game?.teams.home?.id);
  const awayId = Number(game?.teams.away?.id);
  const isWNBA = league === "WNBA";
  const isWCBB = league === "WCBB";
  const isSL = league === "SL";
  const isLasVegas = game.league.id === 17;
  const detailLeague = isWNBA
    ? "wnba"
    : isWCBB
      ? "wcbb"
      : isSL && isLasVegas
        ? "summerVegas"
        : isSL && !isLasVegas
          ? "summerUtah"
          : "cbb";

  const home = isSL
    ? getTeamBySummerId(homeId)
    : isWNBA
      ? getWNBATeam(homeId)
      : isWCBB
        ? getCBBTeam(homeId, true)
        : getCBBTeam(homeId);
  const away = isSL
    ? getTeamBySummerId(awayId)
    : isWNBA
      ? getWNBATeam(awayId)
      : isWCBB
        ? getCBBTeam(awayId, true)
        : getCBBTeam(awayId);

  const homeName = home?.code;
  const awayName = away?.code;

  const homeLogo = isWNBA
    ? getWNBATeamLogo(homeId, isDark)
    : isSL
      ? getTeamLogo(homeId, isDark)
      : getCBBTeamLogo(homeId, isDark, isWCBB);

  const awayLogo = isWNBA
    ? getWNBATeamLogo(awayId, isDark)
    : isSL
      ? getTeamLogo(awayId, isDark)
      : getCBBTeamLogo(awayId, isDark, isWCBB);

  const homeEspnId = home?.espnID ?? 0;
  const awayEspnId = away?.espnID ?? 0;

  const safeDate = (date?: string | null) => {
    if (!date) return new Date();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  };
  const gameDate = safeDate(game?.date);
  const gameDateStr = gameDate.toISOString();
  const holidayLabel = getHolidayLabel(gameDate);

  const { score: liveScore, details } = useGameDetails(
    detailLeague,
    String(homeEspnId),
    String(awayEspnId),
    gameDateStr,
  );

  const period = liveScore?.period;
  const displayClock = liveScore?.displayClock;
  const homeScore = liveScore?.home.total;
  const awayScore = liveScore?.away.total;
  const gameStatusDescription = liveScore?.gameStatusDescription;
  const gameStatusDetail = liveScore?.gameStatusDetail;
  const isFinal = gameStatusDescription === "Final";
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isHalftime = gameStatusDescription === "Halftime";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const headlineText = details?.headline;
  const headline = headlineText || holidayLabel;
  const isLoading = !liveScore;
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";

  // --- Broadcasts ---
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);

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
  );
  const awayDisplay = displayeValue(
    false,
    isScheduled,
    isFinal,
    awayWins,
    awayRecord,
    awayScore,
    isDark,
  );

  // -------------------------
  // Loading state
  // -------------------------
  if (loading || isLoading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator isDark={isDark} />
      </View>
    );
  }

  // -------------------------
  // Render widget
  // -------------------------
  return (
    <View style={styles.container}>
      <View style={styles.headlineContainer}>
        <Text style={styles.headline}>{headline}</Text>
      </View>
      <View style={styles.wrapper}>
        {/* ---------------------- */}
        {/* Away Team Section */}
        {/* ---------------------- */}
        <View style={styles.awaySection}>
          <View style={styles.teamWrapper}>
            <Image style={styles.teamLogo} source={awayLogo} />
            <Text style={styles.teamName}>{awayName}</Text>
          </View>
          {awayDisplay}
        </View>

        {/* ---------------------- */}
        {/* Game Info Section */}
        {/* ---------------------- */}
        <View style={styles.gameInfo}>
          {isScheduled && (
            <View style={styles.infoWrapper}>
              <Text style={styles.dateTime}>{formattedDate}</Text>
              <View style={styles.divider} />
              <Text style={styles.dateTime}>{formattedTime}</Text>
            </View>
          )}

          {isFinal && <Text style={styles.finalText}>{gameStatusDetail}</Text>}

          {isPostponed && (
            <Text style={styles.finalText}>{gameStatusDescription}</Text>
          )}
          {isCanceled && (
            <Text style={styles.finalText}>{gameStatusDescription}</Text>
          )}
          {isDelayed && (
            <Text style={styles.finalText}>{gameStatusDescription}</Text>
          )}
          {isForfeited && (
            <Text style={styles.finalText}>{gameStatusDescription}</Text>
          )}

          {inProgress && !isHalftime && endOfPeriod && (
            <Text style={styles.finalText}>End of {formatQuarter(period)}</Text>
          )}

          {inProgress && !isHalftime && !endOfPeriod && (
            <View style={styles.infoWrapper}>
              <Text style={styles.period}>{formatQuarter(period)}</Text>
              <View style={styles.divider} />
              {displayClock && <Text style={styles.clock}>{displayClock}</Text>}
            </View>
          )}

          {isHalftime && <Text style={styles.finalText}>Halftime</Text>}
          {broadcastText && (
            <Text style={styles.broadcast}>{broadcastText}</Text>
          )}
        </View>

        {/* ---------------------- */}
        {/* Home Team Section */}
        {/* ---------------------- */}
        <View style={styles.homeSection}>
          {homeDisplay}
          <View style={styles.teamWrapper}>
            <Image style={styles.teamLogo} source={homeLogo} />
            <Text style={styles.teamName}>{homeName}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

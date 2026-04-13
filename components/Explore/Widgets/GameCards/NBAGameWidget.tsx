import CustomActivityIndicator from "components/CustomActivityIndicator";
import { globalStyles } from "constants/styles";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { Image, Text, View } from "react-native";
import { gameWidgetStyles } from "styles/ExploreStyles/GameWidgetStyles";
import { PlayerLeader } from "types/playerLeader";
import { Game } from "types/types";
import { getHolidayLabel } from "utils/dateUtils";
import { formatQuarter } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import displayeValue from "utils/widgetUtils";
import PlayerItem from "../Players/PlayerItem";
import { useNBAWidgetLeaders } from "hooks/NBAHooks/useNBAWidgetLeaders";

type GameWidgetProps = {
  game: Game;
  height?: number;
  width?: number;
  loading?: boolean;
  isDark: boolean;
  showPlayers?: boolean; // ← add
};

export default function NBAGameWidget({
  game,
  height = 150,
  width = 150,
  loading = false,
  isDark,
  showPlayers = false,
}: GameWidgetProps) {
  const styles = gameWidgetStyles(isDark, height, width);
  const global = globalStyles(isDark);
  const homeId = Number(game?.home?.id);
  const awayId = Number(game?.away?.id);

  const home = getNBATeam(homeId);
  const away = getNBATeam(awayId);

  const homeName = home?.code;
  const awayName = away?.code;

  const homeLogo = getTeamLogo(homeId, isDark);
  const awayLogo = getTeamLogo(awayId, isDark);

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
    "nba",
    String(homeEspnId),
    String(awayEspnId),
    gameDateStr,
  );

    const { leaders } = useNBAWidgetLeaders(
    String(game.id),
    homeId,
    awayId,
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
      {/* ---------------------- */}
      {/* Inline Player Leaders  */}
      {/* ---------------------- */}
      {showPlayers && !isScheduled && leaders.length > 0 && (
        <View style={styles.leadersContainer}>
          {leaders.map((player, index) => (
            <PlayerItem
              key={`${player.id}-${player.leaderStat?.name ?? index}`} // ← composite key
              id={player.id}
              firstName={player.firstName}
              lastName={player.lastName}
              headshot={player.headshot_url}
              jerseyNumber={player.jersey_number}
              team={player.team}
              stats={[
                {
                  label: player.leaderStat?.name ?? "",
                  value: player.leaderStat?.value ?? 0,
                },
              ]}
              isLast={index === leaders.length - 1}
              width={width}
              height={40}
            />
          ))}
        </View>
      )}
    </View>
  );
}

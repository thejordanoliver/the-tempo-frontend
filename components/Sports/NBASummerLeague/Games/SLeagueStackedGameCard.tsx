import { Colors } from "constants/styles";
import { getTeamBySummerId, getTeamLogo } from "constants/teams";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { StackedGameCardStyles } from "styles/GamecardStyles/StackedGameCardStyles";
import { SummerGame } from "types/types";
import { getHolidayLabel } from "utils/dateUtils";
import { formatQuarter } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";

export default function SLStackedGameCard({ game }: { game: SummerGame }) {
  const isDark = useColorScheme() === "dark";
  const router = useRouter();

  const homeId = Number(game.teams.home?.id);
  const awayId = Number(game.teams.away?.id);

  const home = getTeamBySummerId(homeId);
  const away = getTeamBySummerId(awayId);

  const homeName = home?.name;
  const awayName = away?.name;

  const homeLogo = getTeamLogo(home?.id, isDark);
  const awayLogo = getTeamLogo(away?.id, isDark);

  const homeEspnId = home?.espnID ?? 0;
  const awayEspnId = away?.espnID ?? 0;

  const safeDate = (date?: string | null) => {
    if (!date) return new Date();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const gameDate = safeDate(game.date);
  const gameDateStr = gameDate.toISOString();

  const holidayLabel = getHolidayLabel(gameDate);
  const styles = StackedGameCardStyles(isDark);

  const isLasVegas = game.league.id === 17;
  const detailsLeague = isLasVegas ? "summerVegas" : "summerUtah";

  const { score: liveScore, details } = useGameDetails(
    detailsLeague,
    String(homeEspnId),
    String(awayEspnId),
    gameDateStr,
  );

  const period = liveScore?.period;
  const displayClock = liveScore?.displayClock;
  const homeScore = liveScore?.home.total ?? game.scores.away.total ?? 0;
  const awayScore = liveScore?.away.total ?? game.scores.away.total ?? 0;
  const gameStatusDescription = liveScore?.gameStatusDescription;
  const gameStatusDetail = liveScore?.gameStatusDetail;
  const isFinal =
    gameStatusDescription != null
      ? gameStatusDescription === "Final"
      : game.status.short === "FT";
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
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";
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
  const isTie = (awayScore ?? 0) === (homeScore ?? 0);

  const winnerStyle = (teamWins: boolean) => ({
    color: isDark ? Colors.white : Colors.black,
    opacity: isFinal ? (isTie ? 1 : teamWins ? 1 : 0.5) : 1,
  });

  const ScoreText = ({
    score,
    record,
    teamWins,
  }: {
    score: number | undefined;
    record: string | undefined;
    teamWins: boolean;
  }) => {
    const showRecord = isScheduled || isCanceled || isPostponed || isDelayed;

    return (
      <Text
        style={
          showRecord
            ? styles.teamRecord
            : [styles.teamScore, winnerStyle(teamWins)]
        }
      >
        {showRecord ? record : score}
      </Text>
    );
  };

  const renderStatus = () => {
    if (inProgress)
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.period}>{formatQuarter(period)}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.clock}>{displayClock}</Text>
        </View>
      );

    if (isDelayed) return <Text style={styles.finalText}>Delayed</Text>;
    if (isHalftime) return <Text style={styles.finalText}>Halftime</Text>;
    if (isCanceled) return <Text style={styles.finalText}>Canceled</Text>;
    if (isPostponed) return <Text style={styles.finalText}>Postponed</Text>;
    if (isForfeited) return <Text style={styles.finalText}>Forfeited</Text>;

    if (endOfPeriod)
      return <Text style={styles.clock}>End of {formatQuarter(period)}</Text>;

    if (isFinal)
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDetail}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{formattedDate}</Text>
        </View>
      );

    return (
      <View style={styles.infoWrapper}>
        <Text style={styles.date}>{formattedDate}</Text>
        <View style={styles.statusDivider} />
        <Text style={styles.date}>{formattedTime}</Text>
      </View>
    );
  };

  const renderCardContent = () => (
    <>
      <View style={styles.cardWrapper}>
        {/* Away Team */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Image
              source={awayLogo}
              style={styles.logo}
              accessibilityLabel={`${awayName} logo`}
            />
            <Text style={styles.teamName}>{awayName}</Text>
          </View>
          {/* Away Score / Record */}
          <ScoreText
            score={awayScore}
            record={awayRecord}
            teamWins={awayWins}
          />
        </View>

        {/* Home Team */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Image
              source={homeLogo}
              style={styles.logo}
              accessibilityLabel={`${homeName} logo`}
            />
            <Text style={styles.teamName}>{homeName}</Text>
          </View>

          {/* Home Score / Record */}
          <ScoreText
            score={homeScore}
            record={homeRecord}
            teamWins={homeWins}
          />
        </View>
      </View>
      {/* headlineText */}
      <Text style={[styles.headlineText]}>{headline}</Text>

      {/* Game Info */}
      <View style={styles.info}>
        {renderStatus()}
        {!isFinal && broadcastText && (
          <Text style={styles.broadcast}>{broadcastText}</Text>
        )}
      </View>
    </>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/game/[game]",
          params: { game: JSON.stringify(game) },
        })
      }
    >
      <View style={styles.card}>{renderCardContent()}</View>
    </TouchableOpacity>
  );
}

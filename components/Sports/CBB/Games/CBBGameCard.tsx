import { Colors } from "constants/Styles";
import { getTeamInfo, getTeamLogo } from "constants/teamsCBB";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { memo, useCallback, useMemo } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { GameCardStyles } from "styles/GamecardStyles/GameCardStyles";
import { CBBGame } from "types/types";
import { formatCBBQuarter } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";

function CBBGameCard({
  game,
  isWomen = false,
}: {
  game: CBBGame;
  isWomen?: boolean; // 👈 NEW
}) {
  const isDark = useColorScheme() === "dark";
  const router = useRouter();

  const detailsLeague = isWomen ? "wcbb" : "cbb";

  const homeId = game?.teams?.home?.id;
  const awayId = game?.teams?.away?.id;

  const home = getTeamInfo(homeId, isWomen);
  const away = getTeamInfo(awayId, isWomen);

  const homeName = home?.shortName ?? home?.name ?? game?.teams?.home.name;
  const awayName = away?.shortName ?? away?.name ?? game?.teams?.away.name;

  const homeLogo = getTeamLogo(homeId, isDark);
  const awayLogo = getTeamLogo(awayId, isDark);

  const homeEspnId = home?.espnID ?? 0;
  const awayEspnId = away?.espnID ?? 0;

  // --- Date ---
  const gameDate = game?.timestamp
    ? new Date(game.timestamp * 1000)
    : game?.date
      ? new Date(game.date)
      : null;

  const gameDateStr = gameDate ? gameDate.toISOString().split("T")[0] : "";

  const { score: liveScore, details } = useGameDetails(
    detailsLeague,
    String(homeEspnId),
    String(awayEspnId),
    gameDateStr,
  );

  // --- Game status ---
  const gameStatusDescription = liveScore?.gameStatusDescription;
  const gameStatusDetail = liveScore?.gameStatusDetail;
  const isScheduled = gameStatusDescription === "Scheduled";
  const isHalftime = gameStatusDescription === "Halftime";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const period = liveScore?.period ?? game.status.long ?? "";
  const displayClock = liveScore?.displayClock ?? game.status.timer ?? "0:00";
  const inProgress = gameStatusDescription === "In Progress";

  // --- Team Rankings ---
  const homeRank = details?.homeRank;
  const awayRank = details?.awayRank;

  const headlineText = details?.headline;
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";
  const homeScore = liveScore?.home.total ?? game.scores?.home?.total ?? 0;
  const awayScore = liveScore?.away.total ?? game.scores?.away?.total ?? 0;

  const isChampionship = isWomen
    ? headlineText === "Women's Basketball Championship - National Championship"
    : headlineText === "Men's Basketball Championship - National Championship";

  const styles = GameCardStyles(isDark, isChampionship);

  const handlePress = useCallback(() => {
    router.push({
      pathname: "/game/cbb/[game]",
      params: { game: JSON.stringify(game) },
    });
  }, [router, game]);

  // --- Broadcasts ---
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);

  const { formattedDate, formattedTime } = useMemo(() => {
    if (!gameDate) return { formattedDate: "", formattedTime: "" };

    return {
      formattedDate: gameDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      formattedTime: gameDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  }, [gameDate]);

  const homeWins = (homeScore ?? 0) > (awayScore ?? 0);
  const awayWins = (awayScore ?? 0) > (homeScore ?? 0);
  const isTie = (awayScore ?? 0) === (homeScore ?? 0);

  const winnerStyle = (teamWins: boolean) => ({
    color: isDark ? Colors.white : Colors.black,
    opacity: isFinal || isForfeited ? (isTie ? 1 : teamWins ? 1 : 0.5) : 1,
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
          <Text style={styles.period}>{formatCBBQuarter(period, isWomen)}</Text>
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
      return (
        <Text style={styles.clock}>
          End of {formatCBBQuarter(period, isWomen)}
        </Text>
      );

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
      {/* Away Team */}
      <View style={styles.teamSection}>
        <Image
          source={awayLogo}
          style={[styles.logo]}
          accessibilityLabel={`${awayName} logo`}
        />
        <Text style={styles.teamName}>
          {awayRank && <Text style={styles.rank}>{awayRank} </Text>}
          {awayName}
        </Text>
      </View>
      <ScoreText score={awayScore} record={awayRecord} teamWins={awayWins} />

      {/* headlineText */}
      <Text style={[styles.headlineText]}>{headlineText}</Text>

      {/* Center Info */}
      <View style={styles.info}>
        {renderStatus()}
        {!isFinal && broadcastText && (
          <Text style={styles.broadcast}>{broadcastText}</Text>
        )}
      </View>

      {/* Home Team */}
      <ScoreText score={homeScore} record={homeRecord} teamWins={homeWins} />

      <View style={styles.teamSection}>
        <Image
          source={homeLogo}
          style={[styles.logo]}
          accessibilityLabel={`${homeName} logo`}
        />
        <Text style={styles.teamName}>
          {homeRank && <Text style={styles.rank}>{homeRank} </Text>}
          {homeName}
        </Text>
      </View>
    </>
  );

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
      {isChampionship ? (
        <LinearGradient
          colors={
            isDark
              ? ["#846f4a", "#50412a"]
              : (["#dbb145ff", "#CDA765"] as [string, string])
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.card}
        >
          {renderCardContent()}
        </LinearGradient>
      ) : (
        <View style={styles.card}>{renderCardContent()}</View>
      )}
    </TouchableOpacity>
  );
}
export default memo(CBBGameCard);

import { Colors } from "constants/styles";
import { getNHLTeam } from "constants/teamsNHL";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useHockeyDetails } from "hooks/NHLHooks/useHockeyGameDetails";
import { memo } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { StackedGameCardStyles } from "styles/GamecardStyles/StackedGameCardStyles";
import { NHLGame } from "types/nhl";
import { formatNHLQuarter } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { getGameDate } from "utils/nflGameCardUtils";
type Props = {
  game: NHLGame; // Your API Game shape
};

function NHLStackedGameCard({ game }: Props) {
  const isDark = useColorScheme() === "dark";
  const router = useRouter();

  /* ===============================
     DATE / TIME
  =============================== */
  const timestamp = game?.timestamp;

  const {
    date: gameDate,
    iso: gameDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(timestamp);

  /* ===============================
     BASIC GAME FIELDS FROM API
  =============================== */
  const home = game?.teams?.home;
  const away = game?.teams?.away;

  // Find matching internal teams using ESPN ID
  const homeTeam = getNHLTeam(home?.id);
  const awayTeam = getNHLTeam(away?.id);

  const homeName = homeTeam?.fullName;
  const awayName = awayTeam?.fullName;

  const homeLogo = isDark ? homeTeam?.logoLight : homeTeam?.logo;
  const awayLogo = isDark ? awayTeam?.logoLight : awayTeam?.logo;

  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  const { score: liveScore, details } = useHockeyDetails(
    "nhl",
    String(awayEspnId),
    String(homeEspnId),
    gameDateStr,
  );
  const isChampionship = game.week === "Final";
  const styles = StackedGameCardStyles(isDark, isChampionship);

  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);

  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const period = liveScore?.period;
  const headlineText = details?.headline;
  const homeScore = liveScore?.home?.total ?? game?.scores?.home ?? 0;
  const awayScore = liveScore?.away?.total ?? game?.scores?.away ?? 0;
  const homeRecord = details?.records?.home?.overall ?? "0-0";
  const awayRecord = details?.records?.away?.overall ?? "0-0";
  const displayClock = liveScore?.displayClock;
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
          <Text style={styles.period}>{formatNHLQuarter(period)}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.clock}>{displayClock}</Text>
        </View>
      );

    if (isDelayed) return <Text style={styles.finalText}>Delayed</Text>;
    if (isCanceled) return <Text style={styles.finalText}>Canceled</Text>;
    if (isPostponed) return <Text style={styles.finalText}>Postponed</Text>;
    if (isForfeited) return <Text style={styles.finalText}>Forfeited</Text>;

    if (endOfPeriod)
      return (
        <Text style={styles.clock}>End of {formatNHLQuarter(period)}</Text>
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

      {/* Game Info */}
      <View style={styles.info}>
        {renderStatus()}
        {!isFinal && broadcastText && (
          <Text style={styles.broadcast}>{broadcastText}</Text>
        )}
      </View>

      {/* headlineText */}
      <Text style={[styles.headlineText]}>{headlineText}</Text>
    </>
  );

  /* ===============================
     RENDER
  =============================== */
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/game/nhl/[game]",
          params: { game: JSON.stringify(game) },
        })
      }
    >
      {isChampionship ? (
        <LinearGradient
          colors={
            isDark
              ? ["#846f4a", "#50412a"]
              : ([Colors.dark.gold, Colors.dark.gold] as [string, string])
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

export default memo(NHLStackedGameCard);

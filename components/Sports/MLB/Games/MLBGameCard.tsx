import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { getMLBTeam } from "constants/teamsMLB";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useBaseballGameDetails } from "hooks/MLBHooks/useBaseballGameDetails";
import { memo } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { GameCardStyles } from "styles/GamecardStyles/GameCardStyles";
import { MLBGame } from "types/mlb";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { getGameDate } from "utils/nflGameCardUtils";
import BasesIndicator from "../GameDetails/BasesIndicator";

type Props = {
  game: MLBGame; // Your API Game shape
};

function MLBGameCard({ game }: Props) {
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
  const home = game?.teams.home;
  const away = game?.teams.away;

  // Find matching internal teams using ESPN ID
  const homeTeam = getMLBTeam(home?.id);
  const awayTeam = getMLBTeam(away?.id);

  const homeName = homeTeam?.name;
  const awayName = awayTeam?.name;

  const homeLogo = isDark ? homeTeam?.logoLight : homeTeam?.logo;
  const awayLogo = isDark ? awayTeam?.logoLight : awayTeam?.logo;
  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  const { score: liveScore, details } = useBaseballGameDetails(
    "mlb",
    String(awayEspnId),
    String(homeEspnId),
    gameDateStr,
  );
  const isChampionship = details?.playoffRound === "World Series";
  const styles = GameCardStyles(isDark, isChampionship);
  const isSpringTraining = game.league.name === "MLB - Spring Training";
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const headline = details?.headline;
  const seriesSummary = details?.seriesSummary;
  const seasonState = details?.seasonState;
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.statusText ?? "";
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const endOfInning = gameStatusDescription === "End of Inning";
  const headlineText = details?.headline;
  const homeScore = liveScore?.home.total ?? game?.scores?.home?.total ?? 0;
  const awayScore = liveScore?.away.total ?? game?.scores?.away?.total ?? 0;
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";
  const isPostSeason = details?.isPostseason;
  const isTopInning = gameStatusDetail.includes("Top");
  const outs = liveScore?.outs;
  const bases: { first: boolean; second: boolean; third: boolean } =
    liveScore?.bases ?? {
      first: false,
      second: false,
      third: false,
    };
  const filteredHeadline =
    headlineText && !headlineText.toLowerCase().includes("final")
      ? headline
      : null;

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
        <>
          <View style={styles.infoWrapper}>
            <Ionicons
              name={isTopInning ? "caret-up" : "caret-down"}
              size={14}
              color={isDark ? Colors.white : Colors.black}
            />

            <Text style={styles.period}>{gameStatusDetail}</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.outs}>Outs: {outs}</Text>
          </View>
          <BasesIndicator bases={bases} isDark={isDark} size={8} />
        </>
      );

    if (isDelayed) return <Text style={styles.finalText}>Delayed</Text>;
    if (isCanceled) return <Text style={styles.finalText}>Canceled</Text>;
    if (isPostponed) return <Text style={styles.finalText}>Postponed</Text>;
    if (isForfeited) return <Text style={styles.finalText}>Forfeited</Text>;

    if (endOfInning)
      return <Text style={styles.clock}>{gameStatusDetail}</Text>;

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
          style={styles.logo}
          accessibilityLabel={`${awayName} logo`}
        />
        <Text style={styles.teamName}>{awayName}</Text>
      </View>
      {/* Away Score / Record */}
      <ScoreText score={awayScore} record={awayRecord} teamWins={awayWins} />

      {/* headlineText */}
      <View style={styles.headlineContainer}>
        <Text style={[styles.headlineText]}>{headline}</Text>
      </View>

      {/* Game Info */}
      <View style={styles.info}>
        {renderStatus()}
        {!isFinal && broadcastText && (
          <Text style={styles.broadcast}>{broadcastText}</Text>
        )}
      </View>

      {/* Home Score / Record */}
      <ScoreText score={homeScore} record={homeRecord} teamWins={homeWins} />

      {/* Home Team */}
      <View style={styles.teamSection}>
        <Image
          source={homeLogo}
          style={styles.logo}
          accessibilityLabel={`${homeName} logo`}
        />
        <Text style={styles.teamName}>{homeName}</Text>
      </View>
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
          pathname: "/game/mlb/[game]",
          params: { game: JSON.stringify(game) },
        })
      }
    >
      {isChampionship ? (
        <LinearGradient
          colors={
            isDark
              ? ["#846f4a", "#50412a"]
              : (["#DFBD69", "#CDA765"] as [string, string])
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

export default memo(MLBGameCard);

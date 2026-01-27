import { Colors } from "constants/Colors";
import { getMLBTeam } from "constants/teamsMLB";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameDetails } from "hooks/MLBHooks/useBaseballGameDetails";
import { useTeamRecord } from "hooks/MLBHooks/useTeamRecords";
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

type Props = {
  game: MLBGame; // Your API Game shape
  isDark?: boolean;
};

// Maps MLB API status codes to readable display text
const formatMLBStatus = (statusObj: any) => {
  if (!statusObj) return "";

  const short = statusObj.short;
  const long = statusObj.long ?? "";
  const inning = statusObj.inning ?? null;

  switch (short) {
    case "NS":
      return "Not Started";

    case "FT":
      return "Final";

    case "POST":
      return "Postponed";

    case "CANC":
      return "Canceled";

    case "INTR":
      return "Delayed";

    case "ABD":
      return "Abandoned";

    default:
      break;
  }

  return long || short || "";
};

function MLBGameCard({ game, isDark }: Props) {
  const colorScheme = useColorScheme();
  const dark = isDark ?? colorScheme === "dark";
  const router = useRouter();

  /* ===============================
     DATE / TIME
  =============================== */
  const timestamp = game?.date?.timestamp;

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
  const homeTeam = getMLBTeam(home?.id);
  const awayTeam = getMLBTeam(away?.id);

  const homeTeamLogo = isDark ? homeTeam?.logoLight : homeTeam?.logo;
  const awayTeamLogo = isDark ? awayTeam?.logoLight : awayTeam?.logo;

  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  const { record: homeRecord } = useTeamRecord(Number(homeEspnId), "mlb");
  const { record: awayRecord } = useTeamRecord(Number(awayEspnId), "mlb");

  const { score: liveScore, details } = useGameDetails(
    "mlb",
    String(awayEspnId),
    String(homeEspnId),
    gameDateStr
  );
  const isChampionship = details?.playoffRound === "World Series";
  const styles = GameCardStyles(dark, isChampionship);

  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const headline = details?.headline;
  const seriesSummary = details?.seriesSummary;
  const seasonState = details?.seasonState;
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const headlineText = details?.headline;
  const homeScore = liveScore?.home.total ?? game?.scores?.home?.total ?? 0;
  const awayScore = liveScore?.away.total ?? game?.scores?.away?.total ?? 0;

  /* ===============================
     WIN/LOSS STYLE
  =============================== */
  const getTeamStyle = (isHome: boolean) => {
    if (!isFinal)
      return { color: dark ? Colors.white : Colors.black, opacity: 1 };

    const winnerIsHome = homeScore > awayScore;
    const winner = isHome ? winnerIsHome : !winnerIsHome;

    return {
      color: dark ? Colors.white : Colors.black,
      opacity: winner ? 1 : 0.5,
    };
  };

  const filteredHeadline =
    headlineText && !headlineText.toLowerCase().includes("final") ? headline : null;

  const renderHeadline = () => (
    <>
      {seasonState === "post-season" ? (
        <View style={styles.headlineContainer}>
          {seriesSummary ? (
            <Text style={styles.mlbHeadlineText}>{seriesSummary}</Text>
          ) : null}
        </View>
      ) : filteredHeadline ? (
        <View style={styles.headlineContainer}>
          <Text style={styles.mlbHeadlineText}>{filteredHeadline}</Text>
        </View>
      ) : null}
    </>
  );

  const renderCardContent = () => (
    <>
      {/* Away Team */}
      <View style={styles.teamSection}>
        <Image source={awayTeamLogo} style={styles.logo} />
        <Text style={styles.teamName}>{awayTeam?.name ?? away?.name}</Text>
      </View>

      {/* Away Score / Record */}
      <Text
        style={[
          isScheduled ? styles.teamRecord : styles.teamScore,
          getTeamStyle(false),
        ]}
      >
        {isScheduled ? awayRecord.overall ?? "0-0" : awayScore}
      </Text>

      {renderHeadline()}
      {/* Center Game Info */}
      <View style={styles.info}>
        {isScheduled ? (
          <View style={styles.infoWrapper}>
            <Text style={styles.date}>{formattedDate}</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.date}>{formattedTime}</Text>
          </View>
        ) : isFinal ? (
          <View style={styles.infoWrapper}>
            <Text style={styles.finalText}>{gameStatusDetail}</Text>
            <View style={styles.finalStatusDivider} />
            <Text style={styles.finalText}>{formattedDate}</Text>
            <Text style={styles.broadcast}>{broadcastText}</Text>
          </View>
        ) : isCanceled ? (
          <View style={styles.infoWrapper}>
            <Text style={styles.finalText}>{gameStatusDescription}</Text>
          </View>
        ) : (
          <View style={styles.infoWrapper}>
            <Text style={styles.date}>{gameStatusDetail}</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.clock}>{formattedDate}</Text>
          </View>
        )}
      </View>

      {/* Home Score / Record */}
      <Text
        style={[
          isScheduled ? styles.teamRecord : styles.teamScore,
          getTeamStyle(true),
        ]}
      >
        {isScheduled ? homeRecord.overall ?? "0-0" : homeScore}
      </Text>

      {/* Home Team */}
      <View style={styles.teamSection}>
        <Image source={homeTeamLogo} style={styles.logo} />
        <Text style={styles.teamName}>{homeTeam?.name ?? homeTeam?.name}</Text>
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

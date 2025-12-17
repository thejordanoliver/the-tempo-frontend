import { Colors } from "constants/Colors";
import { getMLBTeam } from "constants/teamsMLB";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameDetails } from "hooks/MLBHooks/useGameDetails";
import { useTeamRecord } from "hooks/MLBHooks/useTeamRecords";
import { memo } from "react";

import {
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { getStyles } from "styles/GamecardStyles/GameCardStyles";
import { MLBGame } from "types/mlb";

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
  const gameDate = timestamp ? new Date(timestamp * 1000) : null;
  const normalizedDate = game?.date
    ? {
        utc: game.date.utc || undefined,
        timestamp: game.date.timestamp || undefined,
      }
    : undefined;

  const formattedDate = gameDate
    ? gameDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  const formattedTime = gameDate
    ? gameDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  /* ===============================
     BASIC GAME FIELDS FROM API
  =============================== */
  const home = game?.teams?.home;
  const away = game?.teams?.away;

  // Find matching internal teams using ESPN ID
  const homeTeam = getMLBTeam(home?.id);
  const awayTeam = getMLBTeam(away?.id);

  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  const { record: homeRecord } = useTeamRecord(Number(homeEspnId), "mlb");
  const { record: awayRecord } = useTeamRecord(Number(awayEspnId), "mlb");

  const {
    headline,
    gameNote,
    seasonState,
    seriesSummary,
    playoffRound,
    isPostseason,
    officials,
    injuries,
    highlights,
    plays,
    lineScore,
    venue,
    attendance,
    neutralSite,
  } = useGameDetails("mlb", awayEspnId, homeEspnId, normalizedDate);
  const isChampionship = playoffRound === "World Series";
  const styles = getStyles(dark, isChampionship);

  const homeScore = game?.scores?.home?.total ?? 0;
  const awayScore = game?.scores?.away?.total ?? 0;

  const status = game?.status || {};
  const longStatus = status.long?.toLowerCase() || "";

  const isFinal =
    longStatus.includes("final") ||
    longStatus.includes("finished") ||
    longStatus === "ft";

  const isScheduled =
    longStatus === "not started" || longStatus.includes("scheduled");

  const isCancelled = longStatus === "cancelled";

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
    headline && !headline.toLowerCase().includes("final") ? headline : null;

  const renderHeadline = () => (
    <>
      {seasonState === "post-season" ? (
        <View style={styles.headlineContainer}>
          {gameNote ? (
            <>
              <Text style={styles.mlbHeadlineText}>{gameNote}</Text>
              <View style={styles.seriesDivider} />
            </>
          ) : null}

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
        <Image
          source={{ uri: dark ? awayTeam?.logoLight : awayTeam?.logo }}
          style={styles.logo}
        />
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
            <Text style={styles.finalText}>{formatMLBStatus(status)}</Text>
            <View style={styles.finalStatusDivider} />
            <Text style={styles.finalText}>{formattedDate}</Text>
          </View>
        ) : isCancelled ? (
          <View style={styles.infoWrapper}>
            <Text style={styles.finalText}>{formatMLBStatus(status)}</Text>
          </View>
        ) : (
          <View style={styles.infoWrapper}>
            <Text style={styles.date}>{formatMLBStatus(status)}</Text>
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
        <Image
          source={{ uri: dark ? homeTeam?.logoLight : homeTeam?.logo }}
          style={styles.logo}
        />
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

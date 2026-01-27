import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/Colors";
import { getTeamById } from "constants/teams";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameDetails } from "hooks/useGameDetails";
import { useGameInfo } from "hooks/useGameInfo";
import { useState } from "react";
import {
  Pressable,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { gameSquareCardStyles } from "styles/GamecardStyles/GameSquareCardStyles";
import { Game } from "types/types";
import { formatQuarter } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";

export default function GameSquareCard({ game }: { game: Game }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(false);

  const homeTeam = game.home;
  const awayTeam = game.away;

  const homeId = Number(game.home?.id);
  const awayId = Number(game.away?.id);

  const home = getTeamById(homeId);
  const away = getTeamById(awayId);

  const homeName = home?.code;
  const awayName = away?.code;

  const homeLogo = isDark ? home?.logoLight || home?.logo : home?.logo;
  const awayLogo = isDark ? away?.logoLight || away?.logo : away?.logo;

  const homeEspnId = home?.espnID ?? 0;
  const awayEspnId = away?.espnID ?? 0;

  const safeDate = (date?: string | null) => {
    if (!date) return new Date();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const gameDate = safeDate(game.date);
  const gameDateStr = gameDate.toISOString();

  const isChampionship =
    gameDate.getMonth() === 5 &&
    gameDate.getDate() >= 5 &&
    gameDate.getDate() <= 22;
  const isChristmasDay =
    gameDate.getMonth() === 11 && gameDate.getDate() === 25;
  const isNewYearsDay = gameDate.getMonth() === 0 && gameDate.getDate() === 1;
  const holidayLabel = isChristmasDay
    ? "Christmas Day"
    : isNewYearsDay
    ? "New Year's Day"
    : null;

  const styles = gameSquareCardStyles(isDark, isChampionship);

  const { score: liveScore, details } = useGameDetails(
    "nba",
    String(homeEspnId),
    String(awayEspnId),
    gameDateStr
  );

  const period =
    liveScore?.period ?? Number(game.periods?.current ?? game.period);
  const displayClock = liveScore?.displayClock;
  const homeScore =
    liveScore?.home.total ?? game.scores?.home?.points ?? game.homeScore;
  const awayScore =
    liveScore?.away.total ?? game.scores?.visitors?.points ?? game.awayScore;

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

  // Team records
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";

  // --- Broadcasts ---
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);

  const homeWins = isFinal && (homeScore ?? 0) > (awayScore ?? 0);
  const awayWins = isFinal && (awayScore ?? 0) > (homeScore ?? 0);

  const winnerStyle = (teamWins: boolean): TextStyle => ({
    color: isDark ? Colors.white : Colors.black,
    opacity:
      inProgress || isHalftime || endOfPeriod
        ? 1
        : isFinal
        ? teamWins
          ? 1
          : 0.5
        : 1,
  });

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

  const { headlineText } = useGameInfo(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr
  );

  const headline = headlineText || holidayLabel;

  const ScoreText = ({
    score,
    recordData,
    teamWins,
    showRecord,
  }: {
    score?: number;
    recordData?: string;
    teamWins: boolean;
    showRecord?: boolean;
  }) => {
    const hasScore = typeof score === "number" && !isNaN(score);
    const displayValue =
      showRecord || !hasScore ? recordData ?? "-" : score?.toString() ?? "-";
    const style =
      showRecord || !hasScore
        ? styles.teamRecord
        : [styles.teamScore, winnerStyle(teamWins)];
    return <Text style={style}>{displayValue}</Text>;
  };

  const renderStatus = () => {
    if (inProgress)
      return (
        <View>
          <Text style={styles.period}>{formatQuarter(period)}</Text>
          <Text style={styles.clock}>{displayClock}</Text>
        </View>
      );

    if (isDelayed) return <Text style={styles.finalText}>Delayed</Text>;
    if (isHalftime) return <Text style={styles.finalText}>Halftime</Text>;
    if (isCanceled) return <Text style={styles.finalText}>Cancelled</Text>;
    if (isPostponed) return <Text style={styles.finalText}>Postponed</Text>;
    if (isForfeited) return <Text style={styles.finalText}>Forfeited</Text>;

    if (endOfPeriod)
      return <Text style={styles.clock}>{gameStatusDetail}</Text>;

    if (isFinal)
      return (
        <View>
          <Text style={styles.finalText}>{gameStatusDetail}</Text>
          <Text style={styles.finalText}>{formattedDate}</Text>
        </View>
      );

    return (
      <View>
        <Text style={styles.date}>{formattedDate}</Text>
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
              accessibilityLabel={`${awayTeam.name} logo`}
            />
            <Text style={styles.teamName}>{awayName}</Text>
          </View>
          <ScoreText
            score={awayScore}
            recordData={awayRecord ?? undefined}
            teamWins={awayWins}
            showRecord={isScheduled || isDelayed || isPostponed || isCanceled}
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
          <ScoreText
            score={homeScore}
            recordData={homeRecord}
            teamWins={homeWins}
            showRecord={isScheduled || isDelayed || isPostponed || isCanceled}
          />
        </View>
        {/* Notification Bell */}
      </View>
      {/* Game Info */}
      <View style={styles.info}>{renderStatus()}</View>
      <Pressable
        onPress={() => setNotifEnabled((prev) => !prev)}
        style={({ pressed }) => [
          styles.notificationBell,
          pressed && { opacity: 0.6 },
        ]}
      >
        <Ionicons
          name={notifEnabled ? "notifications" : "notifications-outline"}
          size={20}
          color={isDark ? Colors.white : Colors.black}
        />
      </Pressable>
      {/* headlineText */}
      <Text style={[styles.headlineText]}>{headline}</Text>
      {!isFinal && broadcastText && (
        <Text style={styles.broadcast}>{broadcastText}</Text>
      )}
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

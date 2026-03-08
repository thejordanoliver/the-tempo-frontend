import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/Styles";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMMADetails } from "hooks/MMAHooks/useMMADetails";
import { useState } from "react";
import {
  Pressable,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { GameCardStyles } from "styles/GamecardStyles/GameCardStyles";
import { MMAFight } from "types/mma";
import { formatRound } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";

export default function MMAStackedGameCard({ game }: { game: MMAFight }) {
  const isDark = useColorScheme() === "dark";
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(false);

  const safeDate = (date?: string | null) => {
    if (!date) return new Date();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const gameDate = safeDate(game.date);
  const gameDateStr = gameDate.toISOString();

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

  const firstFighterId = game.fighters.first.id;
  const secondFighterId = game.fighters.second.id;

  const firstFighterName = game.fighters.first.name;
  const secondFighterName = game.fighters.second.name;

  const firstFighterPhoto = game.fighters.first.info.images[0]?.href ?? "";
  const secondFighterPhoto = game.fighters.second.info.images[0]?.href ?? "";

  const firstFighterEspnId = game.fighters.first.info.espn_id;
  const secondFighterEspnId = game.fighters.second.info.espn_id;

  const { details, score } = useMMADetails(
    "ufc",
    firstFighterEspnId,
    secondFighterEspnId,
    gameDateStr,
  );

  const firstFighterRecord = details?.records?.home?.overall;
  const secondFighterRecord = details?.records?.away?.overall;

  const gameStatusDescription = score?.gameStatusDescription;
  const gameStatusDetail = score?.gameStatusDetail;
  const isScheduled = gameStatusDescription === "Scheduled";
  const isCanceled = gameStatusDescription === "Canceled";
  const isFinal = gameStatusDescription === "Final";
  const isPostponed = gameStatusDescription === "Postponed";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const isEndOfRound = gameStatusDescription === "End of Round";
  const inProgress = gameStatusDescription === "In Progress";

  // --- Broadcasts ---
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const isIntros = game.status.long === "Intros";
  const isPreFight = game.status.long === "Pre-fight";
  const isWalkingOut = game.status.long === "Walkouts";
  const period = score?.period;
  const displayClock = score?.displayClock;
  const headline = null;

  const isMainEvent = game.is_main === true;
  const styles = GameCardStyles(isDark, isMainEvent);

  const firstFighterWinner = game.fighters.first.winner === true;
  const secondFighterWinner = game.fighters.second.winner === true;
  const isTie =
    game.fighters.first.winner === false &&
    game.fighters.second.winner === false;

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
    const showRecord = isScheduled || isCanceled || isPostponed;

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
          <Text style={styles.period}>{formatRound(period)}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.clock}>{displayClock}</Text>
        </View>
      );

    if (isDelayed) return <Text style={styles.finalText}>Delayed</Text>;

    if (isCanceled) return <Text style={styles.finalText}>Canceled</Text>;
    if (isPostponed) return <Text style={styles.finalText}>Postponed</Text>;
    if (isForfeited) return <Text style={styles.finalText}>Forfeited</Text>;

    if (isEndOfRound)
      return <Text style={styles.clock}>End of {formatRound(period)}</Text>;

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
      {/* Second Fighter */}
      <View style={styles.teamSection}>
        <Image
          source={{ uri: secondFighterPhoto }}
          style={styles.logo}
          accessibilityLabel={`${secondFighterName} headshot`}
        />
        <Text style={styles.teamName}>{secondFighterName}</Text>
      </View>
      {/* Second Fighter Score / Record */}
      <ScoreText
        score={0}
        record={secondFighterRecord ?? "0-0"}
        teamWins={secondFighterWinner}
      />

      {/* headlineText */}
      <Text style={[styles.headlineText]}>{headline}</Text>

      {/* Game Info */}
      <View style={styles.info}>
        {renderStatus()}
        {!isFinal && broadcastText && (
          <Text style={styles.broadcast}>{broadcastText}</Text>
        )}
      </View>

      {/* First Fighter Score / Record */}
      <ScoreText
        score={0}
        record={firstFighterRecord ?? "0-0"}
        teamWins={firstFighterWinner}
      />

      {/* First Fighter */}
      <View style={styles.teamSection}>
        <Image
          source={{ uri: firstFighterPhoto }}
          style={styles.logo}
          accessibilityLabel={`${firstFighterName} headshot`}
        />
        <Text style={styles.teamName}>{firstFighterName}</Text>
      </View>

      {/* Notification Bell */}
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
      {isMainEvent ? (
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

import { Ionicons } from "@expo/vector-icons";
import placeholderImage from "assets/Placeholders/playerPlaceholder.png";
import { Colors } from "constants/Styles";
import { Image } from "expo-image";
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
import getDecisionType, { resultTypeMap } from "utils/MMAUtils/resultsUtils";

export default function MMAGameCard({ game }: { game: MMAFight }) {
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

  const firstFighterName =
    game.fighters?.first?.info?.short_name ?? game.fighters.first.name;
  const secondFighterName =
    game.fighters?.second?.info?.short_name ?? game.fighters.second.name;

  const firstFighterPhoto =
    game.fighters?.first?.info?.images[0]?.href ?? placeholderImage;
  const secondFighterPhoto =
    game.fighters?.second?.info?.images[0]?.href ?? placeholderImage;
  const firstFighterFlag = game.fighters?.first?.info?.flag_url ?? "";
  const secondFighterFlag = game.fighters?.second?.info?.flag_url ?? "";

  const firstFighterEspnId = game.fighters?.first?.info?.espn_id;
  const secondFighterEspnId = game.fighters?.second?.info?.espn_id;

  const { details } = useMMADetails(
    "ufc",
    firstFighterEspnId,
    secondFighterEspnId,
    gameDateStr,
  );

  const rawWonType = game.result?.wonType;
  const firstFighterWinner = game.fighters.first.winner === true;
  const secondFighterWinner = game.fighters.second.winner === true;
  const wonType = getDecisionType(
    rawWonType ?? "",
    game.result?.score,
    firstFighterWinner,
    secondFighterWinner,
  );
  const resultText = wonType ? (resultTypeMap[wonType] ?? wonType) : "Result";
  const firstFighterRecord = game.fighters?.first?.info?.record;
  const secondFighterRecord = game.fighters?.second?.info?.record;
  const gameStatusDescription = details?.fight?.status.description ?? game.status.long;
  const isScheduled = gameStatusDescription === "Scheduled" || gameStatusDescription ===  "Not Started";
  const isCanceled = gameStatusDescription === "Canceled" || gameStatusDescription ===  "Cancelled" ;
  const isFinal = gameStatusDescription === "Final" || "Finished";
  const isPostponed = gameStatusDescription === "Postponed";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const isEndOfRound = gameStatusDescription === "End of Round";
  const inProgress = gameStatusDescription === "In Progress";
  const inWalkouts = gameStatusDescription === "Walkouts";
  const isIntros = gameStatusDescription === "Intros";
  const broadcasts = details?.fight?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const period = details?.fight?.status.period;
  const displayClock = details?.fight?.status.displayClock;
  const headline = details?.event?.shortName;
  const styles = GameCardStyles(isDark);

  const isTie =
    game.fighters.first.winner === false &&
    game.fighters.second.winner === false;

  const ScoreText = ({
    record,
    winner,
  }: {
    record: string | undefined;
    winner: boolean | undefined;
  }) => {
    const showRecord =
      isScheduled ||
      inWalkouts ||
      isCanceled ||
      isPostponed ||
      isDelayed ||
      isForfeited;

    const opacity = isFinal && winner === false ? 0.5 : 1;
    if (showRecord) {
      return <Text style={styles.teamRecord}>{record}</Text>;
    }

    if (winner) {
      return (
        <View style={styles.winnerContainer}>
          <Text style={[styles.teamRecord, { opacity }]}>{record}</Text>

          <Ionicons
            size={20}
            name="caret-up"
            color={isDark ? Colors.white : Colors.black}
            style={{ position: "absolute", bottom: -20 }}
          />
        </View>
      );
    }

    return <Text style={[styles.teamRecord, { opacity }]}>{record}</Text>;
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

    if (inWalkouts) return <Text style={styles.finalText}>Walkouts</Text>;
    if (isIntros) return <Text style={styles.finalText}>Intros</Text>;
    if (isDelayed) return <Text style={styles.finalText}>Delayed</Text>;
    if (isCanceled) return <Text style={styles.finalText}>Canceled</Text>;
    if (isPostponed) return <Text style={styles.finalText}>Postponed</Text>;
    if (isForfeited) return <Text style={styles.finalText}>Forfeited</Text>;

    if (isEndOfRound)
      return <Text style={styles.clock}>End of {formatRound(period)}</Text>;

    if (isFinal)
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{resultText}</Text>
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
        <View style={styles.fighterContainer}>
          <Image
            source={{ uri: secondFighterPhoto }}
            style={styles.fighter}
            accessibilityLabel={`${secondFighterName} headshot`}
          />
        </View>
        <Image
          source={{ uri: secondFighterFlag }}
          style={styles.leftFighterFlag}
          accessibilityLabel={`${secondFighterName} headshot`}
        />

        <Text style={styles.teamName}>{secondFighterName}</Text>
      </View>
      {/* Second Fighter Score / Record */}
      <ScoreText
        record={secondFighterRecord ?? "0-0"}
        winner={secondFighterWinner}
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
        record={firstFighterRecord ?? "0-0"}
        winner={firstFighterWinner}
      />

      {/* First Fighter */}
      <View style={styles.teamSection}>
        <View style={styles.fighterContainer}>
          <Image
            source={{ uri: firstFighterPhoto }}
            style={styles.fighter}
            accessibilityLabel={`${firstFighterName} headshot`}
          />
        </View>
        <Image
          source={{ uri: firstFighterFlag }}
          style={styles.rightFighterFlag}
          accessibilityLabel={`${secondFighterName} headshot`}
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
          pathname: "/game/mma/[game]",
          params: { game: JSON.stringify(game) },
        })
      }
    >
      <View style={styles.card}>{renderCardContent()}</View>
    </TouchableOpacity>
  );
}

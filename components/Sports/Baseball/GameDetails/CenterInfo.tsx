import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { Text, View } from "react-native";
import { gameInfoStyles } from "styles/GameDetailStyles/GameInfoStyles";
import { BasesIndicator } from "./BasesIndicator";

type CenterInfoProps = {
  state: string | null;
  gameStatusDescription: string;
  gameStatusDetail: string;
  date: string;
  time: string;
  isDark: boolean;
  broadcast?: string;
  outs: number;
  bases: {
    onFirst: boolean;
    onSecond: boolean;
    onThird: boolean;
  };
};

export function CenterInfo({
  state,
  gameStatusDescription,
  gameStatusDetail,
  date,
  time,
  isDark,
  broadcast,
  outs,
  bases,
}: CenterInfoProps) {
  const styles = gameInfoStyles(isDark);

  const isScheduled = state === "pre";
  const isFinal = gameStatusDescription === "Final";
  const inProgress = gameStatusDescription === "In Progress";
  const isCanceled = gameStatusDescription === "Canceled";
  const isPostponed = gameStatusDescription === "Postponed";
  const isSuspended = gameStatusDescription === "Suspended";
  const isForfeited = gameStatusDescription === "Forfeited";
  const isEndOfInning = gameStatusDetail.includes("End");
  const isDelayed =
    gameStatusDescription === "Delayed" ||
    gameStatusDescription === "Rain Delay";

  const countOuts = Math.min(Math.max(outs ?? 0, 0), 3);
  const getOuts = [1, 2, 3].map((i) => (
    <Ionicons
      key={i}
      size={8}
      name={i <= countOuts ? "ellipse" : "ellipse-outline"}
      color={isDark ? Colors.dark.lightRed : Colors.light.red}
    />
  ));

  return (
    <View style={styles.container}>
      {isScheduled && (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{date || "TBD"}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{time || ""}</Text>
        </View>
      )}

      {/* 🕒 In Progress */}
      {inProgress && !isDelayed && !isEndOfInning && (
        <View>
          <View style={styles.infoWrapper}>
            <Text style={styles.date}>{gameStatusDetail}</Text>
            <View style={styles.statusDivider} />
            <View style={styles.outsContainer}>{getOuts}</View>
          </View>
          <View style={styles.basesContainer}>
            <BasesIndicator size={8} bases={bases} isDark={isDark} />
          </View>
        </View>
      )}

      {/* 🕒 In Progress */}
      {isEndOfInning && (
        <View>
          <View style={styles.infoWrapper}>
            <Text style={styles.finalText}>{gameStatusDetail}</Text>
          </View>
        </View>
      )}

      {/* 🏁 Final */}
      {isFinal && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDetail}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date}</Text>
        </View>
      )}

      {(isDelayed ||
        isCanceled ||
        isPostponed ||
        isForfeited ||
        isSuspended) && (
        <Text style={styles.finalText}>{gameStatusDescription}</Text>
      )}

      {/* 📺 Broadcast */}
      {broadcast && (inProgress || isScheduled) && (
        <Text style={styles.broadcasts}>{broadcast}</Text>
      )}
    </View>
  );
}

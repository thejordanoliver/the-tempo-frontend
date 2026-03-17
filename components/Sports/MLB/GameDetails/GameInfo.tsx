import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/Styles";
import { Text, View } from "react-native";
import { getStyles } from "styles/GameDetailStyles/CenterInfoStyles";
import BasesIndicator from "./BasesIndicator";

type GameInfoProps = {
  gameStatusDescription: string;
  gameStatusDetail: string;
  date: string;
  time: string;
  inning?: string;
  isDark: boolean;
  isTopInning: boolean;
  broadcast?: string;
  outs: number;
  bases: {
    first: boolean;
    second: boolean;
    third: boolean;
  };
};

export function GameInfo({
  gameStatusDescription,
  gameStatusDetail,
  date,
  time,
  isDark,
  broadcast,
  isTopInning,
  outs,
  bases,
}: GameInfoProps) {
  const styles = getStyles(isDark);

  const isScheduled = gameStatusDescription === "Scheduled";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";

  const inProgress =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "End of Inning";

  return (
    <View style={styles.container}>
      {/* ⚾ Scheduled */}
      {isScheduled && (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{time}</Text>
        </View>
      )}

      {/* 🕒 In Progress */}
      {inProgress && (
        <View>
          <View style={[styles.infoWrapper, { marginBottom: 2 }]}>
            <Ionicons
              name={isTopInning ? "caret-up" : "caret-down"}
              size={14}
              color={isDark ? Colors.white : Colors.black}
            />

            <Text style={styles.date}>{gameStatusDetail}</Text>

            <View style={styles.statusDivider} />

            <Text style={styles.finalText}>Outs: {outs}</Text>
          </View>

          <View style={{ marginTop: 2 }}>
            <BasesIndicator bases={bases} isDark={isDark} />
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

      {/* ❌ Canceled */}
      {isCanceled && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Canceled</Text>
        </View>
      )}

      {/* ⏸️ Postponed */}
      {isPostponed && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Postponed</Text>
        </View>
      )}

      {/* ⏸️ Delayed */}
      {isDelayed && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Delayed</Text>
        </View>
      )}

      {/* 📺 Broadcast */}
      {broadcast && (inProgress || isScheduled) && (
        <Text style={styles.broadcasts}>{broadcast}</Text>
      )}
    </View>
  );
}

import { Text, View } from "react-native";
import { getStyles } from "styles/GameDetailStyles/CenterInfoStyles";

type GameInfoProps = {
  gameStatusDescription: string;
  gameStatusDetail: string;
  date: string;
  time: string;
  inning?: string;
  isDark: boolean;
  broadcastNetworks?: string;
};

export function GameInfo({
  gameStatusDescription,
  gameStatusDetail,
  date,
  time,
  inning,
  isDark,

  broadcastNetworks,
}: GameInfoProps) {
  const styles = getStyles(isDark);

  const inProgress =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "End of Period";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const isFinal = gameStatusDescription === "Final";
  const isScheduled = gameStatusDescription === "Scheduled";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isPostponed = gameStatusDescription === "Postponed";
  const isHalftime = gameStatusDescription === "Halftime";
  return (
    <View style={styles.container}>
      {/* ⚾️ Scheduled */}
      {isScheduled && (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{time}</Text>
        </View>
      )}

      {/* 🕒 In Play */}
      {inProgress && (
        <View style={styles.infoWrapper}>
          {inning && <Text style={styles.date}>{inning}</Text>}
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
      {broadcastNetworks && inProgress || isScheduled  && (
        <Text style={styles.broadcasts}>{broadcastNetworks}</Text>
      )}
    </View>
  );
}

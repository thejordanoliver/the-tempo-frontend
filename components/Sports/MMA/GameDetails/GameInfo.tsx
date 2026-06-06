import { Text, View } from "react-native";
import { gameInfoStyles } from "styles/GameDetailStyles/GameInfoStyles";

type GameInfoProps = {
  gameStatusDescription: string | undefined;
  gameStatusDetail: string | undefined;
  date: string;
  time: string;
  clock: string;
  period?: number;
  isDark: boolean;
  broadcastNetworks?: string;
};

export function GameInfo({
  gameStatusDescription,
  gameStatusDetail,
  date,
  time,
  clock,
  isDark,
  period,
  broadcastNetworks,
}: GameInfoProps) {
  const styles = gameInfoStyles(isDark);

  const inProgress =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "End of Round";
  const endOfRound = gameStatusDescription === "End of Round";
  const isFinal = gameStatusDescription === "Final";
  const isScheduled = gameStatusDescription === "Scheduled";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isPostponed = gameStatusDescription === "Postponed";

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
        <View>
          <View style={styles.infoWrapper}>
            <Text style={styles.date}>{period}</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.clock}>{clock}</Text>
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

      {/* ⏸️ Forfeited */}
      {isForfeited && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Forfeited</Text>
        </View>
      )}

      {/* 📺 Broadcast */}
      {(broadcastNetworks && inProgress) ||
        (isScheduled && (
          <Text style={styles.broadcasts}>{broadcastNetworks}</Text>
        ))}
    </View>
  );
}

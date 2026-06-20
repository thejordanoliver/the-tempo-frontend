import { Text, View } from "react-native";
import { gameInfoStyles } from "styles/GameDetailStyles/GameInfoStyles";

type GameInfoProps = {
  gameStatusDescription: string | undefined;
  results?: string | null;
  date: string;
  time: string;
  clock?: string;
  period?: string;
  isDark: boolean;
  broadcast?: string;
};

export function GameInfo({
  gameStatusDescription,
  results,
  date,
  time,
  clock,
  isDark,
  period,
  broadcast,
}: GameInfoProps) {
  const styles = gameInfoStyles(isDark);

  const isScheduled = gameStatusDescription === "Scheduled";
  const isCanceled = gameStatusDescription === "Canceled";
  const isFinal = gameStatusDescription === "Final";
  const isPostponed = gameStatusDescription === "Postponed";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const isEndOfRound = gameStatusDescription === "End of Round";
  const inProgress = gameStatusDescription === "In Progress";
  const inWalkouts = gameStatusDescription === "Walkouts";
  const isIntros = gameStatusDescription === "Intros";

  return (
    <View style={styles.container}>
      {isScheduled && (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{time}</Text>
        </View>
      )}

      {inWalkouts && (
        <View>
          <Text style={styles.date}>Walkouts</Text>
        </View>
      )}

      {isIntros && (
        <View>
          <Text style={styles.date}>Intros</Text>
        </View>
      )}

      {inProgress && (
        <View>
          <View style={styles.infoWrapper}>
            <Text style={styles.date}>{period}</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.clock}>{clock}</Text>
          </View>
        </View>
      )}

      {isEndOfRound && (
        <View>
          <Text style={styles.date}>End of {period}</Text>
        </View>
      )}

      {isFinal && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{results}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date}</Text>
        </View>
      )}

      {isCanceled && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDescription}</Text>
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
      {(broadcast && inProgress) ||
        (isScheduled && <Text style={styles.broadcasts}>{broadcast}</Text>)}
    </View>
  );
}

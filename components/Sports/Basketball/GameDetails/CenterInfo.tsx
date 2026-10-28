import { Text, View } from "react-native";
import { gameInfoStyles } from "styles/GameDetailStyles/GameInfoStyles";

type CenterInfoProps = {
  date: string;
  time: string;
  period: string | number;
  clock: string;
  isDark: boolean;
  broadcast: string | null;
  state: string | null;
  gameStatusDescription: string | undefined;
  gameStatusShortDescription: string;
};

export function CenterInfo({
  date,
  time,
  period,
  clock,
  isDark,
  broadcast,
  state,
  gameStatusDescription,
  gameStatusShortDescription,
}: CenterInfoProps) {
  const styles = gameInfoStyles(isDark);

  const inProgress = state === "in";
  const isFinal = state === "post";
  const isScheduled = gameStatusDescription === "Scheduled";
  const isEndOfPeriod = gameStatusDescription === "End of Period";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isPostponed = gameStatusDescription === "Postponed";
  const isHalftime = gameStatusDescription === "Halftime";

  return (
    <View style={styles.container}>
      {isFinal && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusShortDescription}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date}</Text>
        </View>
      )}

      {inProgress && !isEndOfPeriod && !isHalftime && (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{period}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.clock}>{clock}</Text>
        </View>
      )}

      {isScheduled && (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{time ?? "TBD"}</Text>
        </View>
      )}

      {isEndOfPeriod && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>End of {period}</Text>
        </View>
      )}
      {isHalftime && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Halftime</Text>
        </View>
      )}
      {(isCanceled || isForfeited || isDelayed || isPostponed) && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusShortDescription}</Text>
        </View>
      )}

      {/* 📺 Broadcast */}
      {broadcast && (inProgress || isHalftime || isScheduled) && (
        <Text style={styles.broadcasts}>{broadcast}</Text>
      )}
    </View>
  );
}

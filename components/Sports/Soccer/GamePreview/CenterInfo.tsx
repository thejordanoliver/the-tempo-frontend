import { Text, View } from "react-native";
import { centerInfoStyles } from "styles/ModalsStyles/GamePreviewStyles/CenterInfoStyles";
type CenterInfoProps = {
  broadcast?: string;
  period: string | number;
  time: string;
  clock?: string | null;
  date: string;
  state: string;
  gameStatusDescription: string;
  gameStatusShortDescription: string;
};

export function CenterInfo({
  date,
  time,
  period,
  clock,
  broadcast,
  state,
  gameStatusDescription,
  gameStatusShortDescription,
}: CenterInfoProps) {
  const styles = centerInfoStyles;

  const isFinal = state === "post";
  const inProgress = state === "in";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const isScheduled = gameStatusDescription === "Scheduled";
  const isSuspended = gameStatusDescription === "Suspended";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isPostponed = gameStatusDescription === "Postponed";
  const isHalftime = gameStatusDescription === "Halftime";

  return (
    <View>
      {isFinal && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusShortDescription}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date}</Text>
        </View>
      )}

      {inProgress && !endOfPeriod && (
        <View style={styles.infoWrapper}>
          <Text style={styles.period}>{period}</Text>
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

      {endOfPeriod && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>End of {period}</Text>
        </View>
      )}

      {isHalftime && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Halftime</Text>
        </View>
      )}

      {(isCanceled ||
        isDelayed ||
        isSuspended ||
        isPostponed ||
        isForfeited) && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDescription}</Text>
        </View>
      )}

      {broadcast && <Text style={styles.broadcast}>{broadcast}</Text>}
    </View>
  );
}

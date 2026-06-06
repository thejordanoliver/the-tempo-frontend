import { Text, View } from "react-native";
import { CenterInfoStyles } from "styles/ModalsStyles/GamePreviewStyles/CenterInfoStyles";
type CenterInfoProps = {
  broadcast?: string;
  period: string | number;
  time: string;
  clock?: string | null;
  date: string;
  gameStatusDetail: string;
  gameStatusDescription: string;
};

export default function CenterInfo({
  gameStatusDescription,
  gameStatusDetail,
  broadcast,
  period,
  clock,
  time,
  date,
}: CenterInfoProps) {
  const styles = CenterInfoStyles;

  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";
  const isHalftime = gameStatusDescription === "Halftime";
  const isCanceled = gameStatusDescription === "Canceled";
  const isForfeited = gameStatusDescription === "Forfeited";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isEndOfPeriod = gameStatusDescription === "End of Period";

  return (
    <View style={styles.container}>
      {isScheduled && (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{time}</Text>
        </View>
      )}

      {inProgress && (
        <View style={styles.infoWrapper}>
          <Text style={styles.period}>{period}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.clock}>{clock}</Text>
        </View>
      )}

      {isHalftime && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Halftime</Text>
        </View>
      )}

      {isFinal && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDetail}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date}</Text>
        </View>
      )}

      {isEndOfPeriod && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>End of {period}</Text>
        </View>
      )}

      {(isCanceled || isDelayed || isForfeited || isPostponed) && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDescription}</Text>
        </View>
      )}

      {broadcast && (inProgress || isScheduled) && (
        <Text style={styles.broadcast}>{broadcast}</Text>
      )}
    </View>
  );
}

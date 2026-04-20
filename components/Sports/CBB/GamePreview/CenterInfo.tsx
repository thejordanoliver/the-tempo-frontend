import { Text, View } from "react-native";
import { CenterInfoStyles } from "styles/ModalsStyles/GamePreviewStyles/CenterInfoStyles";

type CenterInfoProps = {
  broadcastNetworks?: string;
  period: number | string;
  formattedTime: string;
  clock?: string | null;
  endOfPeriod?: boolean;
  gameStatusDetail: string;
  formattedDate: string;
  totalPeriodsPlayed?: number;
  statusText?: string;
  gameStatusDescription: string;
};

export default function CenterInfo({
  gameStatusDescription,
  gameStatusDetail,
  broadcastNetworks,
  period,
  clock,
  formattedTime,
  formattedDate,
  statusText,
}: CenterInfoProps) {
  const styles = CenterInfoStyles;

  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";
  const isHalftime = gameStatusDescription === "Halftime";
  const isCanceled = gameStatusDescription === "Canceled";
  const isEndOfPeriod = gameStatusDescription === "End of Period";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";

  return (
    <View style={styles.container}>
      {isCanceled ? (
        <Text style={styles.finalText}>Cancelled</Text>
      ) : isFinal ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDetail}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{formattedDate}</Text>
        </View>
      ) : isPostponed ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDetail}</Text>
        </View>
      ) : isDelayed ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDetail}</Text>
        </View>
      ) : isScheduled ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{formattedDate}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{formattedTime}</Text>
        </View>
      ) : inProgress ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.period}>{period}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.clock}>{clock}</Text>
        </View>
      ) : isHalftime ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Halftime</Text>
        </View>
      ) : isEndOfPeriod ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>End of {period}</Text>
        </View>
      ) : (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{statusText}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{formattedDate}</Text>
        </View>
      )}

      {broadcastNetworks && (
        <Text style={styles.broadcast}>{broadcastNetworks}</Text>
      )}
    </View>
  );
}

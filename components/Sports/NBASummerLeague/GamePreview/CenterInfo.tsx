import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { formatQuarter } from "utils/games";
type CenterInfoProps = {
  isChampionship: boolean;
  broadcastNetworks?: string;
  period: number;
  time: string;
  clock?: string | null;
  endOfPeriod?: boolean;
  gameStatusDetail: string;
  formattedDate: string;
  isDark: boolean;
  round?: string;
  lighter: boolean;
  statusText?: string;
  gameStatusDescription: string;
};

export default function CenterInfo({
  isChampionship,
  gameStatusDescription,
  gameStatusDetail,
  broadcastNetworks,
  period,
  clock,
  time,
  formattedDate,
  isDark,
  statusText,
}: CenterInfoProps) {
  const lightOpacity = useRef(new Animated.Value(isDark ? 0 : 1)).current;
  const darkOpacity = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const styles = CenterInfoStyles;

  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";
  const isHalftime = gameStatusDescription === "Halftime";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isEndOfPeriod = gameStatusDescription === "End of Period";
  const displayPeriod = formatQuarter(period);

  useEffect(() => {
    if (isChampionship) {
      Animated.parallel([
        Animated.timing(lightOpacity, {
          toValue: isDark ? 0 : 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(darkOpacity, {
          toValue: isDark ? 1 : 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isDark, isChampionship, lightOpacity, darkOpacity]);

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
      ) : isDelayed ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Delayed</Text>
        </View>
      ) : isPostponed ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Postponed</Text>
        </View>
      ) : isScheduled ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{formattedDate}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{time}</Text>
        </View>
      ) : inProgress ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.period}>{displayPeriod}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.clock}>{clock}</Text>
        </View>
      ) : isHalftime ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Halftime</Text>
        </View>
      ) : isEndOfPeriod ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>End of {displayPeriod}</Text>
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

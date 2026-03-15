import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { formatRound } from "utils/games";
import { CenterInfoStyles } from "styles/ModalsStyles/GamePreviewStyles/CenterInfoStyles";
type CenterInfoProps = {
  isMainEvent: boolean;
  broadcastNetworks?: string;
  period: number;
  displayClock: string;
  time: string;
  date: string;
  clock?: string | null;
  endOfPeriod?: boolean;
  gameStatusDetail: string;
  isDark: boolean;
  round?: string;
  statusText?: string;
  gameStatusDescription: string;
};

export default function CenterInfo({
  isMainEvent,
  gameStatusDescription,
  gameStatusDetail,
  broadcastNetworks,
  period,
  displayClock,
  time,
  date,
  isDark,
  statusText,
}: CenterInfoProps) {
  const lightOpacity = useRef(new Animated.Value(isDark ? 0 : 1)).current;
  const darkOpacity = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const styles = CenterInfoStyles;

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

  useEffect(() => {
    if (isMainEvent) {
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
  }, [isDark, isMainEvent, lightOpacity, darkOpacity]);

  return (
    <View style={styles.container}>
      {isCanceled ? (
        <Text style={styles.finalText}>Cancelled</Text>
      ) : isFinal ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDetail}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date}</Text>
        </View>
      ) : inWalkouts ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Walkouts</Text>
        </View>
      ) : isIntros ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Intros</Text>
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
          <Text style={styles.date}>{date}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{time}</Text>
        </View>
      ) : inProgress ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.period}>{formatRound(period)}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.clock}>{displayClock}</Text>
        </View>
      ) : isEndOfRound ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>End of {formatRound(period)}</Text>
        </View>
      ) : (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{statusText}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date}</Text>
        </View>
      )}

      {broadcastNetworks && (
        <Text style={styles.broadcast}>{broadcastNetworks}</Text>
      )}
    </View>
  );
}

import { Text, View } from "react-native";
import { gameInfoStyles } from "styles/GameDetailStyles/GameInfoStyles";
import { formatQuarter } from "utils/games";
type CenterInfoProps = {
  date: string;
  time?: string;
  period?: number | string;
  clock?: string;
  isDark: boolean;
  broadcast: string;
  gameStatusDescription: string;
  gameStatusShortDescription: string;
};

export function CenterInfo({
  date,
  time,
  period,
  clock,
  isDark,
  broadcast,
  gameStatusDescription,
  gameStatusShortDescription,
}: CenterInfoProps) {
  const styles = gameInfoStyles(isDark);

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
          <Text style={styles.date}>{formatQuarter(period, false, true)}</Text>
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
          <Text style={styles.finalText}>End of {formatQuarter(period)}</Text>
        </View>
      )}
      {isHalftime && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Halftime</Text>
        </View>
      )}
      {isCanceled && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Canceled</Text>
        </View>
      )}
      {isForfeited && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Forfeited</Text>
        </View>
      )}
      {isDelayed && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Delayed</Text>
        </View>
      )}
      {isPostponed && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Postponed</Text>
        </View>
      )}

      {/* Broadcast */}
      {broadcast && <Text style={styles.broadcasts}>{broadcast}</Text>}
    </View>
  );
}

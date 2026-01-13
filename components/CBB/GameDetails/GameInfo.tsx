import { Text, View } from "react-native";
import { getStyles } from "styles/GameDetailStyles/CenterInfoStyles";

type GameInfoProps = {
  date: string;
  time?: string;
  period?: number | string;
  clock?: string;
  isDark: boolean;
  playoffInfo?: string | string[];
  broadcastNetworks: string;
  gameStatusDescription: string;
  gameStatusShortDescription: string;
};

export function GameInfo({
  date,
  time,
  period,
  clock,
  isDark,
  broadcastNetworks,
  gameStatusDescription,
  gameStatusShortDescription,
}: GameInfoProps) {
  const styles = getStyles(isDark);

  const inProgress =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "End of Period";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isHalftime = gameStatusDescription === "Halftime";

  return (
    <View>
      {/* Status / Score */}
      {isCanceled ? (
        <Text style={styles.finalText}>Canceled</Text>
      ) : isDelayed ? (
        <Text style={styles.finalText}>Delayed</Text>
      ) : isPostponed ? (
        <Text style={styles.finalText}>Postponed</Text>
      ) : isHalftime ? (
        <Text style={styles.finalText}>Halftime</Text>
      ) : isFinal ? (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusShortDescription}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date}</Text>
        </View>
      ) : inProgress ? (
        <View style={styles.infoWrapper}>
          {endOfPeriod ? (
            <Text style={styles.finalText}>End of {period}</Text>
          ) : (
            <>
              <Text style={styles.date}>{period}</Text>
              {clock && (
                <>
                  <View style={styles.statusDivider} />
                  <Text style={styles.clock}>{clock}</Text>
                </>
              )}
            </>
          )}
        </View>
      ) : (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{time ?? "TBD"}</Text>
        </View>
      )}

      {/* Broadcast */}
      {broadcastNetworks && (
        <Text style={styles.broadcasts}>{broadcastNetworks}</Text>
      )}
    </View>
  );
}

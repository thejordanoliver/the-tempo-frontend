import { Colors } from "constants/styles";
import { Text, View } from "react-native";
import { gameInfoStyles } from "styles/GameDetailStyles/GameInfoStyles";
import { formatQuarter } from "utils/games";

type GameInfoProps = {
  date: string;
  time: string;
  period?: number;
  clock?: string;
  downAndDistance?: string | null;
  isDark: boolean;
  broadcast?: string;
  headlineText?: string;
  gameStatusDescription?: string;
  gameStatusShortDetail?: string;
  redzone: boolean;
};

export function GameInfo({
  date,
  time,
  period,
  clock,
  downAndDistance,
  isDark,
  broadcast,
  gameStatusDescription,
  gameStatusShortDetail,
  redzone = false,
}: GameInfoProps) {
  const inProgress =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "End of Period";
  const isHalftime = gameStatusShortDetail === "Halftime";
  const isFinal = gameStatusDescription === "Final";
  const endOfPeriod = gameStatusDescription === "End Of Period";
  const isCanceled = gameStatusDescription == "Canceled";
  const isScheduled =
    gameStatusDescription === "Scheduled" ||
    gameStatusDescription === "Not Started";
  const styles = gameInfoStyles(isDark);
  const isRedzone = redzone;

  const renderDownAndDistance = () => {
    if (!downAndDistance) return null;

    // Split only once on " at "
    const [beforeAt, afterAt] = downAndDistance.split(" at ");

    return (
      <Text style={styles.downAndDistance}>
        {beforeAt}
        {afterAt && (
          <>
            {" at "}
            <Text
              style={[
                styles.downAndDistance,
                isRedzone && {
                  color: isDark ? Colors.dark.lightRed : Colors.light.red,
                },
              ]}
            >
              {afterAt}
            </Text>
          </>
        )}
      </Text>
    );
  };

  // ---- Render ----
  return (
    <View style={styles.container}>
      {/* Scheduled */}
      {isScheduled && (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{date || "TBD"}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{time || ""}</Text>
        </View>
      )}

      {/* In Progress + End of Period */}
      {inProgress && (
        <>
          <View style={styles.infoWrapper}>
            <>
              <Text style={styles.date}>{formatQuarter(period ?? 0)}</Text>
              <View style={styles.statusDivider} />
              <Text style={styles.clock}>{clock}</Text>
            </>
          </View>
          {renderDownAndDistance()}
        </>
      )}
      {/* In Progress + End of Period */}
      {endOfPeriod && (
        <>
          <View style={styles.infoWrapper}>
            <>
              <Text style={styles.date}>{formatQuarter(period ?? 0)}</Text>
              <View style={styles.statusDivider} />
              <Text style={styles.clock}>{clock}</Text>
            </>
          </View>
          {renderDownAndDistance()}
        </>
      )}

      {/* Halftime */}
      {isHalftime && <Text style={styles.clock}>Halftime</Text>}

      {/* Final */}
      {isFinal && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusShortDetail}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date || ""}</Text>
        </View>
      )}

      {/* Canceled / Delayed / Postponed */}
      {isCanceled && <Text style={styles.finalText}>Canceled</Text>}

      {/* 📺 Broadcast */}
      {broadcast && <Text style={styles.broadcasts}>{broadcast}</Text>}
    </View>
  );
}

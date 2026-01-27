import { Colors } from "constants/Styles";
import { Text, View } from "react-native";
import { getStyles } from "styles/GameDetailStyles/CenterInfoStyles";
import { formatQuarter } from "utils/games";
type GameCenterInfoProps = {
  date: string;
  time: string;
  period?: string;
  clock?: string;
  downAndDistance?: string;
  isDark: boolean;
  broadcast?: string;
  headlineText?: string;
  gameStatusDescription?: string;
  gameStatusShortDetail?: string;
  redzone: boolean;
};

export function GameCenterInfo({
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
}: GameCenterInfoProps) {
  const inProgress = gameStatusDescription === "In Progress";

  const isFinal =
    gameStatusDescription === "Final" ||
    gameStatusDescription === "After Over Time";

  const isHalftime = gameStatusDescription == "Halftime";
  const isCanceled = gameStatusDescription == "Canceled";
  const isDelayed = gameStatusDescription == "Delayed";
  const isPostponed = gameStatusDescription == "Postponed";
  const endOfPeriod = gameStatusDescription == "End of Period";

  const isScheduled =
    gameStatusDescription === "Scheduled" ||
    gameStatusDescription === "Not Started";

  const styles = getStyles(isDark);
  const isRedzone = redzone;
  const displayPeriod = formatQuarter(period);

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
                }, // or any red you want
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
      {isScheduled && !isFinal && !inProgress && (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{date || "TBD"}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.time}>{time || ""}</Text>
        </View>
      )}

      {/* In Progress + End of Period */}
      {inProgress && (
        <>
          <View style={styles.infoWrapper}>
            <Text style={styles.date}>{displayPeriod}</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.clock}>{clock}</Text>
          </View>
          {renderDownAndDistance()}
        </>
      )}

      {endOfPeriod && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>End of {displayPeriod}</Text>
        </View>
      )}

      {/* Halftime */}
      {isHalftime && <Text style={styles.finalText}>Halftime</Text>}

      {/* Final */}
      {isFinal && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusShortDetail}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date || ""}</Text>
        </View>
      )}

      {/* Canceled, Postponed, Delayed */}
      {isCanceled ||
        isPostponed ||
        (isDelayed && (
          <Text style={styles.finalText}>{gameStatusDescription}</Text>
        ))}

      {!isFinal && <Text style={styles.broadcasts}>{broadcast}</Text>}
    </View>
  );
}

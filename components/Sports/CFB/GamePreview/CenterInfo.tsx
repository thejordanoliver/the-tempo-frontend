// ./CFB/GamePreview/CenterInfo.tsx
import { Colors } from "constants/Styles";
import { Text, View } from "react-native";
import { formatQuarter } from "utils/games";

export type CenterInfoProps = {
  date: string;
  week: string;
  time: string;
  period?: string;
  clock?: string | null;
  isDark: boolean;
  downAndDistance: string | undefined;
  broadcast?: string;
  gameStatusDescription: string | undefined;
  gameStatusShortDetail: string | undefined;
  redzone: boolean | undefined;
};

export function CenterInfo({
  date,
  time,
  redzone,
  period,
  clock,
  downAndDistance,
  broadcast,
  gameStatusDescription,
  gameStatusShortDetail,
}: CenterInfoProps) {
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
                  color: Colors.dark.lightRed,
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

  const isFinal = gameStatusDescription === "Final";
  const isScheduled =
    gameStatusDescription === "Scheduled" ||
    gameStatusDescription === "Not Started";
  const inProgress = gameStatusDescription === "In Progress";
  const isOvertime = gameStatusShortDetail?.includes("OT");
  const endOfPeriod = gameStatusDescription === "End of Period";
  const styles = CenterInfoStyles;
  const displayPeriod = formatQuarter(period);

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
            <Text style={styles.period}>{displayPeriod}</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.clock}>{clock}</Text>
          </View>
          {renderDownAndDistance()}
        </>
      )}

      {endOfPeriod && (
        <View style={styles.infoWrapper}>
          <Text style={styles.period}>End of {displayPeriod}</Text>
        </View>
      )}

      {/* Halftime */}
      {gameStatusDescription === "Halftime" && (
        <Text style={styles.finalText}>Halftime</Text>
      )}

      {/* Final */}
      {gameStatusDescription === "Final" && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusShortDetail}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date || ""}</Text>
        </View>
      )}

      {/* Canceled, Postponed, Delayed */}
      {(gameStatusDescription === "Canceled" ||
        gameStatusDescription === "Postponed" ||
        gameStatusDescription === "Delayed") && (
        <Text style={styles.finalText}>{status}</Text>
      )}

      {gameStatusDescription !== "Final" && (
        <Text style={styles.broadcast}>{broadcast}</Text>
      )}
    </View>
  );
}

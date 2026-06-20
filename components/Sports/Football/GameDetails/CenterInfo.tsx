import { Colors } from "constants/styles";
import { Text, View } from "react-native";
import { gameInfoStyles } from "styles/GameDetailStyles/GameInfoStyles";

type CenterInfoProps = {
  date: string;
  time: string;
  period?: number | string | null;
  clock: string;
  downDistance: string | undefined | null;
  isDark: boolean;
  broadcast?: string;
  headlineText?: string;
  gameStatusDescription?: string;
  gameStatusShortDetail?: string;
  redzone: boolean;
};

export function CenterInfo({
  date,
  time,
  period,
  clock,
  downDistance,
  broadcast,
  gameStatusDescription,
  gameStatusShortDetail,
  redzone = false,
  isDark,
}: CenterInfoProps) {
  const styles = gameInfoStyles(isDark);
  const isRedzone = redzone;

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

  const renderdownDistance = () => {
    if (!downDistance) return null;

    const [beforeAt, afterAt] = downDistance.split(" at ");

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

  return (
    <View style={styles.container}>
      {isScheduled && (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{date || "TBD"}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{time || ""}</Text>
        </View>
      )}

      {inProgress && (
        <>
          <View style={styles.infoWrapper}>
            <>
              <Text style={styles.date}>{period}</Text>
              <View style={styles.statusDivider} />
              <Text style={styles.clock}>{clock}</Text>
            </>
          </View>
          {renderdownDistance()}
        </>
      )}

      {endOfPeriod && (
        <>
          <View style={styles.infoWrapper}>
            <>
              <Text style={styles.date}>{period}</Text>
              <View style={styles.statusDivider} />
              <Text style={styles.clock}>{clock}</Text>
            </>
          </View>
          {renderdownDistance()}
        </>
      )}

      {isHalftime && <Text style={styles.clock}>Halftime</Text>}

      {isFinal && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusShortDetail}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date || ""}</Text>
        </View>
      )}

      {(isCanceled || isDelayed || isForfeited || isPostponed) && (
        <Text style={styles.finalText}>{gameStatusDescription}</Text>
      )}

      {/* 📺 Broadcast */}
      {broadcast && <Text style={styles.broadcasts}>{broadcast}</Text>}
    </View>
  );
}

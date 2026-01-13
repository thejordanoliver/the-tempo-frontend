import { Colors, Fonts } from "constants/Styles";

import { Text, View } from "react-native";
import { getStyles } from "styles/GameDetailStyles/CenterInfoStyles";
import { NFLTeam } from "types/nfl";

type NFLGameCenterInfoProps = {
  date: string;
  time: string;
  period?: string;
  clock?: string;
  downAndDistance?: string;
  isDark: boolean;
  homeTeam: NFLTeam;
  awayTeam: NFLTeam;
  broadcast?: string;
  headlineText?: string;
  gameStatusDescription?: string;
  gameStatusShortDetail?: string;
  redzone: boolean;
};

export function NFLGameCenterInfo({
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
}: NFLGameCenterInfoProps) {
  const inProgress = gameStatusDescription === "In Progress" || gameStatusDescription === "End of Period";
  const isHalftime = gameStatusShortDetail === "Halftime";
  const isFinal = gameStatusDescription == "Final";
  const isOvertime = gameStatusShortDetail?.includes("OT");
  const isCanceled = gameStatusDescription == "Canceled";
  const isScheduled = gameStatusDescription === "Scheduled" || gameStatusDescription === "Not Started";
  const styles = getStyles(isDark);
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
            {!gameStatusShortDetail?.toLowerCase().includes("end") &&
              !isOvertime && (
                <>
                  <Text style={styles.date}>{period}</Text>
                  <View style={styles.statusDivider} />
                  <Text style={styles.clock}>{clock}</Text>
                </>
              )}
            {!gameStatusShortDetail?.toLowerCase().includes("end") &&
              isOvertime && (
                <>
                  <Text style={styles.clock}>{gameStatusShortDetail}</Text>
                </>
              )}

            {gameStatusShortDetail?.toLowerCase().includes("end") && (
              <Text style={styles.clock}>End of {period}</Text>
            )}
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
      {broadcast && (
        <Text style={styles.broadcasts}>{broadcast}</Text>
      )}
    </View>
  );
}

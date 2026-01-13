// ./CFB/GamePreview/CenterInfo.tsx

import { Colors } from "constants/Colors";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { getStyles } from "styles/GamePreviewStyles/CenterInfoStyles";
import { CFBTeam } from "types/cfb";

type NFLGameCenterInfoProps = {
  status:
    | "Scheduled"
    | "In Progress"
    | "Final"
    | "Canceled"
    | "Postponed"
    | "Delayed"
    | "Halftime";
  date: string;
  week: string;
  time: string;
  period?: string;
  clock?: string;
  homeTeam: CFBTeam;
  awayTeam: CFBTeam;
  apiDate?: string;
  downAndDistance: string;
  broadcasts: string;
  gameStatusDescription: string;
  gameStatusShortDetail: string;
  redzone: boolean;
};

export function NFLCenterInfo({
  status,
  date,
  time,
  redzone,
  period,
  clock,
  downAndDistance,
  broadcasts,
  gameStatusDescription,
  gameStatusShortDetail,
}: NFLGameCenterInfoProps) {
  // ✅ handles quarters & OT
  const formatQuarter = useMemo(
    () => (short: string) => {
      if (!short) return "";
      const map: Record<string, string> = {
        Q1: "1st",
        Q2: "2nd",
        Q3: "3rd",
        Q4: "4th",
        OT: "OT",
        HT: "Halftime",
        FT: "Final",
        AOT: "Final/OT",
      };

      // Handle OT variations like OT1, OT2, 2OT
      if (short.toUpperCase().startsWith("OT")) {
        const num = short.replace(/[^0-9]/g, "");
        return num ? `${num}OT` : "OT";
      }

      return map[short] ?? short;
    },
    []
  );

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

  // ✅ detect end-of-quarter using gameStatusShortDetail

  const isFinal = gameStatusDescription === "Final";
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "End of Period";
  const isOvertime = gameStatusShortDetail?.includes("OT");

  const styles = getStyles;

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
            {!gameStatusShortDetail?.toLowerCase().includes("end") &&
              !isOvertime && (
                <>
                  <Text style={styles.period}>{period}</Text>
                  <View style={styles.statusDivider} />
                  <Text style={styles.clock}>{clock}</Text>
                </>
              )}
            {!gameStatusShortDetail?.toLowerCase().includes("end of") &&
              isOvertime && (
                <>
                  <Text style={styles.clock}>{gameStatusShortDetail}</Text>
                </>
              )}

            {gameStatusShortDetail?.toLowerCase().includes("end of") && (
              <Text style={styles.clock}>End of {period}</Text>
            )}
          </View>
          {renderDownAndDistance()}
        </>
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
      {(status === "Canceled" ||
        status === "Postponed" ||
        status === "Delayed") && <Text style={styles.finalText}>{status}</Text>}

      {status !== "Final" && <Text style={styles.broadcast}>{broadcasts}</Text>}
    </View>
  );
}

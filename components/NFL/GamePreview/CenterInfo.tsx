// ./NFL/GamePreview/NFLGameCenterInfo.tsx
import { useNFLGameBroadcasts } from "hooks/NFLHooks/useNFLGameBroadcasts";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { getStyles } from "styles/GamePreviewStyles/centerInfoStyles.styles";
import { NFLTeam } from "types/nfl";
import { getBroadcastDisplay } from "utils/matchBroadcast";
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
  colors: Record<string, string>;
  isDark: boolean;
  playoffInfo?: string | string[];
  homeTeam: NFLTeam;
  awayTeam: NFLTeam;
  lighter: boolean;
  apiDate?: string;
  downAndDistance: string;
  isPlayoff: boolean;
};

export function NFLCenterInfo({
  status,
  week,
  date,
  time,
  period,
  clock,
  colors,
  isDark,
  homeTeam,
  awayTeam,
  lighter,
  apiDate,
  downAndDistance,
  isPlayoff,
}: NFLGameCenterInfoProps) {
  // --- Broadcasts ---
  const { broadcasts, loading } = useNFLGameBroadcasts(
    homeTeam.code,
    awayTeam.code,
    apiDate
  );

  const broadcastText = getBroadcastDisplay(broadcasts);
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

  // ✅ detect OT for Final state
  const wentOT =
    (period && period.toUpperCase().includes("OT")) ||
    (status && ["AOT"].includes(status as string));

  const styles = getStyles;

  return (
    <View style={styles.container}>
      {/* Scheduled */}
      {status === "Scheduled" && (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{date || "TBD"}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.time}>{time || ""}</Text>
        </View>
      )}

      {/* In Progress */}
      {status === "In Progress" && (
        <>
          <View style={styles.infoWrapper}>
            <Text style={styles.date}>
              {period ? formatQuarter(period) : ""}
            </Text>
            <View style={styles.statusDivider} />
            {clock && <Text style={styles.date}>{clock}</Text>}
          </View>
          {downAndDistance && (
            <Text style={styles.downAndDistance}>{downAndDistance}</Text>
          )}
        </>
      )}

      {/* Halftime */}
      {status === "Halftime" && (
        <>
          <Text style={styles.date}>Halftime</Text>
        </>
      )}

      {/* Final */}
      {status === "Final" && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{wentOT ? "Final/OT" : "Final"}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date || ""}</Text>
        </View>
      )}

      {/* Canceled, Postponed, Delayed */}
      {(status === "Canceled" ||
        status === "Postponed" ||
        status === "Delayed") && <Text style={styles.finalText}>{status}</Text>}

      {broadcastText && <Text style={styles.broadcast}>{broadcastText}</Text>}
    </View>
  );
}

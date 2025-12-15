// ./NFL/GamePreview/NFLGameCenterInfo.tsx
import { useNFLGameBroadcasts } from "hooks/NFLHooks/useNFLGameBroadcasts";
import { Text, View } from "react-native";
import { getStyles } from "styles/GamePreviewStyles/centerInfoStyles.styles";
import { NFLTeam } from "types/nfl";
import { getBroadcastDisplay } from "utils/matchBroadcast";

type NFLGameCenterInfoProps = {
  status: string;
  date: string;
  week: string;
  time: string;
  period?: string; // ESPN short (Q1, Q2, HT, OT, etc)
  clock?: string;
  colors: Record<string, string>;
  isDark: boolean;
  homeTeam: NFLTeam;
  awayTeam: NFLTeam;
  lighter: boolean;
  apiDate?: string;
  downAndDistance: string;
  isPlayoff: boolean;
};

export function NFLCenterInfo({
  status,
  date,
  time,
  period,
  clock,
  isDark,
  homeTeam,
  awayTeam,
  lighter,
  apiDate,
  downAndDistance,
}: NFLGameCenterInfoProps) {
  const styles = getStyles;

  // ---------------------------------------------------
  // FETCH BROADCAST ASSIGNMENT
  // ---------------------------------------------------
  const { broadcasts } = useNFLGameBroadcasts(
    homeTeam.espnID,
    awayTeam.espnID,
    apiDate
  );
  const broadcastText = getBroadcastDisplay(broadcasts);

  // ---------------------------------------------------
  // PERIOD / QUARTER FORMATTING (MATCHING GAMECARD)
  // ---------------------------------------------------
  const formatPeriod = (raw?: string) => {
    if (!raw) return "";

    const u = raw.toUpperCase();

    // Overtime → 1OT, 2OT, etc
    if (u.startsWith("OT")) {
      const num = u.replace(/[^0-9]/g, "");
      return num ? `${num}OT` : "OT";
    }

    const qMap: Record<string, string> = {
      Q1: "1st",
      Q2: "2nd",
      Q3: "3rd",
      Q4: "4th",
      HT: "Halftime",
      FT: "Final",
      AOT: "Final/OT",
    };

    return qMap[u] ?? raw;
  };

  const formattedPeriod = formatPeriod(period);
  const isFinalOT =
    period?.toUpperCase().includes("OT") || period?.toUpperCase() === "AOT";

  // ---------------------------------------------------
  // RENDER CONTENT BY STATUS
  // ---------------------------------------------------
  const renderStatus = () => {
    switch (status) {
      case "Scheduled":
        return (
          <View style={styles.infoWrapper}>
            <Text style={styles.date}>{date}</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.time}>{time}</Text>
          </View>
        );

      case "In Progress":
        return (
          <>
            <View style={styles.infoWrapper}>
              <Text style={styles.period}>{formattedPeriod}</Text>
              {clock && <View style={styles.statusDivider} />}
              {clock && <Text style={styles.clock}>{clock}</Text>}
            </View>

            {downAndDistance ? (
              <Text style={styles.downAndDistance}>{downAndDistance}</Text>
            ) : null}
          </>
        );

      case "Halftime":
        return <Text style={styles.date}>Halftime</Text>;

      case "EndOfPeriod":
        return <Text style={styles.date}>{formattedPeriod}</Text>;

      case "Final":
        return (
          <View style={styles.infoWrapper}>
            <Text style={styles.finalText}>
              {isFinalOT ? "Final/OT" : "Final"}
            </Text>
            <View style={styles.finalStatusDivider} />
            <Text style={styles.finalText}>{date}</Text>
          </View>
        );

      case "Canceled":
      case "Postponed":
      case "Delayed":
        return <Text style={styles.finalText}>{status}</Text>;
    }
  };

  // ---------------------------------------------------
  // FINAL RENDER
  // ---------------------------------------------------
  return (
    <View style={styles.container}>
      {renderStatus()}

      {/* BROADCAST ALWAYS LAST */}
      {status !== "Final" && (
        <Text style={styles.broadcast}>{broadcastText}</Text>
      )}
    </View>
  );
}

import { Fonts } from "constants/fonts";
import { useNFLGameBroadcasts } from "hooks/NFLHooks/useNFLGameBroadcasts";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NFLTeam } from "types/nfl";

type NFLGameCenterInfoProps = {
  status: string;
  date: string;
  time: string;
  period?: string;
  clock?: string;
  downAndDistance?: string;
  colors: Record<string, string>;
  isDark: boolean;
  playoffInfo?: string | string[];
  homeTeam: NFLTeam;
  awayTeam: NFLTeam;
};

export function NFLGameCenterInfo({
  status,
  date,
  time,
  period,
  clock,
  downAndDistance,
  colors,
  isDark,
  playoffInfo,
  homeTeam,
  awayTeam,
}: NFLGameCenterInfoProps) {
  const { broadcasts, loading } = useNFLGameBroadcasts(
    homeTeam.code,
    awayTeam.code,
    date
  );

  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (
      status?.toLowerCase().includes("progress") ||
      status?.toLowerCase().includes("live") ||
      status?.toLowerCase().includes("half")
    ) {
      const interval = setInterval(() => {
        setTick((t) => t + 1);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const formatQuarter = useMemo(
    () => (short: string) => {
      if (!short) return "";
      const val = short.toUpperCase();
      if (val.includes("Q1")) return "1st";
      if (val.includes("Q2")) return "2nd";
      if (val.includes("Q3")) return "3rd";
      if (val.includes("Q4")) return "4th";
      if (val.includes("OT")) return "OT";
      if (val.includes("HALF")) return "Halftime";
      if (val.includes("END")) return "End";
      return short;
    },
    []
  );

  // ---- Derived State ----
  const normalizedStatus = status?.toLowerCase() ?? "";
  const isInProgress =
    normalizedStatus.includes("progress") ||
    normalizedStatus.includes("live") ||
    normalizedStatus.includes("end");
  const isHalftime = normalizedStatus.includes("half");
  const isFinal = normalizedStatus.includes("final");
  const isScheduled = normalizedStatus.includes("schedule");
  const isCanceled =
    normalizedStatus.includes("canceled") ||
    normalizedStatus.includes("postponed") ||
    normalizedStatus.includes("delayed");

  const getBroadcastDisplay = () => {
    if (!broadcasts.length) return "";
    const names = broadcasts
      .map((b) =>
        Array.isArray(b.names) ? b.names.join("/") : b.name || b.shortName || ""
      )
      .filter(Boolean)
      .map((n) => {
        const lower = n.toLowerCase();
        if (lower.includes("prime video")) return "Prime";
        if (lower.includes("nfl net")) return "NFLN";
        if (lower.includes("fox")) return "FOX";
        if (lower.includes("espn") && lower.includes("abc")) return "ESPN/ABC";
        if (lower.includes("tnt") && lower.includes("hbo max"))
          return "TNT/MAX";
        return n;
      });
    return names.includes("ESPN") && names.includes("ABC")
      ? "ESPN/ABC"
      : names[0];
  };

  const styles = getStyles(isDark);

  // ---- Playoff Stage ----
  const renderPlayoffInfo = () => {
    if (!playoffInfo) return null;
    const validStages = ["Wild Card", "Divisional", "Conference", "Super Bowl"];
    const stages = Array.isArray(playoffInfo) ? playoffInfo : [playoffInfo];
    const filtered = stages.filter((stage) =>
      validStages.some((valid) =>
        stage.toLowerCase().includes(valid.toLowerCase())
      )
    );
    if (filtered.length === 0) return null;
    return (
      <View style={styles.playoffContainer}>
        {filtered.map((stage, i) => (
          <Text key={i} style={styles.playoffText}>
            {stage}
          </Text>
        ))}
      </View>
    );
  };

  // ---- Period Display ----
  const renderPeriodDisplay = () => {
    if (!period) return null;

    const upper = period.toUpperCase();
    if (upper.includes("END")) {
      const q = upper.match(/Q\d/)?.[0] ?? "";
      return (
        <Text style={styles.date}>
          End {q ? formatQuarter(q) : formatQuarter(period)}
        </Text>
      );
    }

    return <Text style={styles.date}>{formatQuarter(period)}</Text>;
  };

  // ---- Render ----
  return (
    <View style={styles.container}>
      {renderPlayoffInfo()}

      {/* Scheduled */}
      {isScheduled && (
        <>
          <Text style={styles.date}>{date || "TBD"}</Text>
          <Text style={styles.time}>{time || ""}</Text>
        </>
      )}

      {/* In Progress + End of Period */}
      {isInProgress && (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {renderPeriodDisplay()}
            <View style={styles.divider} />
            {clock && !period?.toLowerCase().includes("end") && (
              <Text style={styles.clock}>{clock}</Text>
            )}
          </View>
          {downAndDistance && (
            <Text style={styles.downAndDistance}>{downAndDistance}</Text>
          )}
        </>
      )}

      {/* Halftime */}
      {isHalftime && <Text style={styles.date}>Halftime</Text>}

      {/* Final */}
      {isFinal && (
        <>
          <Text style={styles.finalText}>
            {period && period.toUpperCase().includes("OT")
              ? "Final/OT"
              : "Final"}
          </Text>
          <Text style={styles.dateFinal}>{date || ""}</Text>
        </>
      )}

      {/* Canceled / Delayed / Postponed */}
      {isCanceled && <Text style={styles.finalText}>{status}</Text>}

      {/* Broadcasts */}
      {getBroadcastDisplay() && (
        <View>
          {broadcasts.length > 0 && (
            <Text style={styles.broadcasts}>{getBroadcastDisplay()}</Text>
          )}
        </View>
      )}
    </View>
  );
}

export const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 8,
      marginBottom: 8,
    },
    date: {
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? "#fff" : "#1d1d1d",
      fontSize: 14,
    },
    time: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? "#aaa" : "#555",
      fontSize: 12,
    },
    broadcasts: {
      fontSize: 10,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? "#aaa" : "#555",
      textAlign: "center",
    },
    clock: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 14,
      color: isDark ? "#ff4444" : "#cc0000",
      textAlign: "center",
    },
    downAndDistance: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 12,
      color: isDark ? "#aaa" : "#555",
      marginTop: 2,
      textAlign: "center",
    },
    dateFinal: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? "rgba(255,255,255, 1)" : "rgba(0, 0, 0, .5)",
      fontSize: 14,
    },
    finalText: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 16,
      color: isDark ? "#ff4444" : "#cc0000",
      textAlign: "center",
    },
    divider: {
      height: 14,
      width: 1,
      backgroundColor: isDark ? "rgba(255,255,255, 1)" : "rgba(0, 0, 0, .5)",
    },
    playoffContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    playoffText: {
      fontSize: 13,
      color: isDark ? "#fff" : "#1d1d1d",
      fontFamily: Fonts.OSEXTRALIGHT,
      textAlign: "center",
    },
  });

import { useCFBGameBroadcasts } from "hooks/CFBHooks/useCFBGameBroadcasts";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { getStyles } from "styles/GameDetailStyles/CenterInfo.styles";
import { CFBTeam } from "types/cfb";
import { getBroadcastDisplay } from "utils/matchBroadcast";

type CFBGameCenterInfoProps = {
  status: string;
  date: string;
  time: string;
  period?: string;
  clock?: string;
  downAndDistance?: string;
  colors: Record<string, string>;
  isDark: boolean;
  playoffInfo?: string | string[]; // 👈 accepted but not used yet
  homeTeam: CFBTeam;
  awayTeam: CFBTeam;

  broadcastNetworks: string;
};

export function CFBGameCenterInfo({
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

  broadcastNetworks,
}: CFBGameCenterInfoProps) {
  const styles = getStyles(isDark);
  const { broadcasts, loading } = useCFBGameBroadcasts(
    homeTeam.code ?? "",
    awayTeam.code ?? "",
    date ?? ""
  );

  const broadcastText = getBroadcastDisplay(broadcasts);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (status === "In Progress" || status === "Halftime") {
      const interval = setInterval(() => {
        setTick((t) => t + 1);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const formatQuarter = useMemo(
    () => (short: string) => {
      switch (short) {
        case "Q1":
          return "1st";
        case "Q2":
          return "2nd";
        case "Q3":
          return "3rd";
        case "Q4":
          return "4th";
        case "OT":
          return "OT";
        default:
          return short;
      }
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
      {isInProgress && (
        <>
          <View style={styles.infoWrapper}>
            {renderPeriodDisplay()}
            <View style={styles.statusDivider} />
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
      {status === "Halftime" && (
        <>
          <Text style={styles.clock}>Halftime</Text>
        </>
      )}

      {/* Final */}
      {isFinal && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>
            {period && period.toUpperCase().includes("OT")
              ? "Final/OT"
              : "Final"}
          </Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date || ""}</Text>
        </View>
      )}

      {/* Canceled / Delayed / Postponed */}
      {isCanceled && <Text style={styles.finalText}>{status}</Text>}

      {/* 📺 Broadcast */}
      {broadcastNetworks && (
        <Text style={styles.broadcasts}>{broadcastNetworks}</Text>
      )}
    </View>
  );
}

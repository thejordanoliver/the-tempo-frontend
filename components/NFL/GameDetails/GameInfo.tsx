import { useNFLGameBroadcasts } from "hooks/NFLHooks/useNFLGameBroadcasts";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { getStyles } from "styles/GameDetailStyles/CenterInfo.styles";
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
  broadcastNetworks?: string,
  headlineText?: string;
};

export function NFLGameCenterInfo({
  status,
  date,
  time,
  period,
  clock,
  downAndDistance,
  isDark,
  playoffInfo,
  homeTeam,
  awayTeam,
  broadcastNetworks,
  headlineText
}: NFLGameCenterInfoProps) {
  const { broadcasts, loading } = useNFLGameBroadcasts(
    homeTeam.code ?? "",
    awayTeam.code ?? "",
    date ?? ""
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
      {isHalftime && <Text style={styles.date}>Halftime</Text>}

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

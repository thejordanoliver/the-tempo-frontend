import { Fonts } from "constants/fonts";
import { useCFBGameBroadcasts } from "hooks/CFBHooks/useCFBGameBroadcasts";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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
}: CFBGameCenterInfoProps) {
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


  const styles = getStyles(isDark);

  return (
    <View style={styles.container}>
      {/* Scheduled */}
      {status === "Scheduled" && (
        <>
          <Text style={styles.date}>{date || "TBD"}</Text>
          <Text style={styles.time}>{time || ""}</Text>
        </>
      )}

      {/* In Progress */}
      {status === "In Progress" && (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Text style={styles.date}>
              {period ? formatQuarter(period) : ""}
            </Text>
            <View style={styles.divider} />
            {clock && <Text style={styles.clock}>{clock}</Text>}
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
        <>
          <Text style={styles.finalText}>
            {period && period.toUpperCase().includes("OT")
              ? "Final/OT"
              : "Final"}
          </Text>
          <Text style={styles.dateFinal}>{date || ""}</Text>
        </>
      )}

      {/* Canceled, Postponed, Delayed */}
      {(status === "Canceled" ||
        status === "Postponed" ||
        status === "Delayed") && <Text style={styles.finalText}>{status}</Text>}

      {/* Broadcasts */}

      <View>
   
{broadcastText && (
  <Text style={styles.broadcasts}>
    {broadcastText}
  </Text>
)}
      </View>
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

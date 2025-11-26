import { Text, View } from "react-native";
import { getStyles } from "styles/GameDetailStyles/CenterInfo.styles";

type GameInfoProps = {
  status: "Scheduled" | "In Play" | "Final" | "Canceled" | "Postponed";
  date: string;
  time: string;
  period?: string;
  clock?: string;
  halftime?: boolean; // 👈 NEW
  colors: Record<string, string>;
  isDark: boolean;
  playoffInfo?: string | string[];
  homeTeam: string;
  awayTeam: string;
  broadcastNetworks?: string;
};

export function GameInfo({
  status,
  date,
  time,
  period,
  clock,
  halftime, // 👈 added here
  isDark,
  playoffInfo,
  homeTeam,
  awayTeam,
  broadcastNetworks,
}: GameInfoProps) {
  const styles = getStyles(isDark);

  const renderPlayoffInfo = () => {
    if (!playoffInfo) return null;
    if (Array.isArray(playoffInfo)) {
      return playoffInfo.map((line, index) => (
        <Text key={index} style={[styles.playoffText]}>
          {line}
        </Text>
      ));
    }
    return <Text style={[styles.playoffText]}>{playoffInfo}</Text>;
  };

  return (
    <View style={styles.container}>
    

      {/* 🏀 Scheduled */}
      {status === "Scheduled" && (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{time}</Text>
        </View>
      )}

      {/* 🕒 In Play */}
      {status === "In Play" && (
        <>
          {halftime ? (
            // 🟢 Halftime display
            <Text style={styles.finalText}>Halftime</Text>
          ) : (
            // 🕓 Normal in-play display, hide clock if no value
            <View style={styles.infoWrapper}>
              {period && <Text style={styles.date}>{period}</Text>}
              {period && clock && <View style={styles.statusDivider} />}
              {clock && <Text style={styles.clock}>{clock}</Text>}
            </View>
          )}
        </>
      )}

      {/* 🏁 Final */}
      {status === "Final" && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Final</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date}</Text>
        </View>
      )}

      {/* ❌ Canceled */}
      {status === "Canceled" && (
        <>
          <Text style={styles.finalText}>Canceled</Text>
          <Text style={styles.date}>{date}</Text>
        </>
      )}

      {/* ⏸️ Postponed */}
      {status === "Postponed" && (
        <>
          <Text style={styles.finalText}>Postponed</Text>
          <Text style={styles.date}>{date}</Text>
        </>
      )}

      {/* 📺 Broadcast */}
      {broadcastNetworks && (
        <Text style={styles.broadcasts}>{broadcastNetworks}</Text>
      )}

      {renderPlayoffInfo()}
    </View>
  );
}

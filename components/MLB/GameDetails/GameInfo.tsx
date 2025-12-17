import { Text, View } from "react-native";
import { getStyles } from "styles/GameDetailStyles/CenterInfoStyles";

type GameInfoProps = {
  status: "Scheduled" | "In Play" | "Final" | "Canceled" | "Postponed";
  date: string;
  time: string;
  inning?: string;
  colors: Record<string, string>;
  isDark: boolean;
  broadcastNetworks?: string;
};

export function GameInfo({
  status,
  date,
  time,
  inning,
  isDark,

  broadcastNetworks,
}: GameInfoProps) {
  const styles = getStyles(isDark);

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
          <View style={styles.infoWrapper}>
            {inning && <Text style={styles.date}>{inning}</Text>}
          </View>
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
    </View>
  );
}

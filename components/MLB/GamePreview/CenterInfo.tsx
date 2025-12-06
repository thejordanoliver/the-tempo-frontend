import { Colors } from "constants/Colors";
import { Text, View } from "react-native";
import { getStyles } from "styles/GamePreviewStyles/centerInfoStyles.styles";
import { MLBTeam } from "types/mlb";

export type MLBGameStatus =
  | "Not Started"
  | "In Progress"
  | "Final"
  | "Canceled"
  | "Postponed"
  | "Delayed"
  | "Abandoned";

type CenterInfoProps = {
  status: MLBGameStatus;
  date: string;
  time: string;
  inning?: string | null; // "Top 3", "Bot 7", "Inning 5"
  isDark: boolean;
  homeTeam: MLBTeam;
  awayTeam: MLBTeam;
  colors: Record<string, string>;
  lighter?: boolean;
  apiDate?: string;
};

export function CenterInfo({
  status,
  date,
  time,
  inning,
  isDark,
}: CenterInfoProps) {
  const textColor = isDark ? Colors.white : Colors.black;
  const styles = getStyles;
  return (
    <View style={styles.container}>
      {/* NOT STARTED */}
      {status === "Not Started" && (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.time}>{time}</Text>
        </View>
      )}

      {/* IN PROGRESS */}
      {status === "In Progress" && (
        <View style={styles.infoWrapper}>
          <Text style={styles.period}>{inning ?? "Live"}</Text>
        </View>
      )}

      {/* FINAL */}
      {status === "Final" && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Final</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date}</Text>
        </View>
      )}

      {/* SPECIAL STATUSES */}
      {(status === "Canceled" ||
        status === "Postponed" ||
        status === "Delayed" ||
        status === "Abandoned") && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{status}</Text>
        </View>
      )}
    </View>
  );
}

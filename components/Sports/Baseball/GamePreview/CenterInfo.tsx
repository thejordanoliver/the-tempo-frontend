import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { Text, View } from "react-native";
import { centerInfoStyles } from "styles/ModalsStyles/GamePreviewStyles/CenterInfoStyles";
import { BasesIndicator } from "../GameDetails/BasesIndicator";

type GameInfoProps = {
  gameStatusDescription: string;
  gameStatusDetail: string;
  date: string;
  time: string;
  isTopInning: boolean;
  broadcast?: string;
  outs: number;
  bases: {
    onFirst: boolean;
    onSecond: boolean;
    onThird: boolean;
  };
};

export function CenterInfo({
  gameStatusDescription,
  gameStatusDetail,
  date,
  time,
  broadcast,
  isTopInning,
  outs,
  bases,
}: GameInfoProps) {
  const styles = centerInfoStyles;

  const inProgress = gameStatusDescription === "In Progress";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const isFinal = gameStatusDescription === "Final";
  const isScheduled = gameStatusDescription === "Scheduled";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isPostponed = gameStatusDescription === "Postponed";
  const countOuts = Math.min(Math.max(outs ?? 0, 0), 3);

  const getOuts = [1, 2, 3].map((i) => (
    <Ionicons
      key={i}
      size={10}
      name={i <= countOuts ? "ellipse" : "ellipse-outline"}
      color={Colors.dark.lightRed}
    />
  ));

  return (
    <View style={styles.container}>
      {isScheduled && (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{time}</Text>
        </View>
      )}

      {inProgress && (
        <View>
          <View style={styles.infoWrapper}>
            <Ionicons
              name={isTopInning ? "caret-up" : "caret-down"}
              size={14}
              color={Colors.white}
            />
            <Text style={styles.date}>{gameStatusDetail}</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.finalText}>{getOuts}</Text>
          </View>
          <View style={{ marginVertical: 2 }}>
            <BasesIndicator bases={bases} isDark={true} size={10} />
          </View>
        </View>
      )}

      {endOfPeriod && (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{gameStatusDetail}</Text>
        </View>
      )}

      {isFinal && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDetail}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date}</Text>
        </View>
      )}

      {(isCanceled || isDelayed || isForfeited || isPostponed) && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDescription}</Text>
        </View>
      )}

      {broadcast && (inProgress || isScheduled) && (
        <Text style={styles.broadcast}>{broadcast}</Text>
      )}
    </View>
  );
}

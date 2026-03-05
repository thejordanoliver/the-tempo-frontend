import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/Styles";
import { Text, View } from "react-native";
import { getStyles } from "styles/ModalsStyles/GamePreviewStyles/CenterInfoStyles";
import BasesIndicator from "../GameDetails/BasesIndicator";
type GameInfoProps = {
  gameStatusDescription: string;
  gameStatusDetail: string;
  date: string;
  time: string;
  inning?: string;
  isTopInning: boolean;
  broadcastNetworks?: string;
  outs: number;
  bases: {
    first: boolean;
    second: boolean;
    third: boolean;
  };
};

export function GameInfo({
  gameStatusDescription,
  gameStatusDetail,
  date,
  time,
  broadcastNetworks,
  isTopInning,
  outs,
  bases,
}: GameInfoProps) {
  const styles = getStyles;

  const inProgress =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "End of Period";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const isFinal = gameStatusDescription === "Final";
  const isScheduled = gameStatusDescription === "Scheduled";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isPostponed = gameStatusDescription === "Postponed";
  const isHalftime = gameStatusDescription === "Halftime";
  return (
    <View style={styles.container}>
      {/* ⚾️ Scheduled */}
      {isScheduled && (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{time}</Text>
        </View>
      )}

      {/* 🕒 In Play */}
      {inProgress && (
        <View>
          <View style={[styles.infoWrapper, { marginBottom: 2 }]}>
            <Ionicons
              name={isTopInning ? "caret-up" : "caret-down"}
              size={14}
              color={Colors.white}
            />
            <Text style={styles.date}>{gameStatusDetail}</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.finalText}>Outs: {outs}</Text>
          </View>
          <View style={{ marginTop: 2 }}>
            <BasesIndicator bases={bases} isDark={true} />
          </View>
        </View>
      )}

      {/* 🏁 Final */}
      {isFinal && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDetail}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{date}</Text>
        </View>
      )}

      {/* ❌ Canceled */}
      {isCanceled && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Canceled</Text>
        </View>
      )}

      {/* ⏸️ Postponed */}
      {isPostponed && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Postponed</Text>
        </View>
      )}
      {/* ⏸️ Postponed */}
      {isPostponed && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Postponed</Text>
        </View>
      )}

      {/* ⏸️ Delayed */}
      {isDelayed && (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>Delayed</Text>
        </View>
      )}

      {/* 📺 Broadcast */}
      {(broadcastNetworks && inProgress) ||
        (isScheduled && (
          <Text style={styles.broadcast}>{broadcastNetworks}</Text>
        ))}
    </View>
  );
}

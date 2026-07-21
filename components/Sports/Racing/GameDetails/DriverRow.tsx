import { Colors } from "constants/styles";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import {
  DriverRowStyles,
  RacingProps,
} from "styles/GameDetailStyles/TeamRow.styles";

export const DriverRow = ({
  id,
  headshot,
  name,
  flag,
  laps,
  time,
  rank,
  isDark,
  isWinner,
  gameStatusDescription,
}: RacingProps) => {
  const router = useRouter();
  const styles = DriverRowStyles(isDark);

  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";

  const route = "/player/racing/[id]";

  const handleTeamPress = () => {
    if (id)
      router.push({
        pathname: route,
        params: {
          id: id,
        },
      });
  };

  /* -----------------------------------------------------
   * Styles
   * --------------------------------------------------- */
  const getScoreStyle = () => {
    if (isWinner === false && isFinal) {
      return { color: Colors.midTone, opacity: 0.5 };
    }

    if (inProgress) {
      return { color: isDark ? Colors.white : Colors.black };
    }

    if (isFinal) {
      return {
        color: isWinner
          ? isDark
            ? Colors.dark.white
            : Colors.light.black
          : Colors.midTone,
      };
    }

    return { color: isDark ? Colors.white : Colors.black };
  };

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <View style={styles.row}>
      {/* Driver Info */}
      <Text style={styles.rank}>{rank}</Text>
      <View style={styles.driverInfoContainer}>
        <Pressable onPress={handleTeamPress}>
          <View style={styles.headshotContainer}>
            <Image source={{ uri: headshot ?? "" }} style={styles.headshot} />
          </View>
        </Pressable>

        <View style={styles.teamInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subText}>Laps: {laps}</Text>
          <Text style={styles.subText}>Time: {time}</Text>
        </View>
      </View>
    </View>
  );
};

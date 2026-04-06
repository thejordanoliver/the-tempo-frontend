import { Colors } from "constants/styles";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import {
  MMAProps,
  sizeStyles,
  teamRowStyles,
} from "styles/GameDetailStyles/TeamRow.styles";

export const FighterRow = ({
  fighter,
  isDark,
  isFirstFighter = false,
  isWinner,
  size = "medium",
  gameStatusDescription,
}: MMAProps) => {
  const router = useRouter();
  const styles = teamRowStyles(isDark);

  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";

  const record = fighter.record === "-" ? "" : fighter.record;
  const displayRecord = record ?? "0-0";
  const route = "/player/mma/[id]";
  // -----------------------------------------------------
  // Routing
  // -----------------------------------------------------
  const handleTeamPress = () => {
    if (fighter.id)
      router.push({
        pathname: route,
        params: {
          id: fighter.id,
        },
      });
  };

  /* -----------------------------------------------------
   * Styles
   * --------------------------------------------------- */
  const getScoreStyle = () => {
    if (isWinner == false && isFinal) {
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
      {/* Home Score */}
      {isFirstFighter && (
        <Text
          style={[
            styles.preGameRecord,
            [styles.preGameRecord, sizeStyles[size].preGameRecord],
            getScoreStyle(),
          ]}
        >
          {displayRecord}
        </Text>
      )}

      {/* Team Info */}
      <View style={styles.teamInfoContainer}>
        <Pressable onPress={handleTeamPress}>
          <View style={styles.headshotContainer}>
            <Image
              source={{ uri: fighter.headshot }}
              style={sizeStyles[size].logo}
            />
          </View>
        </Pressable>

        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{fighter.name}</Text>
        </View>
      </View>

      {/* Away Score */}
      {!isFirstFighter && (
        <Text
          style={[
            styles.preGameRecord,
            [styles.preGameRecord, sizeStyles[size].preGameRecord],
            getScoreStyle(),
          ]}
        >
          {displayRecord}
        </Text>
      )}
    </View>
  );
};

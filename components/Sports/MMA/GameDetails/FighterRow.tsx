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

  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";

  const record = fighter.record === "-" ? "" : fighter.record;
  const isInvalidRecord = record === "-";
  const displayRecord = isInvalidRecord ? "" : record;
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

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <View style={styles.row}>
      {/* Home Score */}
      {isFirstFighter && (
        <Text style={styles.preGameRecord}>{displayRecord}</Text>
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
        <Text style={styles.preGameRecord}>{displayRecord}</Text>
      )}
    </View>
  );
};

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
}: RacingProps) => {
  const router = useRouter();
  const styles = DriverRowStyles(isDark);

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

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <View style={styles.row}>
      {/* Driver Info */}
      <Text style={styles.rank}>{rank}</Text>
      <View style={styles.driverContainer}>
        <View>
          <View style={styles.profileContainer}>
            <Pressable onPress={handleTeamPress}>
              <View style={styles.headshotContainer}>
                <Image
                  source={{ uri: headshot ?? "" }}
                  style={styles.headshot}
                />
              </View>
            </Pressable>
            <Text style={styles.name}>{name}</Text>
          </View>
        </View>

        <View>
          <Text style={styles.subText}>Laps: {laps}</Text>
          <Text style={styles.subText}>Time: {time}</Text>
        </View>
      </View>
    </View>
  );
};

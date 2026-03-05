import { Ionicons } from "@expo/vector-icons";
import CenteredHeader from "components/Headings/CenteredHeader";
import { Colors, Fonts } from "constants/Styles";
import { FootballRecruit } from "hooks/CFBHooks/useFootballRecruits";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  recruit: FootballRecruit;
  isDark: boolean;
};

export default function StarRating({ recruit, isDark }: Props) {
  const styles = starRatingStyles(isDark);

  return (
    <View style={styles.container}>
      <CenteredHeader>Player Rating</CenteredHeader>
      <View style={styles.card}>
        <View style={styles.starRow}>
          {[...Array(5)].map((_, i) => {
            const filled = i < recruit.stars;

            return (
              <Ionicons
                key={i}
                name={filled ? "star" : "star-outline"}
                size={20}
                color={
                  filled
                    ? isDark
                      ? Colors.dark.yellow
                      : Colors.light.yellow
                    : isDark
                      ? Colors.lightGray
                      : Colors.darkGray
                }
              />
            );
          })}
        </View>
        <View style={styles.scoreRow}>
          <Text style={styles.score}>{recruit.score}</Text>
        </View>
      </View>
    </View>
  );
}

const starRatingStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginVertical: 12,
      paddingHorizontal: 12,
    },
    card: {
      borderRadius: 8,
      justifyContent: "center",
      padding: 16,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    starRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 4,
    },
    scoreRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },

    score: {
      fontSize: 20,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });

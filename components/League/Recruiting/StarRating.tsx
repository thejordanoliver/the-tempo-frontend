import { Recruit } from "@/types/recruiting/players";
import { Ionicons } from "@expo/vector-icons";
import CenteredHeader from "components/Headings/CenteredHeader";
import { Colors, Fonts } from "constants/styles";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  recruit: Recruit;
  isDark: boolean;
};

export default function StarRating({ recruit, isDark }: Props) {
  const styles = starRatingStyles(isDark);

  return (
    <View style={styles.container}>
      <CenteredHeader isDark={isDark}>Player Rating</CenteredHeader>
      <View style={styles.card}>
        <View style={styles.scoreRow}>
          <Text style={styles.score}>{recruit.score}</Text>
        </View>
        <View style={styles.starRow}>
          {[...Array(5)].map((_, i) => {
            const filled = i < recruit?.stars;

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
      </View>
    </View>
  );
}

const starRatingStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginVertical: 12,
    },
    card: {
      justifyContent: "center",
      padding: 16,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    starRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    scoreRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    score: {
      fontFamily: Fonts.BOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
    },
  });

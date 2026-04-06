import { Colors, Fonts } from "constants/styles";
import { StyleSheet, Text, View, useColorScheme } from "react-native";

export function PlaceholderGameCard() {
  const isDark = useColorScheme() === "dark";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark
            ? Colors.dark.itemBackground
            : Colors.light.itemBackground,
          borderColor: isDark ? Colors.lightGray : Colors.darkGray,
        },
      ]}
    >
      <Text style={styles.byeText}>BYE</Text>
      <Text style={styles.note}>Top seed advances automatically</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
    borderWidth: 0.5,
  },
  byeText: {
    fontFamily: Fonts.OSBOLD,
    fontSize: 18,
    marginBottom: 4,
  },
  note: {
    fontFamily: Fonts.OSREGULAR,
    fontSize: 12,
    opacity: 0.7,
  },
});

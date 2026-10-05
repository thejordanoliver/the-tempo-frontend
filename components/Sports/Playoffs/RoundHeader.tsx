import { Colors, Fonts } from "constants/styles";
import { StyleSheet, Text, View } from "react-native";

export const ROUND_HEADER_HEIGHT = 32;

/** Position the header box itself so multiline titles stay centered over a round. */
export function RoundHeader({ title, isDark, centerX, width = 176, top = 12 }: {
  title: string;
  isDark: boolean;
  centerX?: number;
  width?: number;
  top?: number;
}) {
  return (
    <View style={[styles.header, { width }, centerX === undefined ? null : {
      position: "absolute", left: centerX - width / 2, top,
    }]}>
      <Text numberOfLines={2} style={[styles.title, {
        color: isDark ? Colors.white : Colors.black,
      }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: ROUND_HEADER_HEIGHT, alignItems: "center", justifyContent: "center" },
  title: {
    width: "100%", textAlign: "center", textTransform: "uppercase",
    fontFamily: Fonts.MEDIUM, fontSize: 15, lineHeight: 16,
  },
});

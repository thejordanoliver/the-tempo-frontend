import { Colors, Fonts, MIN_TOUCH_TARGET } from "constants/styles";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  label: string;
  isDark: boolean;
  canMoveEarlier: boolean;
  canMoveLater: boolean;
  onMove: (direction: -1 | 1) => void;
};

/** Single-press alternatives to dragging, available to keyboard and touch users. */
export default function ReorderButtons({ label, isDark, canMoveEarlier, canMoveLater, onMove }: Props) {
  return (
    <View style={styles.row}>
      {([-1, 1] as const).map((direction) => {
        const disabled = direction === -1 ? !canMoveEarlier : !canMoveLater;
        return (
          <Pressable
            key={direction}
            accessibilityRole="button"
            accessibilityLabel={`Move ${label} ${direction === -1 ? "earlier" : "later"}`}
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={() => onMove(direction)}
            style={[styles.button, { borderColor: isDark ? Colors.dark.icon : Colors.light.icon, opacity: disabled ? 0.5 : 1 }]}
          >
            <Text style={[styles.text, { color: isDark ? Colors.dark.text : Colors.light.text }]}>{direction === -1 ? "←" : "→"}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "center", marginTop: 4 },
  button: { minHeight: MIN_TOUCH_TARGET, minWidth: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center", borderWidth: 1, borderRadius: 8 },
  text: { fontFamily: Fonts.REGULAR, fontSize: 18 },
});

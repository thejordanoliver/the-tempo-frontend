import { Colors } from "constants/styles";
import { StyleSheet } from "react-native";

export const tickerSettingsSectionStyles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: Colors.midTone,
    borderRadius: 8,
    padding: 12,
    overflow: "hidden",
  },
  sectionContent: { gap: 12 },
  optionContainer: { flex: 0, marginBottom: 0 },
  noBottomBorder: { borderBottomWidth: 0 },
  option: { minHeight: 44, gap: 12 },
  optionCopy: { flex: 1, gap: 2 },
  optionValue: { flexShrink: 1, textAlign: "right", maxWidth: "55%" },
  toggle: { minHeight: 48, gap: 16 },
  toggleCopy: { flex: 1, gap: 3 },
  logo: { width: 32, height: 32 },
  swatch: { width: 22, height: 22, borderRadius: 11, borderWidth: 1 },
  muted: { opacity: 0.5 },
});

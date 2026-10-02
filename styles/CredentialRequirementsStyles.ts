import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const credentialRequirementsStyles = (isDark: boolean) => StyleSheet.create({
  container: { gap: 6, marginBottom: 16, paddingHorizontal: 4 },
  title: { fontFamily: Fonts.MEDIUM, fontSize: 13, color: isDark ? Colors.white : Colors.black },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  text: { flex: 1, fontFamily: Fonts.REGULAR, fontSize: 13, color: isDark ? Colors.lightGray : Colors.darkGray },
  met: { color: isDark ? Colors.dark.green : Colors.light.green },
});

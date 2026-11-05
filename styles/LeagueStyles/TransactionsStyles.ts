import { Colors, globalStyles } from "@/constants/styles";
import { StyleSheet } from "react-native";

export const TransactionsStyles = (isDark: boolean) =>
  StyleSheet.create({
    list: { flex: 1 },
    contentContainerStyle: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    itemContainer: {
      padding: 12,
      gap: 6,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    teamRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    teamName: { ...globalStyles(isDark).textMedium, flexShrink: 1 },
    logo: {
      height: 25,
      width: 25,
    },
    logoContainer: {
      padding: 4,
      marginRight: 4,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.midTone,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    description: {
      ...globalStyles(isDark).text,
    },
    formattedDate: {
      ...globalStyles(isDark).caption,
    },
    retryButton: { paddingHorizontal: 16, paddingVertical: 10 },
    footer: { padding: 16 },
  });

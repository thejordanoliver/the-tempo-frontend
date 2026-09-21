import { StyleSheet } from "react-native";

export const newsListStyles = (isDark: boolean) =>
  StyleSheet.create({
    list: {
      flex: 1,
    },
    container: {
      flexGrow: 1,
      gap: 12,
      paddingHorizontal: 12,
      paddingBottom: 100,
    },
  });

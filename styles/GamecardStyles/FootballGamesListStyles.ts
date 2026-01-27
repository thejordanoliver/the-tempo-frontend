import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";

export const footballGamesListStyle = (isDark: boolean) => StyleSheet.create({
  skeletonWrapper: {
    paddingHorizontal: 12,
    gap: 12,
  },
  skeletonGridWrapper: {
    gap: 12,
  },
  gridListContainer: {
    paddingBottom: 20,
  },
  contentContainer: {},
  gridItem: {
    flex: 1,
    marginHorizontal: 12,
  },
  emptyText: {
    fontFamily: Fonts.OSLIGHT,
    fontSize: 16,
    textAlign: "center",
    color: Colors.midTone,
  },
  errorText: {
    textAlign: "center",
    padding: 20,
    fontFamily: Fonts.OSREGULAR,
    fontSize: 16,
    color: isDark ? Colors.dark.lightRed : Colors.light.red,
  },
  headerWrapper: {
    marginHorizontal: 12,
  },
  gridRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
});

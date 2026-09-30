import { StyleSheet } from "react-native";

const SPACING = 12;

export const EditFavoritesStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING,
  },

  tabs: {
    marginBottom: SPACING,
  },

  selectorContainer: {},

  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING,
    marginVertical: SPACING,
    paddingHorizontal: SPACING,
  },

  button: {
    flex: 1,
  },
});

import { StyleSheet } from "react-native";

const SPACING = {
  md: 12,
};

export const editFavoritesStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },

  tabs: {
    marginBottom: SPACING.md,
  },

  selectorContainer: {
    flex: 1,
  },

  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },

  button: {
    flex: 1,
  },
});

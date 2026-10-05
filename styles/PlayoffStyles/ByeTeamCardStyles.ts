import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const BYE_CARD_HEIGHT = 58;

export const ByeTeamCardStyles = (isDark: boolean) => StyleSheet.create({
  card: {
    height: BYE_CARD_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    backgroundColor: isDark ? Colors.dark.itemBackground : Colors.light.itemBackground,
    elevation: 5,
  },
  seed: {
    width: 20,
    color: isDark ? Colors.white : Colors.black,
    fontFamily: Fonts.BOLD,
    fontSize: 18,
    textAlign: "center",
  },
  logo: { width: 34, height: 34 },
  teamName: {
    flex: 1,
    marginLeft: 4,
    color: isDark ? Colors.white : Colors.black,
    fontFamily: Fonts.BOLD,
    fontSize: 18,
  },
  byeLabel: {
    color: Colors.midTone,
    fontFamily: Fonts.MEDIUM,
    fontSize: 12,
  },
});

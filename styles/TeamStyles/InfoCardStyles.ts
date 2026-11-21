import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
import { getContrastingTextColor } from "utils/ui/color";

export const InfoCardStyles = (teamColor: string) =>
  StyleSheet.create({
    cardContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      height: 80,
      marginBottom: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      backgroundColor: teamColor ?? Colors.midTone,
    },
    value: {
      flex: 1,
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: getContrastingTextColor(teamColor),
    },
  });

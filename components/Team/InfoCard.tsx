import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getContrastingTextColor } from "utils/ui/color";
import HeadingTwo from "../Headings/HeadingTwo";

type Props = {
  label: string;
  value?: string | number | ReactNode | string[] | number[];
  teamColor?: string;
};

export default function InfoCard({
  label,
  value,
  teamColor = Colors.midTone,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = InfoCardStyles(isDark, teamColor);
  let formattedValue: string | ReactNode;

  if (Array.isArray(value)) {
    formattedValue = value.join(", ");
  } else {
    formattedValue = typeof value === "string" ? value.trim() : value;
  }

  return (
    <>
      <HeadingTwo isDark={isDark}>{label}</HeadingTwo>

      <View style={styles.cardContainer}>
        <Text style={styles.value}>
          {formattedValue === null ||
          formattedValue === undefined ||
          formattedValue === ""
            ? "Not available"
            : formattedValue}
        </Text>
      </View>
    </>
  );
}

export const InfoCardStyles = (isDark: boolean, teamColor: string) =>
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

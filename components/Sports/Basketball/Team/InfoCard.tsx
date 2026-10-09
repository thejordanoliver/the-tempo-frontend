import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { ReactNode } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { getContrastingTextColor } from "utils/color";

type Props = {
  label: string;
  value?: string | number | ReactNode | string[] | number[];
  image?: string | null;
  teamColor?: string;
};

export default function InfoCard({
  label,
  value,
  image,
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
      <Text style={styles.label}>{label}</Text>

      <View style={styles.cardContainer}>
        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
          </View>
        )}

        <Text style={styles.value}>{formattedValue === null || formattedValue === undefined || formattedValue === "" ? "Not available" : formattedValue}</Text>
      </View>
    </>
  );
}

export const InfoCardStyles = (isDark: boolean, teamColor: string) =>
  StyleSheet.create({
    label: {
      marginBottom: 8,
      paddingBottom: 4,
      borderBottomWidth: 0.5,
      borderBottomColor: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.MEDIUM,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
    },

    cardContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      minHeight: 80,
      marginBottom: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      backgroundColor: teamColor ?? Colors.midTone,
    },

    imageContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      borderWidth: 1,
      borderColor: getContrastingTextColor(teamColor),
      borderRadius: 100,
      overflow: "hidden",
      width: 54,
      height: 54,
      paddingTop: 8,
    },

    image: {
      width: 64,
      height: 64,
      resizeMode: "contain",
    },

    value: {
      flex: 1,
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: getContrastingTextColor(teamColor),
    },
  });

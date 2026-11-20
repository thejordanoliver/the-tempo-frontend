import { InfoCardStyles } from "@/styles/TeamStyles/InfoCardStyles";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { ReactNode } from "react";
import { Text, View } from "react-native";
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
  const styles = InfoCardStyles(teamColor);
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

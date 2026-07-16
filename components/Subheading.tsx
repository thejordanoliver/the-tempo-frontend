// components/Subheading.tsx
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React from "react";
import { StyleSheet, Text } from "react-native";
type Props = {
  children: React.ReactNode;
};

const Subheading: React.FC<Props> = ({ children }) => {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = subHeadingStyles(isDark);
  return <Text style={[styles.heading]}>{children}</Text>;
};

const subHeadingStyles = (isDark: boolean) =>
  StyleSheet.create({
    heading: {
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      marginBottom: 8,
      paddingBottom: 4,
    },
  });

export default Subheading;

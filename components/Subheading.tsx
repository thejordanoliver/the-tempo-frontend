// components/Subheading.tsx
import { Colors, Fonts } from "constants/styles";
import React from "react";
import { StyleSheet, Text, useColorScheme } from "react-native";
type Props = {
  children: React.ReactNode;
};

const Subheading: React.FC<Props> = ({ children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
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

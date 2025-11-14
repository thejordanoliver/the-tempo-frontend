// components/Heading.tsx
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import React from "react";
import { StyleSheet, Text, TextStyle, useColorScheme } from "react-native";

type Props = {
  children: React.ReactNode;
  lighter?: boolean; // optional lighter color scheme
  style?: TextStyle | TextStyle[]; // ✅ new prop
};

const HeadingTwo: React.FC<Props> = ({ children, lighter = false, style }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = headerStyles(isDark, lighter);

  return <Text style={[styles.heading, style]}>{children}</Text>; // ✅ merge styles
};

const headerStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    heading: {
      fontSize: 24,
      fontFamily: Fonts.OSMEDIUM,
      paddingBottom: 4,
      marginBottom: 12,
      borderBottomWidth: 1,
      color: lighter
        ? Colors.dark.white
        : isDark
        ? Colors.dark.white
        : Colors.light.black,
      borderBottomColor: lighter
        ? Colors.midTone
        : isDark
        ? Colors.midTone
        : Colors.midTone,
    },
  });

export default HeadingTwo;

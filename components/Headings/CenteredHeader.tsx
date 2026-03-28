// components/Heading.tsx
import { Colors, Fonts } from "constants/Styles";
import React from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  isDark: boolean; // optional lighter color scheme
  style?: TextStyle | TextStyle[]; // ✅ new prop
};

const CenteredHeader: React.FC<Props> = ({ children, isDark, style }) => {
  const styles = headerStyles(isDark);

  return <Text style={[styles.heading, style]}>{children}</Text>; // ✅ merge styles
};

const headerStyles = (isDark: boolean) =>
  StyleSheet.create({
    heading: {
      fontSize: 24,
      fontFamily: Fonts.OSMEDIUM,
      paddingBottom: 4,
      marginBottom: 12,
      borderBottomWidth: 1,
      textAlign:"center",
      color: isDark ? Colors.dark.white : Colors.light.black,
      borderBottomColor: isDark ? Colors.midTone : Colors.midTone,
    },
  });

export default CenteredHeader;

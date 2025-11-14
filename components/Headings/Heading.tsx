// components/Heading.tsx
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import React from "react";
import { StyleSheet, Text, useColorScheme } from "react-native";
type Props = {
  children: React.ReactNode;
};

const Heading: React.FC<Props> = ({ children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = headerStyles(isDark);

  return <Text style={styles.heading}>{children}</Text>;
};

const headerStyles = (isDark: boolean) =>
  StyleSheet.create({
    heading: {
      fontSize: 24,
      fontFamily: Fonts.OSMEDIUM,
      marginTop: 8,
      paddingBottom: 4,
      borderBottomWidth: 1,
      marginHorizontal: 12,
      color: isDark ? Colors.white : Colors.black,
      borderBottomColor: isDark ? Colors.midTone : Colors.midTone,
    },
  });

export default Heading;

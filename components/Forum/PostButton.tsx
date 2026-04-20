import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type PostButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  title: string;
};

export default function PostButton({ onPress, disabled }: PostButtonProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = postButtonStyles(isDark);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
      style={styles.button}
    >
      <Text style={styles.buttonText}>Post</Text>
    </TouchableOpacity>
  );
}

const postButtonStyles = (isDark: boolean) =>
  StyleSheet.create({
    button: {
      marginVertical: 24,
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    buttonText: {
      fontSize: 16,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.black : Colors.white,
    },
  });

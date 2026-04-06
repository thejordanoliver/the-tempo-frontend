import { Colors, Fonts } from "constants/styles";
import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

type SaveButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  title?: string;
  style?: StyleProp<ViewStyle>;
  isDark: boolean;
};

export default function Button({
  onPress,
  disabled,
  title = "Save",
  style,
  isDark,
}: SaveButtonProps) {
  const styles = buttonStyles(isDark);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.saveButton,
        {
          backgroundColor: isDark ? Colors.white : Colors.black,
          opacity: pressed || disabled ? 0.7 : 1,
        },
        style, // <-- apply custom styles here
      ]}
    >
      <Text
        style={[
          styles.saveButtonText,
          { color: isDark ? Colors.black : Colors.white },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const buttonStyles = (isDark: boolean) =>
  StyleSheet.create({
    saveButton: {
      marginVertical: 24,
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    saveButtonText: {
      fontSize: 16,
      color: isDark ? Colors.black : Colors.white,
      fontFamily: Fonts.OSMEDIUM,
    },
  });

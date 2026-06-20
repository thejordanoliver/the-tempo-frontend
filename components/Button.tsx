import { Colors, Fonts } from "constants/styles";
import React, { ReactNode } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

type ButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  isDark: boolean;
  children?: ReactNode | string; // ✅ accept string or ReactNode
};

export default function Button({
  onPress,
  disabled,
  style,
  isDark,
  children,
}: ButtonProps) {
  const styles = buttonStyles(isDark);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          opacity: pressed || disabled ? 0.7 : 1,
        },
        style,
      ]}
    >
      {children ? (
        React.Children.map(children, (child) =>
          typeof child === "string" ? (
            <Text style={styles.buttonText}>{child}</Text>
          ) : (
            child
          ),
        )
      ) : (
        <Text style={styles.buttonText}>Save</Text>
      )}
    </Pressable>
  );
}

const buttonStyles = (isDark: boolean) =>
  StyleSheet.create({
    button: {
      padding: 16,
      borderRadius: 12,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    buttonText: {
      color: isDark ? Colors.black : Colors.white,
      fontSize: 16,
      fontFamily: Fonts.OSMEDIUM,
    },
  });

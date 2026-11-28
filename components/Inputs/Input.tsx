import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

type InputProps = Omit<TextInputProps, "value" | "onChangeText"> & {
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export default function Input({
  value,
  onChangeText,
  multiline = false,
  placeholder,
  containerStyle,
  inputStyle,
  labelStyle,
  ...rest
}: InputProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = inputStyles(isDark);

  return (
    <View style={containerStyle}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholder={placeholder}
        accessibilityLabel={placeholder}
        placeholderTextColor={
          isDark ? Colors.dark.secondaryText : Colors.light.secondaryText
        }
        style={[styles.input, multiline && styles.bioInput, inputStyle]}
        {...rest}
      />
    </View>
  );
}

const inputStyles = (isDark: boolean) =>
  StyleSheet.create({
    input: {
      width: "100%",
      marginBottom: 12,
      padding: 16,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },

    bioInput: {
      minHeight: 100,
      textAlignVertical: "top",
    },
  });

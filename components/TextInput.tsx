import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
type LabeledInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  placeholder?: string;
  containerStyle?: object | object[];
  inputStyle?: object | object[];
  labelStyle?: object | object[];
  [key: string]: any; // for other TextInput props
};

export default function TextInputComponent({
  value,
  onChangeText,
  multiline = false,
  placeholder,
  containerStyle,
  inputStyle,
  labelStyle,
  ...rest
}: LabeledInputProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = inputStyles(isDark);

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={Colors.midTone}
        style={[styles.input, multiline && styles.bioInput, inputStyle]}
        {...rest}
      />
    </View>
  );
}

const inputStyles = (isDark: boolean) =>
  StyleSheet.create({
    input: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      padding: 16,
      borderRadius: 8,
      marginBottom: 12,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
    },
    bioInput: {
      height: 100,
      textAlignVertical: "top",
    },
  });

import { Colors, Fonts } from "constants/styles";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
type LabeledInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  placeholder?: string;
  containerStyle?: object | object[];
  inputStyle?: object | object[];
  labelStyle?: object | object[];
  [key: string]: any; // for other TextInput props
  hint?: string | null;
};

export default function LabeledInput({
  label,
  value,
  onChangeText,
  multiline = false,
  placeholder,
  containerStyle,
  inputStyle,
  labelStyle,
  hint,
  ...rest
}: LabeledInputProps) {
  const isDark = useColorScheme() === "dark";
  const styles = labeledInputStyles(isDark);

  const MAX_LENGTH = 150;

  const handleChange = (text: string) => {
    if (multiline && text.length > MAX_LENGTH) return;
    onChangeText(text);
  };

  return (
    <View style={containerStyle}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={handleChange}
        multiline={multiline}
        maxLength={multiline ? MAX_LENGTH : undefined}
        placeholder={placeholder}
        placeholderTextColor={Colors.midTone}
        style={[
          styles.input,
          inputStyle,
          multiline && { minHeight: 120, textAlignVertical: "top" },
        ]}
        {...rest}
      />

      <View style={styles.hintContainer}>
        {multiline && (
          <Text style={styles.count}>
            {value.length}/{MAX_LENGTH}
          </Text>
        )}
        {!!hint && <Text style={styles.errorText}>{hint}</Text>}
      </View>
    </View>
  );
}

const labeledInputStyles = (isDark: boolean) =>
  StyleSheet.create({
    label: {
      marginVertical: 12,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
    },
    input: {
      padding: 20,
      borderRadius: 8,
      fontSize: 16,
      marginBottom: 12,
      fontFamily: Fonts.OSLIGHT,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      color: isDark ? Colors.white : Colors.black,
    },

    hintContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    errorText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
    },
    count: {
      color: Colors.midTone,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
    },
  });

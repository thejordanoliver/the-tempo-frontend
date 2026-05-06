import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

type LabeledInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  placeholder?: string;
  enforceMaxLength?: boolean;
  [key: string]: any; // for other TextInput props
  hint?: string | null;
};

export default function LabeledInput({
  label,
  value,
  onChangeText,
  multiline = false,
  placeholder,
  enforceMaxLength = true,
  hint,
  ...rest
}: LabeledInputProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = labeledInputStyles(isDark);

  const MAX_LENGTH = 150;

  const handleChange = (text: string) => {
    if (enforceMaxLength && multiline && text.length > MAX_LENGTH) return;
    onChangeText(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={handleChange}
        multiline={multiline}
        maxLength={multiline ? MAX_LENGTH : undefined}
        placeholder={placeholder}
        placeholderTextColor={Colors.midTone}
        style={[
          styles.input,

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
    container: { marginBottom: 10 },
    label: {
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.transparentLightGray : Colors.transparentDarkGray,
      letterSpacing: 0.3,
      textTransform: "uppercase",
      paddingLeft: 4,
    },
    input: {
      paddingVertical: 20,
      paddingHorizontal: 12,
      color: isDark ? Colors.white : Colors.black,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 12,
      marginVertical: 12,
      fontSize: 15,
      fontFamily: Fonts.OSREGULAR,
      borderWidth: 1,
      borderColor: isDark
        ? Colors.transparentLightGray
        : Colors.transparentDarkGray,
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

import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import type { ReactNode } from "react";
import {
  Controller,
  type Control,
  type FieldPathByValue,
  type FieldValues,
} from "react-hook-form";
import {
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { formStyles } from "styles/FormStyles";

type FormInputProps<T extends FieldValues> = Omit<
  TextInputProps,
  "value" | "onChangeText" | "onBlur"
> & {
  control: Control<T>;
  name: FieldPathByValue<T, string>;
  normalize?: (value: string) => string;
  onChange?: () => void;
  helperText?: string;
  trailing?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function FormInput<T extends FieldValues>({
  control,
  name,
  normalize,
  onChange,
  helperText,
  trailing,
  containerStyle,
  style,
  ...inputProps
}: FormInputProps<T>) {
  const { resolvedColorScheme } = usePreferences();
  const styles = formStyles(resolvedColorScheme === "dark");

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={styles.field}>
          <View
            style={[styles.input, containerStyle, fieldState.error && styles.inputError]}
          >
            <TextInput
              placeholderTextColor={Colors.midTone}
              accessibilityLabel={inputProps.placeholder}
              {...inputProps}
              ref={field.ref}
              value={field.value}
              onChangeText={(value) => {
                field.onChange(normalize ? normalize(value) : value);
                onChange?.();
              }}
              onBlur={field.onBlur}
              style={[styles.inputText, style]}
            />
            {trailing}
          </View>
          {!!fieldState.error?.message && (
            <Text selectable style={styles.fieldErrorText}>
              {fieldState.error.message}
            </Text>
          )}
          {!!helperText && (
            <Text selectable style={styles.fieldHelperText}>{helperText}</Text>
          )}
        </View>
      )}
    />
  );
}

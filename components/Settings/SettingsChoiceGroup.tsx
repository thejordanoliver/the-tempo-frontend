import { Ionicons } from "@expo/vector-icons";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useRef, type ComponentProps, type ComponentRef } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import {
  settingsDetailStyles,
  settingsOverviewStyles,
} from "styles/SettingsStyles";
import SettingsSection from "./SettingsSection";

type ChoiceRef = ComponentRef<typeof Pressable>;
type ChoiceKeyEvent = Parameters<
  NonNullable<ComponentProps<typeof Pressable>["onKeyDown"]>
>[0];

export type SettingsChoice<T extends string> = {
  value: T;
  label: string;
  accessibilityLabel?: string;
  icon: ComponentProps<typeof Ionicons>["name"];
};

type Props<T extends string> = {
  title: string;
  choices: readonly SettingsChoice<T>[];
  value: T;
  onChange: (value: T) => void;
  busy?: boolean;
  error?: string | null;
};

export default function SettingsChoiceGroup<T extends string>({
  title,
  choices,
  value,
  onChange,
  busy = false,
  error,
}: Props<T>) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const theme = Colors[resolvedColorScheme];
  const page = settingsOverviewStyles(isDark);
  const styles = settingsDetailStyles(isDark);
  const text = globalStyles(isDark);
  const optionRefs = useRef<Partial<Record<T, ChoiceRef | null>>>({});

  const handleKeyDown = (event: ChoiceKeyEvent, index: number) => {
    if (busy) return;
    const { key } = event.nativeEvent;

    if (key === " ") {
      event.preventDefault();
      onChange(choices[index].value);
      return;
    }

    const previous = key === "ArrowLeft" || key === "ArrowUp";
    const next = key === "ArrowRight" || key === "ArrowDown";
    if (!previous && !next) return;

    event.preventDefault();
    const target =
      choices[(index + (previous ? -1 : 1) + choices.length) % choices.length]
        .value;
    optionRefs.current[target]?.focus();
    onChange(target);
  };

  return (
    <SettingsSection title={title}>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={title}
        aria-busy={busy}
        style={[page.group, styles.panel, styles.choices]}
      >
        {choices.map(
          ({ value: option, label, accessibilityLabel, icon }, index) => {
            const checked = value === option;
            const tabIndex = checked && !busy ? 0 : -1;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityLabel={accessibilityLabel ?? label}
                accessibilityState={{ checked, disabled: busy }}
                aria-checked={checked}
                {...(Platform.OS === "web" && {
                  tabIndex,
                  onKeyDown: (event: ChoiceKeyEvent) =>
                    handleKeyDown(event, index),
                  ref: (element: ChoiceRef | null) => {
                    optionRefs.current[option] = element;
                  },
                })}
                disabled={busy}
                onPress={() => onChange(option)}
                style={({ pressed }) => [
                  styles.choice,
                  (checked || pressed) && styles.choiceSelected,
                  busy && !checked && styles.choiceDisabled,
                ]}
              >
                {checked && (
                  <Ionicons
                    name="checkmark"
                    size={15}
                    color={theme.text}
                    style={styles.choiceMark}
                    aria-hidden
                  />
                )}
                <Ionicons
                  name={icon}
                  size={22}
                  color={theme.text}
                  aria-hidden
                />
                <Text style={[text.subtitle, styles.choiceLabel]}>{label}</Text>
              </Pressable>
            );
          },
        )}
      </View>
      {error && (
        <Text
          accessibilityRole="alert"
          style={[text.errorText, styles.errorPanel]}
        >
          {error}
        </Text>
      )}
    </SettingsSection>
  );
}

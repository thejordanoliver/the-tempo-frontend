import HeadingTwo from "components/Headings/HeadingTwo";
import type { PropsWithChildren } from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { settingsStyles } from "styles/SettingsStyles";
import TickerIcon, { type TickerIconName } from "./TickerIcon";
import { useTickerTheme } from "./TickerUI";

type SectionProps = PropsWithChildren<{
  title: string;
  icon?: TickerIconName;
}>;

type OptionProps = {
  label: string;
  value?: string;
  description?: string;
  icon?: TickerIconName;
  logo?: ImageSourcePropType;
  selected?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

type ToggleProps = {
  label: string;
  description?: string;
  icon?: TickerIconName;
  value: boolean;
  disabled: boolean;
  onValueChange: (value: boolean) => void;
};

export function TickerSettingsSection({ title, icon, children }: SectionProps) {
  const { isDark, colors } = useTickerTheme();
  return (
    <View>
      <HeadingTwo isDark={isDark}>
        {icon && (
          <>
            <TickerIcon name={icon} size={18} color={colors.text} />{" "}
          </>
        )}
        {title}
      </HeadingTwo>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export function TickerSettingOption({
  label,
  value,
  description,
  icon,
  logo,
  selected,
  expanded,
  disabled = false,
  onPress,
}: OptionProps) {
  const { isDark, colors, text } = useTickerTheme();
  const preferences = settingsStyles(isDark);
  const accessory = selected
    ? "checkmark"
    : selected === undefined
      ? expanded
        ? "chevron-up"
        : "chevron-forward"
      : null;

  return (
    <View
      style={[
        preferences.optionButtonContainer,
        styles.optionContainer,
        selected && { borderBottomColor: colors.text },
      ]}
    >
      <Pressable
        accessibilityRole={selected === undefined ? "button" : "radio"}
        accessibilityLabel={label}
        accessibilityState={{
          disabled,
          ...(selected === undefined ? {} : { checked: selected }),
          ...(expanded === undefined ? {} : { expanded }),
        }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          preferences.optionButton,
          styles.option,
          (disabled || pressed) && styles.muted,
        ]}
      >
        {logo ? (
          <Image
            source={logo}
            style={styles.logo}
            resizeMode="contain"
            accessibilityElementsHidden
          />
        ) : (
          icon && <TickerIcon name={icon} color={colors.icon} />
        )}
        <View style={styles.optionCopy}>
          <Text style={preferences.optionText}>{label}</Text>
          {description && <Text style={text.caption}>{description}</Text>}
        </View>
        {value && (
          <Text style={[text.secondaryText, styles.optionValue]}>{value}</Text>
        )}
        {accessory && (
          <TickerIcon
            name={accessory}
            size={selected ? 24 : 20}
            color={colors.text}
          />
        )}
      </Pressable>
    </View>
  );
}

export function TickerSettingToggle({
  label,
  description,
  icon,
  value,
  disabled,
  onValueChange,
}: ToggleProps) {
  const { isDark, colors, text } = useTickerTheme();
  const preferences = settingsStyles(isDark);
  return (
    <View style={[preferences.optionButtonContainer, styles.optionContainer]}>
      <View style={[preferences.optionButton, styles.toggle]}>
        {icon && <TickerIcon name={icon} color={colors.icon} />}
        <View style={styles.toggleCopy}>
          <Text style={preferences.optionText}>{label}</Text>
          {description && <Text style={text.caption}>{description}</Text>}
        </View>
        <Switch
          accessibilityLabel={label}
          value={value}
          disabled={disabled}
          onValueChange={onValueChange}
          trackColor={{ true: colors.blue, false: colors.gray }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContent: { gap: 12 },
  optionContainer: { flex: 0, marginBottom: 0 },
  option: { minHeight: 44, gap: 12 },
  optionCopy: { flex: 1, gap: 2 },
  optionValue: { flexShrink: 1, textAlign: "right", maxWidth: "55%" },
  toggle: { minHeight: 48, gap: 16 },
  toggleCopy: { flex: 1, gap: 3 },
  logo: { width: 32, height: 32 },
  muted: { opacity: 0.5 },
});

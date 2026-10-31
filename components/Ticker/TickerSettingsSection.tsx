import { useTickerTheme } from "hooks/TickerHooks/useTickerTheme";
import HeadingTwo from "components/Headings/HeadingTwo";
import type { PropsWithChildren } from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  Switch,
  Text,
  View,
} from "react-native";
import { settingsStyles } from "styles/SettingsStyles";
import { tickerSettingsSectionStyles } from "styles/TickerStyles/TickerSettingsSectionStyles";
import TickerIcon, { type TickerIconName } from "./TickerIcon";

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
  swatchColor?: string;
  selected?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  hideBottomBorder?: boolean;
  onPress: () => void;
};

type ToggleProps = {
  label: string;
  description?: string;
  icon?: TickerIconName;
  value: boolean;
  disabled: boolean;
  hideBottomBorder?: boolean;
  onValueChange: (value: boolean) => void;
};

export function TickerSettingsSection({ title, icon, children }: SectionProps) {
  const { isDark, colors } = useTickerTheme();
  return (
    <View style={tickerSettingsSectionStyles.wrapper}>
      <HeadingTwo isDark={isDark}>
        {icon && (
          <>
            <TickerIcon name={icon} size={18} color={colors.text} />{" "}
          </>
        )}
        {title}
      </HeadingTwo>
      <View style={tickerSettingsSectionStyles.sectionContent}>{children}</View>
    </View>
  );
}

export function TickerSettingOption({
  label,
  value,
  description,
  icon,
  logo,
  swatchColor,
  selected,
  expanded,
  disabled = false,
  hideBottomBorder = false,
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
        tickerSettingsSectionStyles.optionContainer,
        selected && { borderBottomColor: colors.text },
        hideBottomBorder && tickerSettingsSectionStyles.noBottomBorder,
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
          tickerSettingsSectionStyles.option,
          (disabled || pressed) && tickerSettingsSectionStyles.muted,
        ]}
      >
        {swatchColor ? (
          <View
            accessibilityElementsHidden
            style={[
              tickerSettingsSectionStyles.swatch,
              { backgroundColor: swatchColor, borderColor: colors.icon },
            ]}
          />
        ) : logo ? (
          <Image
            source={logo}
            style={tickerSettingsSectionStyles.logo}
            resizeMode="contain"
            accessibilityElementsHidden
          />
        ) : (
          icon && <TickerIcon name={icon} color={colors.icon} />
        )}
        <View style={tickerSettingsSectionStyles.optionCopy}>
          <Text style={preferences.optionText}>{label}</Text>
          {description && <Text style={text.caption}>{description}</Text>}
        </View>
        {value && (
          <Text
            style={[
              text.secondaryText,
              tickerSettingsSectionStyles.optionValue,
            ]}
          >
            {value}
          </Text>
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
  hideBottomBorder = false,
  onValueChange,
}: ToggleProps) {
  const { isDark, colors, text } = useTickerTheme();
  const preferences = settingsStyles(isDark);
  return (
    <View
      style={[
        preferences.optionButtonContainer,
        tickerSettingsSectionStyles.optionContainer,
        hideBottomBorder && tickerSettingsSectionStyles.noBottomBorder,
      ]}
    >
      <View
        style={[preferences.optionButton, tickerSettingsSectionStyles.toggle]}
      >
        {icon && <TickerIcon name={icon} color={colors.icon} />}
        <View style={tickerSettingsSectionStyles.toggleCopy}>
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

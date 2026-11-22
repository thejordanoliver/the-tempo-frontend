import { useTickerTheme } from "hooks/TickerHooks/useTickerTheme";
import HeadingTwo from "components/Headings/HeadingTwo";
import SettingsSection from "components/Settings/SettingsSection";
import { Colors } from "constants/styles";
import { createContext, useContext, type PropsWithChildren } from "react";
import {
  Image,
  Platform,
  type ImageSourcePropType,
  Pressable,
  Switch,
  Text,
  View,
} from "react-native";
import { settingsStyles } from "styles/SettingsStyles";
import { tickerSettingsSectionStyles } from "styles/TickerStyles/TickerSettingsSectionStyles";
import TickerIcon, { type TickerIconName } from "./TickerIcon";

const TickerSettingsLayoutContext = createContext(false);

export function TickerSettingsLayout({ children }: PropsWithChildren) {
  return (
    <TickerSettingsLayoutContext.Provider value>
      {children}
    </TickerSettingsLayoutContext.Provider>
  );
}

type SectionProps = PropsWithChildren<{
  title: string;
  icon?: TickerIconName;
}>;

type OptionProps = {
  label: string;
  value?: string;
  description?: string;
  accessibilityHint?: string;
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
  const grouped = useContext(TickerSettingsLayoutContext);

  if (grouped) {
    return (
      <SettingsSection title={title}>
        <View style={tickerSettingsSectionStyles.group}>{children}</View>
      </SettingsSection>
    );
  }

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
  accessibilityHint,
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
  const grouped = useContext(TickerSettingsLayoutContext);
  const preferences = settingsStyles(isDark);
  const accessory = selected
    ? "checkmark"
    : selected === undefined
      ? expanded
        ? "chevron-up"
        : expanded === false && grouped
          ? "chevron-down"
          : "chevron-forward"
      : null;
  const leading = swatchColor ? (
    <View
      aria-hidden
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
    icon && (
      <TickerIcon
        name={icon}
        size={grouped ? 18 : 20}
        color={grouped ? colors.text : colors.icon}
      />
    )
  );

  return (
    <View
      style={[
        grouped
          ? [
              tickerSettingsSectionStyles.groupedOptionContainer,
              { borderBottomColor: colors.gray },
            ]
          : [
              preferences.optionButtonContainer,
              tickerSettingsSectionStyles.optionContainer,
            ],
        selected && { borderBottomColor: colors.text },
        hideBottomBorder && tickerSettingsSectionStyles.noBottomBorder,
      ]}
    >
      <Pressable
        accessibilityRole={selected === undefined ? "button" : "radio"}
        accessibilityLabel={label}
        accessibilityHint={
          grouped
            ? [accessibilityHint, value, description]
                .filter(Boolean)
                .join(". ") || undefined
            : accessibilityHint
        }
        accessibilityState={{
          disabled,
          ...(selected === undefined ? {} : { checked: selected }),
          ...(expanded === undefined ? {} : { expanded }),
        }}
        aria-checked={selected}
        aria-expanded={expanded}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          preferences.optionButton,
          tickerSettingsSectionStyles.option,
          grouped && tickerSettingsSectionStyles.groupedRow,
          (disabled || pressed) && tickerSettingsSectionStyles.muted,
        ]}
      >
        {grouped && leading && !swatchColor && !logo ? (
          <View
            style={[
              tickerSettingsSectionStyles.iconBadge,
              { backgroundColor: colors.itemBackground },
            ]}
            aria-hidden
          >
            {leading}
          </View>
        ) : (
          leading
        )}
        <View style={tickerSettingsSectionStyles.optionCopy}>
          <Text style={grouped ? text.subtitle : preferences.optionText}>
            {label}
          </Text>
          {description && (
            <Text
              style={[text.caption, grouped && { color: colors.secondaryText }]}
            >
              {description}
            </Text>
          )}
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
            size={grouped ? 16 : selected ? 24 : 20}
            color={grouped && !selected ? colors.secondaryText : colors.text}
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
  const grouped = useContext(TickerSettingsLayoutContext);
  const preferences = settingsStyles(isDark);
  return (
    <View
      style={[
        grouped
          ? [
              tickerSettingsSectionStyles.groupedOptionContainer,
              { borderBottomColor: colors.gray },
            ]
          : [
              preferences.optionButtonContainer,
              tickerSettingsSectionStyles.optionContainer,
            ],
        hideBottomBorder && tickerSettingsSectionStyles.noBottomBorder,
      ]}
    >
      <View
        style={[
          preferences.optionButton,
          tickerSettingsSectionStyles.toggle,
          grouped && tickerSettingsSectionStyles.groupedRow,
        ]}
      >
        {icon &&
          (grouped ? (
            <View
              style={[
                tickerSettingsSectionStyles.iconBadge,
                { backgroundColor: colors.itemBackground },
              ]}
              aria-hidden
            >
              <TickerIcon name={icon} size={18} color={colors.text} />
            </View>
          ) : (
            <TickerIcon name={icon} color={colors.icon} />
          ))}
        <View style={tickerSettingsSectionStyles.toggleCopy}>
          <Text style={grouped ? text.subtitle : preferences.optionText}>
            {label}
          </Text>
          {description && (
            <Text
              style={[text.caption, grouped && { color: colors.secondaryText }]}
            >
              {description}
            </Text>
          )}
        </View>
        <Switch
          accessibilityLabel={label}
          accessibilityHint={grouped ? description : undefined}
          value={value}
          disabled={disabled}
          onValueChange={onValueChange}
          trackColor={{ true: colors.blue, false: colors.gray }}
          thumbColor={grouped ? Colors.white : undefined}
          {...(grouped &&
            Platform.OS === "web" && {
              activeThumbColor: Colors.white,
            })}
        />
      </View>
    </View>
  );
}

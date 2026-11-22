import { Ionicons } from "@expo/vector-icons";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useSettingsContentStyle } from "hooks/useSettingsContentStyle";
import type { ComponentProps } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { settingsOverviewStyles } from "styles/SettingsStyles";
import SettingsAvatar from "./SettingsAvatar";
import SettingsSection from "./SettingsSection";

type SettingsAction = {
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  description?: string;
  kind?: "external" | "confirmation" | "destructive";
  onPress: () => void;
};

type Props = {
  accountName?: string;
  avatarUri?: string | null;
  onAccountPress: () => void;
  sections: readonly {
    title: string;
    actions: readonly SettingsAction[];
  }[];
};

export default function SettingsOverview({
  accountName,
  avatarUri,
  onAccountPress,
  sections,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const theme = Colors[resolvedColorScheme];
  const styles = settingsOverviewStyles(isDark);
  const text = globalStyles(isDark);
  const contentStyle = useSettingsContentStyle(styles.content);

  return (
    <ScrollView style={styles.overview} contentContainerStyle={contentStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          accountName ? `Account Details, ${accountName}` : "Account Details"
        }
        onPress={onAccountPress}
        style={({ pressed }) => [
          styles.accountCard,
          pressed && styles.accountPressed,
        ]}
      >
        <SettingsAvatar uri={avatarUri} />
        <View style={styles.copy}>
          <Text style={[text.title, styles.accountTitle]}>
            {accountName || "Account Details"}
          </Text>
          {!!accountName && (
            <Text style={[text.secondaryText, styles.accountCaption]}>
              Account Details
            </Text>
          )}
        </View>
        <Ionicons
          name="chevron-forward"
          size={17}
          color={Colors.dark.secondaryText}
          aria-hidden
        />
      </Pressable>

      {sections.map(({ title, actions }) => (
        <SettingsSection key={title} title={title}>
          <View style={styles.group}>
            {actions.map(({ label, description, icon, kind, onPress }) => {
              const external = kind === "external";
              const destructive = kind === "destructive";
              const opensPage = !kind || external;

              return (
                <Pressable
                  key={label}
                  accessibilityRole={external ? "link" : "button"}
                  accessibilityLabel={label}
                  accessibilityHint={
                    external
                      ? "Opens the Tempo website in your browser"
                      : description
                  }
                  onPress={onPress}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.rowIcon,
                      destructive && styles.destructiveIcon,
                    ]}
                    aria-hidden
                  >
                    <Ionicons
                      name={icon}
                      size={18}
                      color={
                        destructive ? styles.destructiveText.color : theme.text
                      }
                    />
                  </View>
                  <View style={styles.copy}>
                    <Text
                      style={[
                        text.subtitle,
                        destructive && styles.destructiveText,
                      ]}
                    >
                      {label}
                    </Text>
                    {description && (
                      <Text style={[text.secondaryText, styles.secondary]}>
                        {description}
                      </Text>
                    )}
                  </View>
                  {opensPage && (
                    <Ionicons
                      name={external ? "open-outline" : "chevron-forward"}
                      size={16}
                      color={theme.secondaryText}
                      aria-hidden
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </SettingsSection>
      ))}
    </ScrollView>
  );
}

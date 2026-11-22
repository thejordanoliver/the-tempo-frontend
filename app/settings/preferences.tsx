import { CustomHeader } from "components/CustomHeader";
import SettingsChoiceGroup, {
  type SettingsChoice,
} from "components/Settings/SettingsChoiceGroup";
import SettingsSection from "components/Settings/SettingsSection";
import { Colors, globalStyles } from "constants/styles";
import {
  usePreferences,
  type ColorSchemePreference,
} from "contexts/PreferencesContext";
import { useNavigation } from "expo-router";
import { useSettingsContentStyle } from "hooks/useSettingsContentStyle";
import { useActivityStatusPreference } from "hooks/UserHooks/useActivityStatusPreference";
import { useLayoutEffect } from "react";
import { Platform, ScrollView, Switch, Text, View } from "react-native";
import {
  settingsDetailStyles,
  settingsOverviewStyles,
} from "styles/SettingsStyles";
import type { GameCardLayout, LeagueLayout } from "types/preferences";

const themes = [
  {
    value: "light",
    label: "Light",
    accessibilityLabel: "Light theme",
    icon: "sunny-outline",
  },
  {
    value: "dark",
    label: "Dark",
    accessibilityLabel: "Dark theme",
    icon: "moon-outline",
  },
  {
    value: "system",
    label: "System",
    accessibilityLabel: "System theme",
    icon: "phone-portrait-outline",
  },
] as const satisfies readonly SettingsChoice<ColorSchemePreference>[];

const gameLayouts = [
  { value: "list", label: "List", icon: "list-outline" },
  { value: "grid", label: "Grid", icon: "grid-outline" },
  { value: "stacked", label: "Stacked", icon: "layers-outline" },
] as const satisfies readonly SettingsChoice<GameCardLayout>[];

const leagueLayouts = [
  { value: "carousel", label: "Carousel", icon: "albums-outline" },
  { value: "list", label: "List", icon: "list-outline" },
] as const satisfies readonly SettingsChoice<LeagueLayout>[];

export default function PreferencesScreen() {
  const {
    leagueLayout,
    setLeagueLayout,
    leagueLayoutLoading,
    leagueLayoutSaving,
    leagueLayoutError,
    viewMode,
    setViewMode,
    viewModeLoading,
    viewModeSaving,
    viewModeError,
    colorScheme,
    resolvedColorScheme,
    setColorScheme,
  } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const theme = Colors[resolvedColorScheme];
  const page = settingsOverviewStyles(isDark);
  const styles = settingsDetailStyles(isDark);
  const text = globalStyles(isDark);
  const contentStyle = useSettingsContentStyle(page.content);
  const navigation = useNavigation();
  const activityStatus = useActivityStatusPreference();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader title="Preferences" onBack={navigation.goBack} />
      ),
    });
  }, [navigation]);

  return (
    <ScrollView style={page.overview} contentContainerStyle={contentStyle}>
      <SettingsChoiceGroup
        title="Theme"
        choices={themes}
        value={colorScheme}
        onChange={setColorScheme}
      />

      <SettingsChoiceGroup
        title="Game Card Layout"
        choices={gameLayouts}
        value={viewMode}
        onChange={(value) => void setViewMode(value)}
        busy={viewModeLoading || viewModeSaving}
        error={viewModeError}
      />

      <SettingsChoiceGroup
        title="League Screen Layout"
        choices={leagueLayouts}
        value={leagueLayout}
        onChange={(value) => void setLeagueLayout(value)}
        busy={leagueLayoutLoading || leagueLayoutSaving}
        error={leagueLayoutError}
      />

      <SettingsSection title="Activity Status">
        <View style={page.group}>
          <View style={page.row}>
            <View style={page.copy}>
              <Text style={text.subtitle}>Show Activity Status</Text>
              <Text style={[text.secondaryText, page.secondary]}>
                Let others see when you’re active.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Show Activity Status"
              accessibilityHint="Let others see when you’re active"
              accessibilityState={{ busy: activityStatus.busy }}
              aria-busy={activityStatus.busy}
              value={activityStatus.value}
              onValueChange={(next) => void activityStatus.update(next)}
              disabled={activityStatus.busy}
              thumbColor={Colors.white}
              {...(Platform.OS === "web" && { activeThumbColor: Colors.white })}
              trackColor={{ false: theme.gray, true: theme.blue }}
            />
          </View>
        </View>
        {activityStatus.error && (
          <Text
            accessibilityRole="alert"
            style={[text.errorText, styles.errorPanel]}
          >
            {activityStatus.error}
          </Text>
        )}
      </SettingsSection>
    </ScrollView>
  );
}

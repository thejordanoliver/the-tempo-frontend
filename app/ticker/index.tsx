import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";
import { useScopedRouter } from "hooks/useScopedRouter";
import { LEAGUE_CONFIG } from "constants/leagues";
import { TICKER_TEAMS } from "constants/tickerTeams";
import { ticker, useTickerStore } from "store/tickerStore";
import { connectionBusy } from "services/ticker/controller";
import type { TickerViewMode } from "types/ticker";
import TickerDeviceSummary from "components/Ticker/TickerDeviceSummary";
import {
  TickerSettingsSection,
  TickerSettingOption,
} from "components/Ticker/TickerSettingsSection";
import {
  TickerAction,
  TickerFeedback,
  TickerPage,
  TickerRow,
  useTickerTheme,
} from "components/Ticker/TickerUI";

export default function TickerDashboard() {
  const router = useScopedRouter();
  const state = useTickerStore();
  const { colors, text, isDark } = useTickerTheme();
  const device = state.selectedDevice ?? state.lastDevice;
  const connected = state.connection === "connected";
  const busy = connectionBusy(state.connection);
  const league = state.settings?.selectedLeague;
  const mode = state.settings?.viewMode;
  const poll = mode === "ap" || mode === "coaches" || mode === "cfp";
  const team = league
    ? TICKER_TEAMS[league].find((item) => item.id === state.settings?.teamId)
    : undefined;
  const contentLabel = CONTENT_LABELS[mode ?? "scores"];
  return (
    <TickerPage title="My Ticker">
      {!device ? (
        <>
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.itemBackground },
              ]}
            >
              <Ionicons
                name="hardware-chip-outline"
                size={40}
                color={colors.text}
                accessibilityElementsHidden
              />
            </View>
            <Text style={[text.subheading, styles.centeredText]}>
              Connect your Tempo Ticker
            </Text>
            <Text style={[text.secondaryText, styles.centeredText]}>
              Bring league scores, team schedules, and college rankings to your
              display.
            </Text>
          </View>
          <TickerFeedback compact />
          <TickerAction
            label="Add ticker"
            icon="add-circle-outline"
            disabled={busy}
            onPress={() => router.push("/ticker/add")}
          />
          <Text style={[text.caption, styles.centeredText]}>
            Power on your ticker and keep it nearby to get started.
          </Text>
        </>
      ) : (
        <>
          <TickerDeviceSummary />
          <TickerAction
            label="Ticker settings"
            icon="options-outline"
            secondary={!connected}
            disabled={busy}
            onPress={() => router.push("/ticker/settings")}
          />
          {connected && (
            <TickerSettingsSection title="Your display" icon="tv-outline">
              <View style={styles.contentSummary}>
                {league && (
                  <Image
                    source={
                      isDark
                        ? LEAGUE_CONFIG[league].logoLight
                        : LEAGUE_CONFIG[league].logo
                    }
                    style={styles.leagueLogo}
                    resizeMode="contain"
                    accessibilityElementsHidden
                  />
                )}
                <View style={styles.summaryCopy}>
                  <Text style={text.subtitle}>
                    {league
                      ? LEAGUE_CONFIG[league].label
                      : "League not reported"}
                  </Text>
                  <Text style={text.secondaryText}>{contentLabel}</Text>
                  {mode === "schedule" && (
                    <Text style={text.caption}>
                      {team?.fullName ?? "Selected team"}
                    </Text>
                  )}
                  {mode === "scores" && state.settings?.top25Only && (
                    <Text style={text.caption}>Top 25 games only</Text>
                  )}
                </View>
              </View>
              <TickerRow
                label="Display"
                icon="power-outline"
                value={
                  state.settings?.displayOn == null
                    ? "Not reported"
                    : state.settings.displayOn
                      ? "On"
                      : "Off"
                }
              />
              <TickerRow
                label="Brightness"
                icon="sunny-outline"
                value={
                  state.settings?.brightness == null
                    ? "Not reported"
                    : `${state.settings.brightness}%`
                }
              />
              <TickerRow
                label="Rotation"
                icon="timer-outline"
                value={
                  state.settings?.durationSeconds == null
                    ? "Not reported"
                    : `${state.settings.durationSeconds}s per ${poll ? "team" : "game"}`
                }
              />
            </TickerSettingsSection>
          )}
          <TickerSettingsSection
            title="Manage ticker"
            icon="hardware-chip-outline"
          >
            {connected && (
              <TickerSettingOption
                label="Disconnect ticker"
                icon="unlink-outline"
                onPress={() => void ticker.disconnect()}
              />
            )}
            <TickerSettingOption
              label="Add another ticker"
              icon="add-circle-outline"
              description={
                connected
                  ? "Disconnect this ticker first."
                  : busy
                    ? "Finish or cancel the current connection first."
                    : "Find a different ticker nearby."
              }
              disabled={connected || busy}
              onPress={() => router.push("/ticker/add")}
            />
          </TickerSettingsSection>
        </>
      )}
    </TickerPage>
  );
}

const CONTENT_LABELS: Record<TickerViewMode, string> = {
  scores: "League scores",
  schedule: "Team schedule",
  ap: "AP Top 25",
  coaches: "Coaches Top 25",
  cfp: "College Football Playoff",
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 28,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredText: { textAlign: "center" },
  contentSummary: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    paddingVertical: 4,
  },
  leagueLogo: { width: 44, height: 44 },
  summaryCopy: { flex: 1, gap: 3 },
});

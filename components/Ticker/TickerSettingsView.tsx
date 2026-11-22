import TickerContentControl from "components/Ticker/TickerContentControl";
import TickerDeviceSummary from "components/Ticker/TickerDeviceSummary";
import { DurationControl } from "components/Ticker/TickerDisplayControls";
import TickerDisplaySettings from "components/Ticker/TickerDisplaySettings";
import TickerRenameControl from "components/Ticker/TickerRenameControl";
import {
  TickerSettingOption,
  TickerSettingsLayout,
  TickerSettingToggle,
  TickerSettingsSection,
} from "components/Ticker/TickerSettingsSection";
import {
  TickerPage,
  TickerRow,
  connectionLabel,
} from "components/Ticker/TickerUI";
import { useTickerTheme } from "hooks/TickerHooks/useTickerTheme";
import { useState, type PropsWithChildren } from "react";
import { useWindowDimensions, View } from "react-native";
import {
  connectionBusy,
  hasBlockingTickerCommand,
} from "services/ticker/controller";
import { useTickerController, useTickerStore } from "store/tickerStore";
import { tickerSettingsViewStyles as styles } from "styles/TickerStyles/TickerSettingsViewStyles";
import type { TickerCommandType } from "types/ticker";
import TickerQuietHoursControl from "./TickerQuietHoursControl";
import TickerRotationControl from "./TickerRotationControl";

export default function TickerSettingsView({
  children,
  title = "Ticker Settings",
}: PropsWithChildren<{ title?: string }>) {
  const state = useTickerStore();
  const ticker = useTickerController();
  const { colors } = useTickerTheme();
  const { width, fontScale } = useWindowDimensions();
  const wide = width / Math.max(1, fontScale) >= 768;
  const [showInfo, setShowInfo] = useState(false);
  const connected = state.connection === "connected";
  const pending =
    state.authorizing ||
    state.renaming ||
    state.syncingFavorites ||
    state.savingCustomHeader ||
    state.savingRotation ||
    state.savingQuietHours ||
    hasBlockingTickerCommand(state.pendingCommands);
  const busy = connectionBusy(state.connection);
  const supported = (type: TickerCommandType) =>
    state.status?.capabilities.includes(type) ?? false;
  const enabled = (type: TickerCommandType) =>
    connected && state.authorized && supported(type) && !pending;
  const brightnessEnabled =
    connected &&
    state.authorized &&
    supported("set_brightness") &&
    !state.authorizing &&
    !state.renaming &&
    !state.syncingFavorites &&
    !state.savingCustomHeader &&
    !state.savingRotation &&
    !state.savingQuietHours &&
    Object.values(state.pendingCommands).every(
      (command) => command === "set_brightness" || command === "set_league",
    );
  const device = state.selectedDevice ?? state.lastDevice;
  const mode = state.settings?.viewMode;
  const poll = mode === "ap" || mode === "coaches" || mode === "cfp";
  return (
    <TickerPage
      title={title}
      reorderable
      scrollResetKey={`${device?.id ?? "none"}:${state.connection}`}
    >
      {children}
      <TickerDeviceSummary variant="settings" />
      <TickerSettingsLayout>
        <View style={[styles.columns, wide && styles.wide]}>
          <View style={[styles.column, wide && styles.wideColumn]}>
            <TickerContentControl />
            <TickerSettingsSection title="Rotation">
              <TickerRotationControl />
              <TickerSettingToggle
                label="Smart game priority"
                icon="flash-outline"
                description={
                  state.status && !supported("set_smart_priority")
                    ? "Requires ticker firmware 0.14.0 or newer."
                    : "Close games late in play come first, followed by other live games, upcoming games, and finals."
                }
                value={state.settings?.smartGamePriority ?? false}
                disabled={
                  !enabled("set_smart_priority") ||
                  state.settings?.smartGamePriority == null
                }
                onValueChange={(value) =>
                  void ticker.command({ type: "set_smart_priority", value })
                }
              />
              {mode !== "rotation" && (
                <DurationControl
                  key={`${device?.id ?? "none"}:${state.connection}:${state.settings?.durationSeconds ?? "unknown"}`}
                  confirmed={state.settings?.durationSeconds ?? null}
                  disabled={!enabled("set_duration")}
                  poll={poll}
                />
              )}
            </TickerSettingsSection>
          </View>
          <View style={[styles.column, wide && styles.wideColumn]}>
            <TickerDisplaySettings
              enabled={enabled}
              supported={supported}
              brightnessEnabled={brightnessEnabled}
            />
            <TickerQuietHoursControl />
            <TickerSettingsSection title="Device">
              <TickerRenameControl />
              <TickerSettingOption
                icon="refresh-outline"
                label="Refresh content"
                description={
                  state.status?.wifi === "disconnected"
                    ? "Reconnect your ticker to Wi-Fi to refresh."
                    : undefined
                }
                disabled={
                  !enabled("refresh_scores") ||
                  state.status?.wifi === "disconnected"
                }
                onPress={() => void ticker.command({ type: "refresh_scores" })}
              />
              <TickerSettingOption
                icon="information-circle-outline"
                label="Device details"
                expanded={showInfo}
                onPress={() => setShowInfo(!showInfo)}
              />
              {showInfo && (
                <View
                  style={[
                    styles.deviceDetails,
                    { backgroundColor: colors.itemBackground },
                  ]}
                >
                  <TickerRow
                    icon="code-slash-outline"
                    label="Firmware"
                    value={state.status?.firmwareVersion ?? "Not available"}
                  />
                  <TickerRow
                    icon="bluetooth-outline"
                    label="Bluetooth"
                    value={connectionLabel[state.connection]}
                  />
                  <TickerRow
                    icon="wifi-outline"
                    label="Wi-Fi"
                    value={
                      !state.status || state.status.wifi === "unknown"
                        ? "Not available"
                        : state.status.wifi === "connected"
                          ? "Connected"
                          : "Disconnected"
                    }
                  />
                  <TickerRow
                    icon="finger-print-outline"
                    label="Device ID"
                    value={device?.id ?? "Not available"}
                  />
                  <TickerSettingOption
                    icon="sync-outline"
                    label="Update device status"
                    hideBottomBorder
                    disabled={!connected || pending}
                    onPress={() => void ticker.command({ type: "get_status" })}
                  />
                </View>
              )}
              {(connected || busy) && (
                <TickerSettingOption
                  icon="log-out-outline"
                  label="Disconnect ticker"
                  hideBottomBorder
                  onPress={() => void ticker.disconnect()}
                />
              )}
            </TickerSettingsSection>
          </View>
        </View>
      </TickerSettingsLayout>
    </TickerPage>
  );
}

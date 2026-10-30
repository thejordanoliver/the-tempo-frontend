import TickerContentControl from "components/Ticker/TickerContentControl";
import {
  BrightnessControl,
  DurationControl,
} from "components/Ticker/TickerDisplayControls";
import TickerRenameControl from "components/Ticker/TickerRenameControl";
import TickerDeviceSummary from "components/Ticker/TickerDeviceSummary";
import {
  TickerSettingOption,
  TickerSettingToggle,
  TickerSettingsSection,
} from "components/Ticker/TickerSettingsSection";
import {
  TickerPage,
  TickerRow,
  connectionLabel,
} from "components/Ticker/TickerUI";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { connectionBusy } from "services/ticker/controller";
import { ticker, useTickerStore } from "store/tickerStore";
import type { TickerCommandType } from "types/ticker";

export default function TickerSettingsScreen() {
  const state = useTickerStore();
  const [showInfo, setShowInfo] = useState(false);
  const connected = state.connection === "connected";
  const pending =
    state.authorizing ||
    state.renaming ||
    Object.keys(state.pendingCommands).length > 0;
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
    Object.values(state.pendingCommands).every(
      (command) => command === "set_brightness" || command === "set_league",
    );
  const device = state.selectedDevice ?? state.lastDevice;
  const mode = state.settings?.viewMode;
  const poll = mode === "ap" || mode === "coaches" || mode === "cfp";
  return (
    <TickerPage title="Ticker Settings">
      <TickerDeviceSummary />
      <TickerContentControl />
      <TickerSettingsSection title="Rotation" icon="repeat-outline">
        <DurationControl
          key={`${device?.id ?? "none"}:${state.connection}:${state.settings?.durationSeconds ?? "unknown"}`}
          confirmed={state.settings?.durationSeconds ?? null}
          disabled={!enabled("set_duration")}
          poll={poll}
        />
      </TickerSettingsSection>
      <TickerSettingsSection title="Display" icon="tv-outline">
        <TickerSettingToggle
          icon="power-outline"
          label="Display on"
          value={state.settings?.displayOn ?? false}
          disabled={
            !enabled("set_display") || state.settings?.displayOn == null
          }
          onValueChange={(value) =>
            void ticker.command({ type: "set_display", value })
          }
        />
        <BrightnessControl
          key={`${device?.id ?? "none"}:${state.connection}:${brightnessEnabled}`}
          confirmed={state.settings?.brightness ?? null}
          disabled={!brightnessEnabled}
        />
      </TickerSettingsSection>
      <TickerSettingsSection title="Device" icon="hardware-chip-outline">
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
            !enabled("refresh_scores") || state.status?.wifi === "disconnected"
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
          <View style={styles.deviceDetails}>
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
              disabled={!connected || pending}
              onPress={() => void ticker.command({ type: "get_status" })}
            />
          </View>
        )}
        {(connected || busy) && (
          <TickerSettingOption
            icon="log-out-outline"
            label="Disconnect ticker"
            onPress={() => void ticker.disconnect()}
          />
        )}
      </TickerSettingsSection>
    </TickerPage>
  );
}

const styles = StyleSheet.create({
  deviceDetails: { gap: 12, paddingVertical: 8 },
});

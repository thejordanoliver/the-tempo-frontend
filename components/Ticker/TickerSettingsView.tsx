import TickerRotationControl from "./TickerRotationControl";
import { useTickerTheme } from "hooks/TickerHooks/useTickerTheme";
import { tickerSettingsViewStyles as styles } from "styles/TickerStyles/TickerSettingsViewStyles";
import TickerContentControl from "components/Ticker/TickerContentControl";
import TickerCustomHeaderControl from "components/Ticker/TickerCustomHeaderControl";
import TickerDeviceSummary from "components/Ticker/TickerDeviceSummary";
import {
  BrightnessControl,
  DurationControl,
} from "components/Ticker/TickerDisplayControls";
import TickerRenameControl from "components/Ticker/TickerRenameControl";
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
import { TICKER_HEADER_COLORS } from "constants/tickerHeaderColors";
import { useState, type PropsWithChildren } from "react";
import { Text, View } from "react-native";
import {
  connectionBusy,
  hasBlockingTickerCommand,
} from "services/ticker/controller";
import {
  DATE_FORMATS,
  HEADER_COLORS,
  HEADER_MODES,
} from "services/ticker/protocol";
import { useTickerController, useTickerStore } from "store/tickerStore";
import type { TickerCommandType } from "types/ticker";

const HEADER_LABELS = {
  tempo: "THE TEMPO",
  device_name: "Device name",
  hidden: "Hidden",
  custom: "Custom name",
};

export default function TickerSettingsView({
  children,
  title = "Ticker Settings",
}: PropsWithChildren<{ title?: string }>) {
  const state = useTickerStore();
  const ticker = useTickerController();
  const { text } = useTickerTheme();
  const [showInfo, setShowInfo] = useState(false);
  const [showDateFormats, setShowDateFormats] = useState(false);
  const [showHeaderOptions, setShowHeaderOptions] = useState(false);
  const [showHeaderColors, setShowHeaderColors] = useState(false);
  const connected = state.connection === "connected";
  const pending =
    state.authorizing ||
    state.renaming ||
    state.syncingFavorites ||
    state.savingCustomHeader ||
    state.savingRotation ||
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
    Object.values(state.pendingCommands).every(
      (command) => command === "set_brightness" || command === "set_league",
    );
  const device = state.selectedDevice ?? state.lastDevice;
  const headerColor = state.settings?.headerColor;
  const headerColorHex = TICKER_HEADER_COLORS[headerColor ?? "green"];
  const mode = state.settings?.viewMode;
  const poll = mode === "ap" || mode === "coaches" || mode === "cfp";
  return (
    <TickerPage
      title={title}
      reorderable
      scrollResetKey={`${device?.id ?? "none"}:${state.connection}`}
    >
      {children}
      <TickerDeviceSummary />
      <TickerContentControl />
      <TickerSettingsSection title="Rotation">
        <TickerRotationControl />
        <TickerSettingToggle
          label="Smart game priority"
          icon="flash-outline"
          description={
            supported("set_smart_priority")
              ? "Live games first, with close late games at the front, then upcoming games and finals."
              : "Requires ticker firmware 0.14.0 or newer."
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
        {supported("set_smart_priority") && (
          <Text style={text.caption}>
            Applies to scores, team schedules, and Favorites within each
            rotation item. Your custom item order and poll rankings stay the
            same.
          </Text>
        )}
        {mode !== "rotation" && (
          <DurationControl
            key={`${device?.id ?? "none"}:${state.connection}:${state.settings?.durationSeconds ?? "unknown"}`}
            confirmed={state.settings?.durationSeconds ?? null}
            disabled={!enabled("set_duration")}
            poll={poll}
          />
        )}
      </TickerSettingsSection>
      <TickerSettingsSection title="Display">
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
        <TickerSettingOption
          icon="text-outline"
          label="Header"
          value={
            state.settings?.headerMode
              ? HEADER_LABELS[state.settings.headerMode]
              : "Not available"
          }
          expanded={showHeaderOptions}
          disabled={!enabled("set_header")}
          description={
            !supported("set_header")
              ? "Requires ticker firmware 0.9.0 or newer."
              : undefined
          }
          onPress={() => setShowHeaderOptions(!showHeaderOptions)}
        />
        {showHeaderOptions &&
          HEADER_MODES.filter(
            (mode) => mode !== "custom" || state.status?.canCustomHeader,
          ).map((mode) =>
            mode === "custom" ? (
              <TickerCustomHeaderControl
                key={mode}
                disabled={!enabled("set_header")}
                onSaved={() => setShowHeaderOptions(false)}
              />
            ) : (
              <TickerSettingOption
                key={mode}
                label={HEADER_LABELS[mode]}
                description={
                  mode === "tempo"
                    ? "THE TEMPO with the league label."
                    : mode === "device_name"
                      ? `${device?.name ?? "Your ticker’s name"} with the league label.`
                      : "Hide the top header, league label, and divider."
                }
                selected={state.settings?.headerMode === mode}
                disabled={!enabled("set_header")}
                onPress={async () => {
                  if (await ticker.command({ type: "set_header", value: mode }))
                    setShowHeaderOptions(false);
                }}
              />
            ),
          )}
        <TickerSettingOption
          swatchColor={headerColor ? headerColorHex : undefined}
          label="Header color"
          value={
            headerColor
              ? headerColor[0].toUpperCase() + headerColor.slice(1)
              : "Not available"
          }
          expanded={showHeaderColors}
          disabled={!enabled("set_header_color")}
          description={
            !supported("set_header_color")
              ? "Requires ticker firmware 0.10.0 or newer."
              : undefined
          }
          onPress={() => setShowHeaderColors(!showHeaderColors)}
        />
        {showHeaderColors && (
          <>
            {state.settings?.headerMode === "hidden" ? (
              <Text style={text.caption}>
                Your color will appear when the header is visible.
              </Text>
            ) : (
              <View
                style={[
                  styles.headerPreview,
                  { borderBottomColor: headerColorHex },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    text.text,
                    styles.headerPreviewTitle,
                    { color: headerColorHex },
                  ]}
                >
                  {state.settings?.headerMode === "custom"
                    ? state.customHeader || "Custom name"
                    : state.settings?.headerMode === "device_name"
                      ? (device?.name ?? "Your ticker")
                      : "THE TEMPO"}
                </Text>
              </View>
            )}
            {HEADER_COLORS.map((color) => (
              <TickerSettingOption
                key={color}
                label={color[0].toUpperCase() + color.slice(1)}
                swatchColor={TICKER_HEADER_COLORS[color]}
                selected={headerColor === color}
                disabled={!enabled("set_header_color")}
                onPress={() =>
                  void ticker.command({
                    type: "set_header_color",
                    value: color,
                  })
                }
              />
            ))}
          </>
        )}
        <TickerSettingOption
          icon="calendar-outline"
          label="Date format"
          value={state.settings?.dateFormat?.toUpperCase() ?? "Not available"}
          expanded={showDateFormats}
          disabled={!enabled("set_date_format")}
          description={
            !supported("set_date_format")
              ? "Requires ticker firmware 0.7.0 or newer."
              : undefined
          }
          onPress={() => setShowDateFormats(!showDateFormats)}
        />
        {showDateFormats &&
          DATE_FORMATS.map((format, index) => (
            <TickerSettingOption
              key={format}
              label={format.toUpperCase()}
              description={["10/30", "30/10", "Oct 30", "2026-10-30"][index]}
              selected={state.settings?.dateFormat === format}
              disabled={!enabled("set_date_format")}
              onPress={async () => {
                if (
                  await ticker.command({
                    type: "set_date_format",
                    value: format,
                  })
                )
                  setShowDateFormats(false);
              }}
            />
          ))}
        <TickerSettingToggle
          icon="tv-outline"
          label="Show broadcast"
          description={
            supported("set_show_broadcast")
              ? "Show broadcast networks below game info."
              : "Requires ticker firmware 0.7.0 or newer."
          }
          value={state.settings?.showBroadcast ?? true}
          disabled={
            !enabled("set_show_broadcast") ||
            state.settings?.showBroadcast == null
          }
          onValueChange={(value) =>
            void ticker.command({ type: "set_show_broadcast", value })
          }
        />
      </TickerSettingsSection>
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
            hideBottomBorder
            onPress={() => void ticker.disconnect()}
          />
        )}
      </TickerSettingsSection>
    </TickerPage>
  );
}

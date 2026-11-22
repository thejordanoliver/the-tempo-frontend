import { TICKER_HEADER_COLORS } from "constants/tickerHeaderColors";
import { useTickerTheme } from "hooks/TickerHooks/useTickerTheme";
import { useState } from "react";
import { View } from "react-native";
import {
  DATE_FORMATS,
  HEADER_COLORS,
  HEADER_MODES,
} from "services/ticker/protocol";
import { useTickerController, useTickerStore } from "store/tickerStore";
import { tickerSettingsViewStyles as styles } from "styles/TickerStyles/TickerSettingsViewStyles";
import type { TickerCommandType } from "types/ticker";
import TickerCustomHeaderControl from "./TickerCustomHeaderControl";
import { BrightnessControl } from "./TickerDisplayControls";
import {
  TickerSettingOption,
  TickerSettingsSection,
  TickerSettingToggle,
} from "./TickerSettingsSection";

const HEADER_LABELS = {
  tempo: "THE TEMPO",
  device_name: "Device name",
  hidden: "Hidden",
  custom: "Custom name",
};
const DATE_EXAMPLES = {
  "mm/dd": "10/30",
  "dd/mm": "30/10",
  "mmm d": "Oct 30",
  "yyyy-mm-dd": "2026-10-30",
};
type Picker = "header" | "color" | "date";
type Availability = (type: TickerCommandType) => boolean;

export default function TickerDisplaySettings({
  enabled,
  supported,
  brightnessEnabled,
}: {
  enabled: Availability;
  supported: Availability;
  brightnessEnabled: boolean;
}) {
  const state = useTickerStore();
  const ticker = useTickerController();
  const { colors } = useTickerTheme();
  const [picker, setPicker] = useState<Picker | null>(null);

  const settings = state.settings;
  const device = state.selectedDevice ?? state.lastDevice;
  const headerColor = settings?.headerColor;
  const headerMode = settings?.headerMode;
  const togglePicker = (next: Picker) =>
    setPicker((current) => (current === next ? null : next));
  const pickerStyle = [
    styles.picker,
    { backgroundColor: colors.itemBackground },
  ];

  return (
    <TickerSettingsSection title="Display">
      <TickerSettingToggle
        icon="power-outline"
        label="Display on"
        value={settings?.displayOn ?? false}
        disabled={!enabled("set_display") || settings?.displayOn == null}
        onValueChange={(value) =>
          void ticker.command({ type: "set_display", value })
        }
      />
      <BrightnessControl
        key={`${device?.id ?? "none"}:${state.connection}:${brightnessEnabled}`}
        confirmed={settings?.brightness ?? null}
        disabled={!brightnessEnabled}
      />
      <TickerSettingOption
        icon="text-outline"
        label="Header"
        value={headerMode ? HEADER_LABELS[headerMode] : "Not available"}
        expanded={picker === "header"}
        disabled={!enabled("set_header")}
        description={
          state.status && !supported("set_header")
            ? "Requires ticker firmware 0.9.0 or newer."
            : undefined
        }
        onPress={() => togglePicker("header")}
      />
      {picker === "header" && (
        <View
          style={pickerStyle}
          accessibilityRole="radiogroup"
          accessibilityLabel="Header options"
        >
          {HEADER_MODES.filter(
            (mode) => mode !== "custom" || state.status?.canCustomHeader,
          ).map((mode) =>
            mode === "custom" ? (
              <TickerCustomHeaderControl
                key={mode}
                disabled={!enabled("set_header")}
                onSaved={() => setPicker(null)}
              />
            ) : (
              <TickerSettingOption
                key={mode}
                label={HEADER_LABELS[mode]}
                description={
                  mode === "hidden"
                    ? "Also hides the league label and divider."
                    : undefined
                }
                selected={headerMode === mode}
                disabled={!enabled("set_header")}
                onPress={async () => {
                  if (await ticker.command({ type: "set_header", value: mode }))
                    setPicker(null);
                }}
              />
            ),
          )}
        </View>
      )}
      <TickerSettingOption
        swatchColor={
          headerColor ? TICKER_HEADER_COLORS[headerColor] : undefined
        }
        icon="color-palette-outline"
        label="Header color"
        accessibilityHint={
          headerColor ? `Selected color is ${headerColor}.` : undefined
        }
        expanded={picker === "color"}
        disabled={!enabled("set_header_color")}
        description={
          state.status && !supported("set_header_color")
            ? "Requires ticker firmware 0.10.0 or newer."
            : undefined
        }
        onPress={() => togglePicker("color")}
      />
      {picker === "color" && (
        <View
          style={pickerStyle}
          accessibilityRole="radiogroup"
          accessibilityLabel="Header colors"
        >
          {HEADER_COLORS.map((color, index) => (
            <TickerSettingOption
              key={color}
              label={color[0].toUpperCase() + color.slice(1)}
              swatchColor={TICKER_HEADER_COLORS[color]}
              selected={headerColor === color}
              disabled={!enabled("set_header_color")}
              hideBottomBorder={index === HEADER_COLORS.length - 1}
              onPress={() =>
                void ticker.command({ type: "set_header_color", value: color })
              }
            />
          ))}
        </View>
      )}
      <TickerSettingOption
        icon="calendar-outline"
        label="Date format"
        value={settings?.dateFormat?.toUpperCase() ?? "Not available"}
        expanded={picker === "date"}
        disabled={!enabled("set_date_format")}
        description={
          state.status && !supported("set_date_format")
            ? "Requires ticker firmware 0.7.0 or newer."
            : undefined
        }
        onPress={() => togglePicker("date")}
      />
      {picker === "date" && (
        <View
          style={pickerStyle}
          accessibilityRole="radiogroup"
          accessibilityLabel="Date formats"
        >
          {DATE_FORMATS.map((format, index) => (
            <TickerSettingOption
              key={format}
              label={format.toUpperCase()}
              description={DATE_EXAMPLES[format]}
              selected={settings?.dateFormat === format}
              disabled={!enabled("set_date_format")}
              hideBottomBorder={index === DATE_FORMATS.length - 1}
              onPress={async () => {
                if (
                  await ticker.command({
                    type: "set_date_format",
                    value: format,
                  })
                )
                  setPicker(null);
              }}
            />
          ))}
        </View>
      )}
      <TickerSettingToggle
        icon="tv-outline"
        label="Show broadcast"
        description={
          state.status && !supported("set_show_broadcast")
            ? "Requires ticker firmware 0.7.0 or newer."
            : undefined
        }
        value={settings?.showBroadcast ?? true}
        disabled={
          !enabled("set_show_broadcast") || settings?.showBroadcast == null
        }
        hideBottomBorder
        onValueChange={(value) =>
          void ticker.command({ type: "set_show_broadcast", value })
        }
      />
    </TickerSettingsSection>
  );
}

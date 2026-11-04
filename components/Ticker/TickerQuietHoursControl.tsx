import { Colors } from "constants/styles";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
import ConfirmModal from "components/ConfirmModal";
import TextInputComponent from "components/TextInput";
import PillTabs from "components/TabBars/PillTabs";
import {
  TICKER_TIME_ZONES,
  tickerPhoneTimeZone,
} from "constants/tickerTimeZones";
import { useTickerTheme } from "hooks/TickerHooks/useTickerTheme";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { hasBlockingTickerCommand } from "services/ticker/controller";
import {
  DEFAULT_QUIET_HOURS,
  quietHoursBytes,
  quietTimeLabel,
} from "services/ticker/quietHours";
import { useTickerController, useTickerStore } from "store/tickerStore";
import { tickerQuietHoursStyles as styles } from "styles/TickerStyles/TickerQuietHoursStyles";
import type { TickerQuietHoursConfig } from "types/ticker";
import TickerSelectionSheet from "./TickerSelectionSheet";
import {
  TickerSettingOption,
  TickerSettingsSection,
  TickerSettingToggle,
} from "./TickerSettingsSection";
import { TickerAction } from "./TickerUI";

const DAYS = [
  { name: "Mon", day: 1 },
  { name: "Tue", day: 2 },
  { name: "Wed", day: 3 },
  { name: "Thu", day: 4 },
  { name: "Fri", day: 5 },
  { name: "Sat", day: 6 },
  { name: "Sun", day: 0 },
];
export default function TickerQuietHoursControl() {
  const state = useTickerStore();
  return (
    <QuietHoursEditor
      key={`${state.connection}:${state.selectedDevice?.id ?? "none"}`}
    />
  );
}
function QuietHoursEditor() {
  const state = useTickerStore();
  const ticker = useTickerController();
  const { text, colors } = useTickerTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<TickerQuietHoursConfig>({
    ...DEFAULT_QUIET_HOURS,
  });
  const [zoneChosen, setZoneChosen] = useState(true);
  const [zonePicker, setZonePicker] = useState(false);
  const [timePicker, setTimePicker] = useState<
    "startMinute" | "endMinute" | null
  >(null);
  const config = state.quietHoursConfig ?? DEFAULT_QUIET_HOURS;
  const supported =
    state.status?.capabilities.includes("set_quiet_hours") ?? false;
  const unlocked =
    state.connection === "connected" &&
    state.authorized &&
    !state.authorizing &&
    !state.renaming &&
    !state.syncingFavorites &&
    !state.savingCustomHeader &&
    !state.savingRotation &&
    !state.savingQuietHours &&
    !hasBlockingTickerCommand(state.pendingCommands);
  const disabled = !unlocked || !state.quietHoursAvailable;
  const active = state.settings?.quietHoursActive === true,
    overridden = state.settings?.quietHoursOverride === true;
  const value = editing ? draft : config;
  const daySummary =
    value.days === 127
      ? "Every day"
      : value.days === 62
        ? "Weekdays"
        : DAYS.filter(({ day }) => (value.days & (1 << day)) !== 0)
            .map(({ name }) => name)
            .join(", ");
  const status = !config.enabled
    ? "Quiet hours is off."
    : !state.settings?.quietHoursClockReady
      ? "Waiting for the ticker’s clock. Connect it to Wi-Fi to start quiet hours."
      : overridden
        ? "Staying on until this quiet period ends."
        : active
          ? config.behavior === "dim"
            ? `Quiet hours is active. Brightness is capped at ${config.dimPercent}%.`
            : "Quiet hours is active. The display is sleeping."
          : "Your saved schedule is ready.";
  const newDraft = (enable?: boolean) => {
    const phoneZone = tickerPhoneTimeZone();
    setDraft({
      ...config,
      ...(enable === undefined ? {} : { enabled: enable }),
      ...(!state.quietHoursConfigured && phoneZone !== null
        ? { timeZone: phoneZone }
        : {}),
    });
    setZoneChosen(state.quietHoursConfigured || phoneZone !== null);
    setEditing(true);
  };
  const save = async () => {
    try {
      quietHoursBytes(draft);
      if (!zoneChosen) return;
      if (await ticker.setQuietHours(draft)) setEditing(false);
    } catch (error) {
      ticker.store.setState({
        error:
          error instanceof Error ? error.message : "Choose a valid schedule.",
      });
    }
  };
  return (
    <TickerSettingsSection title="Quiet hours">
      <TickerSettingToggle
        label="Enable quiet hours"
        icon="moon-outline"
        value={value.enabled}
        disabled={disabled}
        description={
          !supported
            ? "Requires ticker firmware 0.15.0 or newer."
            : (state.quietHoursIssue ??
              "Automatically turn off or dim your ticker on a schedule.")
        }
        onValueChange={(enabled) => {
          if (editing) setDraft((current) => ({ ...current, enabled }));
          else if (!state.quietHoursConfigured) newDraft(enabled);
          else void ticker.setQuietHours({ ...config, enabled });
        }}
      />
      <TickerSettingOption
        label="Schedule"
        value={`${quietTimeLabel(value.startMinute)}–${quietTimeLabel(value.endMinute)}`}
        expanded={editing}
        description={`${daySummary} · ${TICKER_TIME_ZONES[value.timeZone].label}`}
        disabled={disabled}
        onPress={() => (editing ? setEditing(false) : newDraft())}
      />
      {!editing && state.quietHoursAvailable && (
        <Text accessibilityLiveRegion="polite" style={text.caption}>
          {status}
        </Text>
      )}
      {!editing && active && (
        <TickerSettingOption
          label={
            overridden ? "Resume quiet hours" : "Stay on until quiet hours ends"
          }
          description="Temporarily skip this quiet period. Your normal power and brightness settings apply."
          disabled={
            disabled || (!overridden && state.settings?.displayOn !== true)
          }
          onPress={() =>
            void ticker.command({
              type: "set_quiet_override",
              value: !overridden,
            })
          }
        />
      )}
      {editing && (
        <View style={styles.editor}>
          <Text style={text.caption}>
            Changes take effect when you save. Each selected day is the day the
            quiet period starts, including overnight schedules.
          </Text>
          <View style={styles.days}>
            {DAYS.map(({ name, day }) => {
              const selected = (draft.days & (1 << day)) !== 0;
              return (
                <Pressable
                  key={day}
                  accessibilityRole="checkbox"
                  accessibilityLabel={name}
                  accessibilityState={{ checked: selected, disabled }}
                  disabled={disabled}
                  onPress={() =>
                    setDraft((current) => ({
                      ...current,
                      days: current.days ^ (1 << day),
                    }))
                  }
                  style={({ pressed }) => [
                    styles.day,
                    {
                      borderColor: selected ? colors.blue : colors.gray,
                      backgroundColor: selected
                        ? colors.blue
                        : colors.background,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      text.label,
                      { color: selected ? Colors.white : colors.text },
                    ]}
                  >
                    {name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <TickerSettingOption
            label="Starts"
            value={quietTimeLabel(draft.startMinute)}
            disabled={disabled}
            onPress={() => setTimePicker("startMinute")}
          />
          <TickerSettingOption
            label="Ends"
            value={quietTimeLabel(draft.endMinute)}
            disabled={disabled}
            onPress={() => setTimePicker("endMinute")}
          />
          <Text style={text.label}>During quiet hours</Text>
          <PillTabs
            tabs={[
              { label: "Display off", value: "off" },
              { label: "Dim", value: "dim" },
            ]}
            selectedValue={draft.behavior}
            disabled={disabled}
            onChange={(behavior) =>
              setDraft((current) => ({
                ...current,
                behavior: behavior === "dim" ? "dim" : "off",
              }))
            }
          />
          {draft.behavior === "dim" && (
            <>
              <Text style={text.secondaryText}>
                At most {draft.dimPercent}% brightness
              </Text>
              <Slider
                accessibilityLabel="Quiet hours dim brightness"
                minimumValue={1}
                maximumValue={50}
                step={1}
                value={draft.dimPercent}
                disabled={disabled}
                minimumTrackTintColor={colors.text}
                maximumTrackTintColor={colors.gray}
                thumbTintColor={colors.text}
                onValueChange={(dimPercent) =>
                  setDraft((current) => ({
                    ...current,
                    dimPercent: Math.round(dimPercent),
                  }))
                }
              />
            </>
          )}
          <TickerSettingOption
            label="Time zone"
            icon="globe-outline"
            value={
              zoneChosen
                ? TICKER_TIME_ZONES[draft.timeZone].label
                : "Choose a time zone"
            }
            description="Times use this zone and adjust for daylight saving automatically."
            disabled={disabled}
            onPress={() => setZonePicker(true)}
          />
          <Text style={text.caption}>
            Your normal brightness returns when quiet hours ends. The saved
            schedule runs on the ticker without the app connected.
          </Text>
          {!draft.days && (
            <Text style={text.errorText}>Select at least one day.</Text>
          )}
          {draft.startMinute === draft.endMinute && (
            <Text style={text.errorText}>
              Choose different start and end times.
            </Text>
          )}
          {!zoneChosen && (
            <Text style={text.caption}>
              Choose the ticker’s time zone before saving.
            </Text>
          )}
          {state.error && (
            <Text accessibilityRole="alert" style={text.errorText}>
              {state.error}
            </Text>
          )}
          <TickerAction
            label={
              state.savingQuietHours
                ? "Saving quiet hours…"
                : "Save quiet hours"
            }
            disabled={
              disabled ||
              !draft.days ||
              !zoneChosen ||
              draft.startMinute === draft.endMinute
            }
            onPress={save}
          />
          <TickerSettingOption
            label="Cancel changes"
            disabled={state.savingQuietHours}
            onPress={() => setEditing(false)}
          />
        </View>
      )}
      <TickerSelectionSheet
        visible={zonePicker}
        title="Choose a time zone"
        searchable
        items={TICKER_TIME_ZONES.map((zone, index) => ({
          id: String(index),
          name: zone.label,
          searchTerms: zone.id,
        }))}
        selectedId={String(draft.timeZone)}
        disabled={disabled}
        onClose={() => setZonePicker(false)}
        onSelect={async (id) => {
          setDraft((current) => ({ ...current, timeZone: Number(id) }));
          setZoneChosen(true);
          return true;
        }}
      />
      {timePicker && (
        <QuietTimePicker
          key={timePicker}
          title={
            timePicker === "startMinute"
              ? "Quiet hours starts"
              : "Quiet hours ends"
          }
          minute={draft[timePicker]}
          disabled={disabled}
          onCancel={() => setTimePicker(null)}
          onSave={(minute) => {
            setDraft((current) => ({ ...current, [timePicker]: minute }));
            setTimePicker(null);
          }}
        />
      )}
    </TickerSettingsSection>
  );
}
function QuietTimePicker({
  title,
  minute,
  disabled,
  onCancel,
  onSave,
}: {
  title: string;
  minute: number;
  disabled: boolean;
  onCancel: () => void;
  onSave: (minute: number) => void;
}) {
  const { isDark, text } = useTickerTheme();
  const [date, setDate] = useState(() => {
    const value = new Date(2020, 0, 15, 12);
    value.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
    return value;
  });
  const [clock, setClock] = useState(
    `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`,
  );
  const valid = /^([01]\d|2[0-3]):[0-5]\d$/.test(clock);
  return (
    <ConfirmModal
      visible
      title={title}
      message="Choose a time in the schedule’s saved time zone."
      confirmText="Set time"
      confirmDisabled={disabled || (Platform.OS === "web" && !valid)}
      onCancel={onCancel}
      onConfirm={() =>
        onSave(
          Platform.OS === "web"
            ? Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3))
            : date.getHours() * 60 + date.getMinutes(),
        )
      }
    >
      {Platform.OS === "web" ? (
        <>
          <TextInputComponent
            accessibilityLabel="Time in 24-hour format"
            value={clock}
            onChangeText={setClock}
            placeholder="22:00"
            maxLength={5}
            editable={!disabled}
          />
          <Text style={text.caption}>Use 24-hour time: HH:MM.</Text>
        </>
      ) : (
        <DateTimePicker
          value={date}
          mode="time"
          display="spinner"
          themeVariant={isDark ? "dark" : "light"}
          onChange={(_, value) => {
            if (value) setDate(value);
          }}
        />
      )}
    </ConfirmModal>
  );
}

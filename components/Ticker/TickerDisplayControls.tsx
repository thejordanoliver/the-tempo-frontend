import Slider from "@react-native-community/slider";
import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ticker } from "store/tickerStore";
import { TickerRow, useTickerTheme } from "./TickerUI";

export function BrightnessControl({
  confirmed,
  disabled,
}: {
  confirmed: number | null;
  disabled: boolean;
}) {
  const [draft, setDraft] = useState<number | null>(null);
  const dragging = useRef(false);
  const revision = useRef(0);
  // Brightness streams changes while dragging; only the latest reply clears the draft.
  const applyBrightness = (next: number) => {
    const value = Math.round(next);
    setDraft(value);
    const request = ++revision.current;
    void ticker.updateSetting({ type: "set_brightness", value }).then(() => {
      if (request === revision.current && !dragging.current) setDraft(null);
    });
  };
  const { colors } = useTickerTheme();
  const value = draft ?? confirmed;
  return (
    <View style={styles.control}>
      <TickerRow
        icon="sunny-outline"
        label="Brightness"
        value={value == null ? "Not reported" : `${value}%`}
      />
      <Slider
        accessibilityLabel="Display brightness"
        accessibilityValue={
          value == null
            ? { text: "Not reported" }
            : { min: 0, max: 100, now: value }
        }
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={value ?? 0}
        disabled={disabled || confirmed == null}
        minimumTrackTintColor={colors.text}
        maximumTrackTintColor={colors.gray}
        thumbTintColor={colors.text}
        onSlidingStart={() => {
          dragging.current = true;
        }}
        onValueChange={(next) => {
          dragging.current = true;
          applyBrightness(next);
        }}
        onSlidingComplete={(next) => {
          dragging.current = false;
          applyBrightness(next);
        }}
      />
    </View>
  );
}
export function DurationControl({
  confirmed,
  disabled,
  poll,
}: {
  confirmed: number | null;
  disabled: boolean;
  poll: boolean;
}) {
  const [draft, setDraft] = useState<number | null>(null);
  const { colors, text } = useTickerTheme();
  const value = draft ?? confirmed;
  return (
    <View style={styles.control}>
      <TickerRow
        icon="timer-outline"
        label={poll ? "Time per team" : "Time per game"}
        value={value == null ? "Not reported" : `${value} seconds`}
      />
      <Slider
        accessibilityLabel="Seconds to show each game or ranked team"
        accessibilityValue={
          value == null
            ? { text: "Not reported" }
            : { min: 3, max: 60, now: value }
        }
        minimumValue={3}
        maximumValue={60}
        step={1}
        value={value ?? 6}
        disabled={disabled || confirmed == null}
        minimumTrackTintColor={colors.text}
        maximumTrackTintColor={colors.gray}
        thumbTintColor={colors.text}
        onValueChange={setDraft}
        // Rotation is committed once, after the slider is released.
        onSlidingComplete={(next) => {
          void ticker
            .command({ type: "set_duration", value: Math.round(next) })
            .finally(() => setDraft(null));
        }}
      />
      <Text style={text.caption}>
        How long each {poll ? "ranked team" : "game"} stays on screen.
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  control: { gap: 10 },
});

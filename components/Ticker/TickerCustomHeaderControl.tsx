import { useTickerTheme } from "hooks/TickerHooks/useTickerTheme";
import ConfirmModal from "components/ConfirmModal";
import TextInputComponent from "components/TextInput";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  HEADER_EMOJIS,
  normalizeCustomHeader,
  supportsHeaderEmoji,
} from "services/ticker/customHeader";
import { useTickerController, useTickerStore } from "store/tickerStore";
import { TickerSettingOption } from "./TickerSettingsSection";

export default function TickerCustomHeaderControl({
  disabled,
  onSaved,
}: {
  disabled: boolean;
  onSaved: () => void;
}) {
  const state = useTickerStore();
  return (
    <CustomHeaderControl
      key={`${state.connection}:${state.selectedDevice?.id ?? "none"}`}
      disabled={disabled}
      onSaved={onSaved}
    />
  );
}

function CustomHeaderControl({
  disabled,
  onSaved,
}: {
  disabled: boolean;
  onSaved: () => void;
}) {
  const state = useTickerStore();
  const ticker = useTickerController();
  const { text, colors } = useTickerTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const unavailable = disabled || !state.customHeaderAvailable;
  const emojiAvailable = supportsHeaderEmoji(state.status?.firmwareVersion);
  const save = async () => {
    setError(null);
    try {
      const value = normalizeCustomHeader(draft);
      if (await ticker.setCustomHeader(value)) {
        setEditing(false);
        onSaved();
      } else
        setError(
          ticker.store.getState().error ??
            "Unable to save the header. Please try again.",
        );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Enter a valid header.",
      );
    }
  };
  return (
    <>
      <TickerSettingOption
        label="Custom name"
        value={state.customHeader || undefined}
        description={state.customHeaderIssue ?? "Set your own display heading."}
        selected={state.settings?.headerMode === "custom"}
        disabled={unavailable}
        onPress={() => {
          setDraft(state.customHeader ?? "");
          setError(null);
          setEditing(true);
        }}
      />
      <ConfirmModal
        visible={editing && state.connection === "connected"}
        title="Custom header name"
        message="Choose the heading shown above your games."
        confirmText={state.savingCustomHeader ? "Saving…" : "Save header"}
        confirmDisabled={unavailable || !draft.trim()}
        onCancel={() => setEditing(false)}
        onConfirm={save}
      >
        <TextInputComponent
          value={draft}
          onChangeText={(value) => {
            setDraft(value);
            setError(null);
          }}
          placeholder="e.g. Jordan's Scoreboard"
          accessibilityLabel="Custom header name"
          autoCapitalize="words"
          autoCorrect={false}
          editable={!state.savingCustomHeader}
          returnKeyType="done"
        />
        <Text style={text.caption}>
          Up to 20 characters. Each supported emoji counts as one. Long headings
          shorten to fit beside the league label.
        </Text>
        {emojiAvailable ? (
          <View style={styles.emojiPicker}>
            {HEADER_EMOJIS.map(({ emoji, label }) => (
              <Pressable
                key={label}
                accessibilityRole="button"
                accessibilityLabel={`Add ${label.toLowerCase()} emoji`}
                disabled={state.savingCustomHeader}
                onPress={() => {
                  setDraft((value) => value + emoji);
                  setError(null);
                }}
                style={({ pressed }) => [
                  styles.emojiButton,
                  {
                    backgroundColor: colors.itemBackground,
                    opacity: pressed || state.savingCustomHeader ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={text.caption}>
            Update your ticker firmware to add header emojis.
          </Text>
        )}
        {error && (
          <Text accessibilityRole="alert" style={text.errorText}>
            {error}
          </Text>
        )}
      </ConfirmModal>
    </>
  );
}

const styles = StyleSheet.create({
  emojiPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  emojiButton: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 24 },
});

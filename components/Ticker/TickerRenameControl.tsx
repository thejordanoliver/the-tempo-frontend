import ConfirmModal from "components/ConfirmModal";
import TextInputComponent from "components/TextInput";
import { useState } from "react";
import { Text } from "react-native";
import {
  MAX_TICKER_NAME_LENGTH,
  normalizeTickerName,
} from "services/ticker/name";
import { ticker, useTickerStore } from "store/tickerStore";
import { TickerSettingOption } from "./TickerSettingsSection";
import { useTickerTheme } from "./TickerUI";

export default function TickerRenameControl() {
  const state = useTickerStore();
  // A connection change discards any unfinished edit instead of reopening it
  // for a different device or a later connection to the same ticker.
  return (
    <RenameControl
      key={`${state.connection}:${state.selectedDevice?.id ?? "none"}`}
    />
  );
}

function RenameControl() {
  const state = useTickerStore();
  const { text } = useTickerTheme();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const device = state.selectedDevice;
  const connected = state.connection === "connected";
  const supported = (state.status?.canRename ?? false) && state.nameAvailable;
  const disabled =
    !connected ||
    !state.authorized ||
    state.authorizing ||
    state.renaming ||
    !supported ||
    Object.keys(state.pendingCommands).length > 0;

  const saveName = async () => {
    setValidationError(null);
    try {
      const name = normalizeTickerName(draft);
      if (await ticker.rename(name)) setEditingId(null);
      else
        setValidationError(
          ticker.store.getState().error ??
            "Unable to save the name. Please try again.",
        );
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : "Enter a valid name.",
      );
    }
  };

  return (
    <>
      <TickerSettingOption
        icon="pencil-outline"
        label="Rename ticker"
        value={device?.name}
        disabled={disabled}
        description={
          connected && !supported
            ? (state.nameIssue ?? "Requires ticker firmware 0.6.0 or newer.")
            : undefined
        }
        onPress={() => {
          setDraft(device?.name ?? "");
          setValidationError(null);
          setEditingId(device?.id ?? null);
        }}
      />
      <ConfirmModal
        visible={editingId !== null && connected && editingId === device?.id}
        title="Rename ticker"
        message="Choose a name you’ll recognize when connecting to your ticker."
        confirmText="Save name"
        confirmDisabled={disabled || !draft.trim()}
        onCancel={() => setEditingId(null)}
        onConfirm={saveName}
      >
        <TextInputComponent
          value={draft}
          onChangeText={(value) => {
            setDraft(value);
            setValidationError(null);
          }}
          placeholder="e.g. Living Room Ticker"
          accessibilityLabel="Ticker name"
          maxLength={MAX_TICKER_NAME_LENGTH}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!state.renaming}
          returnKeyType="done"
        />
        <Text style={text.caption}>
          Up to 20 characters. Use standard letters, numbers, spaces, and
          punctuation.
        </Text>
        {validationError && (
          <Text accessibilityRole="alert" style={text.errorText}>
            {validationError}
          </Text>
        )}
      </ConfirmModal>
    </>
  );
}

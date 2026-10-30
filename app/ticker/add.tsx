import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { connectionBusy } from "services/ticker/controller";
import { ticker, useTickerStore } from "store/tickerStore";
import {
  TickerAction,
  TickerFeedback,
  TickerPage,
  useTickerTheme,
} from "components/Ticker/TickerUI";
import { TickerSettingsSection } from "components/Ticker/TickerSettingsSection";
import type { TickerDevice } from "types/ticker";

export default function AddTicker() {
  const state = useTickerStore();
  const { colors, text } = useTickerTheme();
  const router = useScopedRouter();
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const focusGeneration = useRef(0);
  const focused = useRef(false);

  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      focusGeneration.current += 1;
      void ticker.startScan();
      const subscription = AppState.addEventListener("change", (next) => {
        if (next !== "active") void ticker.stopScan();
      });
      return () => {
        focused.current = false;
        focusGeneration.current += 1;
        subscription.remove();
        void ticker.stopScan();
      };
    }, []),
  );

  const busy = connectionBusy(state.connection);
  const connected = state.connection === "connected";
  const unavailable = state.bluetooth === "Unsupported";
  const permissionNeeded = state.bluetooth === "Unauthorized";
  const bluetoothOff = state.bluetooth === "PoweredOff";
  const blocked = unavailable || permissionNeeded || bluetoothOff;
  const disabled = busy || connected;
  const select = async (device: TickerDevice) => {
    const generation = focusGeneration.current;
    if (
      (await ticker.connect(device)) &&
      focused.current &&
      generation === focusGeneration.current
    )
      router.dismissTo("/(tabs)/(profile)/ticker");
  };
  const openSettings = () => {
    setSettingsError(null);
    void Linking.openSettings().catch(() =>
      setSettingsError("Open Settings manually and allow Bluetooth for Tempo."),
    );
  };

  return (
    <TickerPage title="Add Ticker">
      <View
        style={[
          styles.introduction,
          { backgroundColor: colors.itemBackground },
        ]}
      >
        <Ionicons
          name="bluetooth-outline"
          size={28}
          color={colors.text}
          accessibilityElementsHidden
        />
        <View style={styles.copy}>
          <Text style={text.subtitle}>Connect your ticker</Text>
          <Text style={text.caption}>
            Power on your ticker and keep your phone nearby.
          </Text>
        </View>
      </View>

      <TickerSettingsSection title="Nearby tickers" icon="bluetooth-outline">
        {connected ? (
          <>
            <Text style={text.text}>Your ticker is connected.</Text>
            <TickerAction
              label="Go to My Ticker"
              icon="hardware-chip-outline"
              onPress={() => router.dismissTo("/(tabs)/(profile)/ticker")}
            />
          </>
        ) : blocked ? (
          <View style={styles.guidance}>
            <View style={styles.guidanceCopy} accessibilityLiveRegion="polite">
              <Text style={text.subtitle}>
                {permissionNeeded
                  ? "Allow Bluetooth access"
                  : bluetoothOff
                    ? "Turn on Bluetooth"
                    : "Bluetooth unavailable"}
              </Text>
              <Text style={text.secondaryText}>
                {permissionNeeded
                  ? "Allow Tempo to use Bluetooth in your phone’s Settings, then try again."
                  : bluetoothOff
                    ? "Turn on Bluetooth on your phone, then search for your ticker again."
                    : "Bluetooth isn’t available in this version of Tempo or on this device."}
              </Text>
            </View>
            {settingsError && (
              <Text accessibilityRole="alert" style={text.errorText}>
                {settingsError}
              </Text>
            )}
            {!unavailable && (
              <>
                <TickerAction
                  label="Open Settings"
                  icon="settings-outline"
                  onPress={openSettings}
                />
                <TickerAction
                  label="Try again"
                  icon="refresh-outline"
                  secondary
                  disabled={disabled}
                  onPress={() => void ticker.startScan()}
                />
              </>
            )}
          </View>
        ) : (
          <>
            <View style={styles.scanStatus} accessibilityLiveRegion="polite">
              <Text style={text.secondaryText}>
                {busy
                  ? "Connecting to your ticker…"
                  : state.scanning
                    ? "Searching nearby…"
                    : state.devices.length
                      ? `${state.devices.length} ${state.devices.length === 1 ? "ticker" : "tickers"} found`
                      : "No tickers found"}
              </Text>
              {(state.scanning || busy) && (
                <ActivityIndicator color={colors.text} />
              )}
            </View>
            {state.devices.map((device) => (
              <NearbyTickerRow
                key={device.id}
                device={device}
                connecting={busy && state.selectedDevice?.id === device.id}
                disabled={disabled}
                duplicateName={state.devices.some(
                  (other) =>
                    other.id !== device.id && other.name === device.name,
                )}
                onSelect={() => void select(device)}
              />
            ))}
            {!state.devices.length && (
              <Text style={text.caption}>
                {state.scanning
                  ? "Your ticker will appear here when it’s found."
                  : "Check that your ticker is powered on, nearby, and not connected to another phone."}
              </Text>
            )}
            {!busy && <TickerFeedback compact />}
            {busy ? (
              <TickerAction
                label="Cancel connection"
                icon="close-circle-outline"
                secondary
                onPress={() => void ticker.disconnect()}
              />
            ) : (
              <TickerAction
                label={state.scanning ? "Stop search" : "Search again"}
                icon={state.scanning ? "stop-circle-outline" : "search-outline"}
                secondary={state.scanning}
                disabled={disabled}
                onPress={() =>
                  void (state.scanning ? ticker.stopScan() : ticker.startScan())
                }
              />
            )}
          </>
        )}
      </TickerSettingsSection>
    </TickerPage>
  );
}

function NearbyTickerRow({
  device,
  connecting,
  disabled,
  duplicateName,
  onSelect,
}: {
  device: TickerDevice;
  connecting: boolean;
  disabled: boolean;
  duplicateName: boolean;
  onSelect: () => void;
}) {
  const { colors, text } = useTickerTheme();
  const suffix = duplicateName ? device.id.slice(-4) : null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Connect to ${device.name}${suffix ? `, ${suffix}` : ""}`}
      accessibilityState={{ disabled, busy: connecting }}
      disabled={disabled}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.deviceRow,
        {
          borderBottomColor: colors.gray,
          opacity: pressed || (disabled && !connecting) ? 0.5 : 1,
        },
      ]}
    >
      <Ionicons
        name="hardware-chip-outline"
        size={26}
        color={colors.text}
        accessibilityElementsHidden
      />
      <View style={styles.copy}>
        <Text style={text.subtitle}>{device.name}</Text>
        <Text style={text.caption}>
          {connecting
            ? "Connecting…"
            : suffix
              ? `Ticker ending in ${suffix}`
              : "Tap to connect"}
        </Text>
      </View>
      {!connecting && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.text}
          accessibilityElementsHidden
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  introduction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 8,
  },
  copy: { flex: 1, gap: 3 },
  guidance: { gap: 12 },
  guidanceCopy: { gap: 4 },
  scanStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 64,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

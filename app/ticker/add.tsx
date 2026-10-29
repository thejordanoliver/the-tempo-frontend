import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useCallback } from "react";
import { AppState, Linking, Pressable, Text, View } from "react-native";
import { connectionBusy } from "services/ticker/controller";
import { ticker, useTickerStore } from "store/tickerStore";
import {
  TickerAction,
  TickerCard,
  TickerFeedback,
  TickerPage,
  tickerStyles,
  useTickerTheme,
} from "components/Ticker/TickerUI";
import type { TickerDevice } from "types/ticker";

export default function AddTicker() {
  const state = useTickerStore();
  const { colors, text } = useTickerTheme();
  const router = useScopedRouter();
  useFocusEffect(
    useCallback(() => {
      void ticker.startScan();
      const subscription = AppState.addEventListener("change", (next) => {
        if (next !== "active") void ticker.stopScan();
      });
      return () => {
        subscription.remove();
        void ticker.stopScan();
      };
    }, []),
  );
  const busy = connectionBusy(state.connection);
  const select = async (device: TickerDevice) => {
    if (await ticker.connect(device))
      router.dismissTo("/(tabs)/(profile)/ticker");
  };
  return (
    <TickerPage title="Add Ticker">
      <Text style={text.subheading}>Find your Tempo Ticker</Text>
      <Text style={text.secondaryText}>
        Keep your ticker powered on and nearby. Allow Bluetooth access when
        prompted. Compatible devices advertise the Tempo service, even if their
        names differ.
      </Text>
      <TickerFeedback />
      <TickerCard>
        <View style={tickerStyles.row}>
          <Text accessibilityLiveRegion="polite" style={text.title}>
            {state.scanning ? "Searching nearby…" : "Nearby tickers"}
          </Text>
          <Ionicons name="bluetooth" size={24} color={colors.icon} />
        </View>
        {state.devices.map((device) => (
          <Pressable
            key={device.id}
            accessibilityRole="button"
            accessibilityLabel={`Connect to ${device.name}`}
            accessibilityState={{
              disabled: busy || state.connection === "connected",
            }}
            disabled={busy || state.connection === "connected"}
            onPress={() => void select(device)}
            style={({ pressed }) => [
              tickerStyles.device,
              { borderColor: colors.gray, opacity: pressed || busy ? 0.7 : 1 },
            ]}
          >
            <Text style={text.subtitle}>{device.name}</Text>
            <Text style={text.caption}>{device.id}</Text>
            <Text style={text.secondaryText}>
              {busy && state.selectedDevice?.id === device.id
                ? "Connecting and verifying…"
                : "Connect and verify protocol"}
            </Text>
          </Pressable>
        ))}
        {!state.devices.length && (
          <Text style={text.secondaryText}>
            {state.scanning
              ? "Looking for devices with the Tempo service…"
              : "No compatible tickers found. Upload BLE-enabled TempoScoreboard firmware and keep your ticker powered on nearby."}
          </Text>
        )}
        <TickerAction
          label={state.scanning ? "Stop scanning" : "Scan again"}
          secondary
          disabled={busy || state.connection === "connected"}
          onPress={() =>
            void (state.scanning ? ticker.stopScan() : ticker.startScan())
          }
        />
        {busy && (
          <TickerAction
            label="Cancel connection"
            secondary
            onPress={() => void ticker.disconnect()}
          />
        )}
        {state.bluetooth === "Unauthorized" && (
          <TickerAction
            label="Open device Settings"
            secondary
            onPress={() => {
              void Linking.openSettings().catch(() =>
                ticker.store.setState({
                  error: "Open device Settings and allow Bluetooth for Tempo.",
                }),
              );
            }}
          />
        )}
      </TickerCard>
      <Text style={text.caption}>
        Requires a physical device and a Tempo development build. Expo Go and
        iOS Simulator cannot test physical BLE. A BLE connection alone does not
        establish OS bonding or device authorization.
      </Text>
    </TickerPage>
  );
}

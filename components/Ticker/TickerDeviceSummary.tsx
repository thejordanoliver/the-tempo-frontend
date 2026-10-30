import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useScopedRouter } from "hooks/useScopedRouter";
import { ticker, useTickerStore } from "store/tickerStore";
import { connectionBusy, type TickerState } from "services/ticker/controller";
import {
  TickerAction,
  TickerFeedback,
  connectionLabel,
  useTickerTheme,
} from "./TickerUI";

export default function TickerDeviceSummary() {
  const state = useTickerStore();
  const { colors, text } = useTickerTheme();
  const router = useScopedRouter();
  const device = state.selectedDevice ?? state.lastDevice;
  const connected = state.connection === "connected";
  const busy = connectionBusy(state.connection);
  return (
    <View
      style={[styles.container, { backgroundColor: colors.itemBackground }]}
    >
      <View style={styles.heading}>
        <Ionicons
          name="hardware-chip-outline"
          size={28}
          color={colors.text}
          accessibilityElementsHidden
        />
        <View style={styles.copy}>
          <Text style={text.subtitle}>
            {device?.name ?? "No ticker connected"}
          </Text>
          <Text style={text.caption}>{getDeviceStatus(state)}</Text>
        </View>
        <View
          accessibilityLabel={connectionLabel[state.connection]}
          style={[
            styles.statusDot,
            { backgroundColor: connected ? colors.green : colors.gray },
          ]}
        />
      </View>
      {!connected && (
        <TickerAction
          icon={
            busy
              ? "close-outline"
              : device
                ? "bluetooth-outline"
                : "add-outline"
          }
          label={
            busy
              ? "Cancel connection"
              : device
                ? "Connect ticker"
                : "Add ticker"
          }
          onPress={() => {
            if (busy) void ticker.disconnect();
            else if (device) void ticker.reconnect();
            else router.push("/ticker/add");
          }}
        />
      )}
      <TickerFeedback compact />
    </View>
  );
}

function getDeviceStatus(state: TickerState) {
  if (connectionBusy(state.connection)) return "Connecting…";
  if (state.connection !== "connected")
    return "Connect to view and change ticker settings";
  if (state.status?.wifi === "disconnected") return "Connected · Wi-Fi offline";
  return state.authorized ? "Connected · Ready" : "Connected · Controls locked";
}

const styles = StyleSheet.create({
  container: { padding: 14, gap: 12, borderRadius: 8 },
  heading: { flexDirection: "row", alignItems: "center", gap: 12 },
  copy: { flex: 1, gap: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});

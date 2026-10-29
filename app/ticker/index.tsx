import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useScopedRouter } from "hooks/useScopedRouter";
import { ticker, useTickerStore } from "store/tickerStore";
import { connectionBusy } from "services/ticker/controller";
import {
  TickerAction,
  TickerCard,
  TickerFeedback,
  TickerPage,
  TickerRow,
  connectionLabel,
  useTickerTheme,
} from "components/Ticker/TickerUI";

export default function TickerDashboard() {
  const router = useScopedRouter();
  const state = useTickerStore();
  const { colors, text } = useTickerTheme();
  const device = state.selectedDevice ?? state.lastDevice;
  const busy = connectionBusy(state.connection);
  return (
    <TickerPage title="My Ticker">
      <TickerFeedback />
      {!device ? (
        <View style={text.emptyContainer}>
          <Ionicons
            name="bluetooth-outline"
            size={48}
            color={colors.icon}
            accessibilityElementsHidden
          />
          <Text style={text.subheading}>Your scores, on display</Text>
          <Text style={text.emptyText}>
            Connect a Tempo Ticker to bring your favorite league to an LED
            display.
          </Text>
          <Text style={text.emptySubText}>
            Bluetooth access is required to discover and connect to nearby
            tickers.
          </Text>
        </View>
      ) : (
        <TickerCard>
          <Text style={text.title}>{device.name}</Text>
          <TickerRow
            label="Connection"
            value={connectionLabel[state.connection]}
          />
          <TickerRow label="Device identifier" value={device.id} />
          <TickerRow
            label="Active league"
            value={
              state.settings?.selectedLeague?.toUpperCase() ?? "Not reported"
            }
          />
          <TickerRow
            label="Brightness"
            value={
              state.settings?.brightness != null
                ? `${state.settings.brightness}%`
                : "Not reported"
            }
          />
          <TickerRow
            label="Time per game"
            value={
              state.settings?.durationSeconds != null
                ? `${state.settings.durationSeconds} seconds`
                : "Not reported"
            }
          />
          <TickerRow
            label="Wi-Fi"
            value={
              state.status?.wifi === "unknown" || !state.status
                ? "Not reported"
                : state.status.wifi === "connected"
                  ? "Connected"
                  : "Disconnected"
            }
          />
          {state.connection !== "connected" && (
            <Text style={text.secondaryText}>
              Reconnect to read the current device state. Saved device details
              do not indicate a live connection.
            </Text>
          )}
          <TickerAction
            label="Device settings"
            secondary
            onPress={() => router.push("/ticker/settings")}
          />
          {state.connection === "connected" || busy ? (
            <TickerAction
              label="Disconnect"
              secondary
              onPress={() => void ticker.disconnect()}
            />
          ) : (
            <TickerAction
              label="Reconnect"
              onPress={() => void ticker.reconnect()}
            />
          )}
        </TickerCard>
      )}
      <TickerAction
        label={device ? "Add another ticker" : "Add Ticker"}
        disabled={busy || state.connection === "connected"}
        onPress={() => router.push("/ticker/add")}
      />
      {state.connection === "connected" && (
        <Text style={text.caption}>
          Disconnect this ticker before adding another device.
        </Text>
      )}
      <TickerCard>
        <Text style={text.subtitle}>Firmware and authorization</Text>
        <Text style={text.secondaryText}>
          Firmware 0.3.0 adds college ranking labels, a Top 25 game filter, and
          adjustable rotation duration. Connect, choose Unlock controls, and
          enter the code shown on your ticker in the device Bluetooth pairing
          prompt.
        </Text>
      </TickerCard>
    </TickerPage>
  );
}

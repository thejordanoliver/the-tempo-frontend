import Slider from "@react-native-community/slider";
import { useState } from "react";
import { Switch, Text, View } from "react-native";
import {
  TickerAction,
  TickerCard,
  TickerFeedback,
  TickerPage,
  TickerRow,
  connectionLabel,
  tickerStyles,
  useTickerTheme,
} from "components/Ticker/TickerUI";
import { connectionBusy } from "services/ticker/controller";
import { LEAGUES } from "services/ticker/protocol";
import { ticker, useTickerStore } from "store/tickerStore";
import type { TickerCommandType } from "types/ticker";

function BrightnessControl({
  confirmed,
  disabled,
}: {
  confirmed: number | null;
  disabled: boolean;
}) {
  const [draft, setDraft] = useState<number | null>(null);
  const { colors, text } = useTickerTheme();
  const value = draft ?? confirmed;
  return (
    <View style={{ gap: 10 }}>
      <TickerRow
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
        onValueChange={setDraft}
        onSlidingComplete={(next) => {
          void ticker
            .command({ type: "set_brightness", value: Math.round(next) })
            .finally(() => setDraft(null));
        }}
      />
      <Text style={text.caption}>
        {disabled
          ? "Requires a connected, authorized ticker with brightness support."
          : "Release to apply. The confirmed percentage updates after the device acknowledges it."}
      </Text>
    </View>
  );
}
function DurationControl({
  confirmed,
  disabled,
}: {
  confirmed: number | null;
  disabled: boolean;
}) {
  const [draft, setDraft] = useState<number | null>(null);
  const { colors, text } = useTickerTheme();
  const value = draft ?? confirmed;
  return (
    <View style={{ gap: 10 }}>
      <TickerRow
        label="Time per game"
        value={value == null ? "Not reported" : `${value} seconds`}
      />
      <Slider
        accessibilityLabel="Seconds to show each game"
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
        onSlidingComplete={(next) => {
          void ticker
            .command({ type: "set_duration", value: Math.round(next) })
            .finally(() => setDraft(null));
        }}
      />
      <Text style={text.caption}>
        {confirmed == null
          ? "Upload firmware 0.3.0 or newer to change game duration."
          : "Choose 3–60 seconds per matchup. Release to apply; the device confirms the saved duration."}
      </Text>
    </View>
  );
}
export default function TickerSettingsScreen() {
  const state = useTickerStore();
  const { text, colors } = useTickerTheme();
  const [showInfo, setShowInfo] = useState(false);
  const connected = state.connection === "connected";
  const pending =
    state.authorizing || Object.keys(state.pendingCommands).length > 0;
  const busy = connectionBusy(state.connection);
  const supported = (type: TickerCommandType) =>
    state.status?.capabilities.includes(type) ?? false;
  const enabled = (type: TickerCommandType) =>
    connected && state.authorized && supported(type) && !pending;
  const device = state.selectedDevice ?? state.lastDevice;
  return (
    <TickerPage title="Ticker Settings">
      <TickerFeedback />
      <TickerCard>
        <Text style={text.title}>Display controls</Text>
        <BrightnessControl
          key={`${device?.id ?? "none"}:${state.connection}:${state.settings?.brightness ?? "unknown"}`}
          confirmed={state.settings?.brightness ?? null}
          disabled={!enabled("set_brightness")}
        />
        <View style={tickerStyles.row}>
          <Text style={text.text}>Display power</Text>
          <Switch
            accessibilityLabel="Ticker display power"
            disabled={
              !enabled("set_display") || state.settings?.displayOn == null
            }
            value={state.settings?.displayOn ?? false}
            onValueChange={(value) =>
              void ticker.command({ type: "set_display", value })
            }
            trackColor={{ true: colors.blue, false: colors.gray }}
          />
        </View>
        {!supported("set_display") && (
          <Text style={text.caption}>
            Display on/off is unavailable until firmware reports support.
          </Text>
        )}
      </TickerCard>
      <TickerCard>
        <Text style={text.title}>Game rotation</Text>
        <DurationControl
          key={`${device?.id ?? "none"}:${state.connection}:${state.settings?.durationSeconds ?? "unknown"}`}
          confirmed={state.settings?.durationSeconds ?? null}
          disabled={!enabled("set_duration")}
        />
      </TickerCard>
      <TickerCard>
        <Text style={text.title}>Sports preferences</Text>
        <Text style={text.secondaryText}>
          Choose one active league. Current:{" "}
          {state.settings?.selectedLeague?.toUpperCase() ?? "Not reported"}.
        </Text>
        {LEAGUES.map((league) => (
          <TickerAction
            key={league}
            label={`${league === "cfb" ? "College Football" : league.toUpperCase()}${state.settings?.selectedLeague === league ? " · Selected" : ""}`}
            secondary={state.settings?.selectedLeague !== league}
            disabled={
              !enabled("set_league") ||
              state.settings?.selectedLeague === league
            }
            onPress={() =>
              void ticker.command({ type: "set_league", value: league })
            }
          />
        ))}
        {!enabled("set_league") && (
          <Text style={text.caption}>
            League changes require authorization and firmware support.
          </Text>
        )}
      </TickerCard>
      <TickerCard>
        <Text style={text.title}>College Football rankings</Text>
        <View style={tickerStyles.row}>
          <Text style={[text.text, { flex: 1 }]}>Show Top 25 rank labels</Text>
          <Switch
            accessibilityLabel="Show college football rank labels"
            value={state.settings?.showRankings ?? false}
            disabled={
              !enabled("set_show_rankings") ||
              state.settings?.showRankings == null
            }
            trackColor={{ true: colors.blue, false: colors.gray }}
            onValueChange={(value) =>
              void ticker.command({ type: "set_show_rankings", value })
            }
          />
        </View>
        <Text style={text.caption}>
          Show backend-reported rankings such as #12 beside ranked teams.
          Unranked teams have no rank label.
        </Text>
        <View style={tickerStyles.row}>
          <Text style={[text.text, { flex: 1 }]}>Top 25 games only</Text>
          <Switch
            accessibilityLabel="Only games involving Top 25 college football teams"
            value={state.settings?.top25Only ?? false}
            disabled={
              !enabled("set_top25_only") || state.settings?.top25Only == null
            }
            trackColor={{ true: colors.blue, false: colors.gray }}
            onValueChange={(value) =>
              void ticker.command({ type: "set_top25_only", value })
            }
          />
        </View>
        <Text style={text.caption}>
          When College Football is selected, rotate only games with at least one
          team ranked 1–25. These options do not affect NBA or NFL.
        </Text>
        {(!supported("set_show_rankings") || !supported("set_top25_only")) && (
          <Text style={text.caption}>
            Upload firmware 0.3.0 or newer to use ranking options.
          </Text>
        )}
      </TickerCard>
      <TickerCard>
        <Text style={text.title}>Device controls</Text>
        <TickerAction
          label="Refresh scores"
          disabled={
            !enabled("refresh_scores") || state.status?.wifi === "disconnected"
          }
          onPress={() => void ticker.command({ type: "refresh_scores" })}
        />
        {!enabled("refresh_scores") && (
          <Text style={text.caption}>
            Score refresh requires authorization and firmware support.
          </Text>
        )}
        <TickerAction
          label="Read device status"
          secondary
          disabled={!connected || pending}
          onPress={() => void ticker.command({ type: "get_status" })}
        />
        <TickerAction
          label={connected || busy ? "Disconnect device" : "Reconnect device"}
          secondary
          disabled={!device}
          onPress={() =>
            void (connected || busy ? ticker.disconnect() : ticker.reconnect())
          }
        />
        <TickerAction
          label={
            showInfo ? "Hide device information" : "View device information"
          }
          secondary
          onPress={() => setShowInfo(!showInfo)}
        />
      </TickerCard>
      {showInfo && (
        <TickerCard>
          <Text style={text.title}>Device information</Text>
          <TickerRow
            label="Name"
            value={device?.name ?? "No device selected"}
          />
          <TickerRow label="Identifier" value={device?.id ?? "Not available"} />
          <TickerRow
            label="Firmware"
            value={state.status?.firmwareVersion ?? "Not reported"}
          />
          <TickerRow label="BLE" value={connectionLabel[state.connection]} />
          <TickerRow
            label="Authorization"
            value={state.authorized ? "Paired control access" : "Not verified"}
          />
          <TickerRow
            label="OS pairing / bonding"
            value={
              state.authorized
                ? "Protected GATT access completed"
                : "Pair using Unlock controls"
            }
          />
          <TickerRow
            label="Wi-Fi"
            value={
              !state.status || state.status.wifi === "unknown"
                ? "Not reported"
                : state.status.wifi === "connected"
                  ? "Connected"
                  : "Disconnected"
            }
          />
          <Text style={text.caption}>
            Firmware 0.2.0 supports paired controls. Acknowledgments confirm
            applied settings; score refresh confirms an accepted request.
          </Text>
        </TickerCard>
      )}
    </TickerPage>
  );
}

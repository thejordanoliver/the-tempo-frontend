import Button from "components/Buttons/Button";
import { CustomHeader } from "components/CustomHeader";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation } from "expo-router";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useEffect, useLayoutEffect, type PropsWithChildren } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  hydrateTickerPreference,
  ticker,
  useTickerStore,
} from "store/tickerStore";
import TickerIcon, { type TickerIconName } from "./TickerIcon";
import type { TickerConnectionState } from "types/ticker";

export function useTickerTheme() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  return {
    isDark,
    colors: Colors[isDark ? "dark" : "light"],
    text: globalStyles(isDark),
  };
}
export function TickerPage({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  const { colors } = useTickerTheme();
  const navigation = useNavigation();
  const router = useScopedRouter();
  const insetContent = useNavigationBarContentStyle();
  const insets = useSafeAreaInsets();
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title={title}
          onBack={() =>
            router.canGoBack() ? router.back() : router.replace("/profile")
          }
        />
      ),
    });
  }, [navigation, router, title]);
  useEffect(() => {
    void hydrateTickerPreference();
  }, []);
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={[tickerStyles.page, { backgroundColor: colors.background }]}
      contentContainerStyle={insetContent([
        tickerStyles.content,
        { paddingBottom: insets.bottom + 24 },
      ])}
    >
      {children}
    </ScrollView>
  );
}
export function TickerCard({ children }: PropsWithChildren) {
  const { colors } = useTickerTheme();
  return (
    <View
      style={[tickerStyles.card, { backgroundColor: colors.itemBackground }]}
    >
      {children}
    </View>
  );
}
export function TickerAction({
  label,
  onPress,
  disabled,
  secondary,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  icon?: TickerIconName;
}) {
  const { isDark, colors } = useTickerTheme();
  return (
    <Button
      isDark={isDark}
      variant={secondary ? "outline" : "filled"}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={tickerStyles.action}
    >
      {icon && (
        <TickerIcon
          name={icon}
          color={secondary ? colors.text : colors.background}
        />
      )}
      {label}
    </Button>
  );
}

type TickerRowProps = {
  label: string;
  value: string;
  icon?: TickerIconName;
};

export function TickerRow({ label, value, icon }: TickerRowProps) {
  const { text, colors } = useTickerTheme();
  return (
    <View style={tickerStyles.row}>
      <View style={tickerStyles.rowLabel}>
        {icon && <TickerIcon name={icon} size={18} color={colors.icon} />}
        <Text style={[text.secondaryText, tickerStyles.label]}>{label}</Text>
      </View>
      <Text selectable style={[text.text, tickerStyles.value]}>
        {value}
      </Text>
    </View>
  );
}

export function TickerFeedback({
  compact = false,
}: { compact?: boolean } = {}) {
  const {
    error,
    authorized,
    authorizing,
    renaming,
    connection,
    pendingCommands,
    status,
  } = useTickerStore();
  const { text, colors } = useTickerTheme();
  const busy = connection === "connecting" || connection === "verifying";
  const waitingForCommand = Object.values(pendingCommands).some(
    (type) => type !== "set_brightness",
  );
  const hasControls =
    status?.capabilities.some(
      (type) => !["get_status", "get_settings"].includes(type),
    ) ?? false;
  const progressMessage = renaming
    ? "Saving ticker name…"
    : getProgressMessage(authorizing, connection, compact);
  const pairingMessage = getPairingMessage(hasControls, compact);

  return (
    <>
      {(busy || authorizing || renaming || waitingForCommand) && (
        <View style={tickerStyles.busy} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.text} />
          <Text style={[text.secondaryText, tickerStyles.feedbackCopy]}>
            {progressMessage}
          </Text>
        </View>
      )}
      {error && (
        <View accessibilityRole="alert" style={tickerStyles.busy}>
          <TickerIcon name="alert-circle-outline" color={colors.text} />
          <Text style={[text.errorText, tickerStyles.feedbackCopy]}>
            {error}
          </Text>
        </View>
      )}
      {connection === "connected" && !authorized && (
        <>
          <Text style={text.secondaryText}>{pairingMessage}</Text>
          {hasControls && (
            <TickerAction
              label={authorizing ? "Pairing…" : "Unlock controls"}
              icon="lock-open-outline"
              disabled={
                authorizing ||
                renaming ||
                Object.keys(pendingCommands).length > 0
              }
              onPress={() => void ticker.authorize()}
            />
          )}
        </>
      )}
      {connection === "connected" && authorized && !compact && (
        <Text style={text.secondaryText}>
          Controls unlocked for this connection.
        </Text>
      )}
    </>
  );
}
function getProgressMessage(
  authorizing: boolean,
  connection: TickerConnectionState,
  compact: boolean,
) {
  if (authorizing)
    return "Enter the code shown on your ticker in the device Bluetooth pairing prompt…";
  if (connection === "connecting") return "Connecting to ticker…";
  if (connection === "verifying")
    return compact ? "Checking your ticker…" : "Verifying firmware protocol…";
  return compact ? "Saving changes…" : "Waiting for device acknowledgment…";
}

function getPairingMessage(hasControls: boolean, compact: boolean) {
  if (!hasControls)
    return "Upload TempoScoreboard firmware 0.2.0 or newer, then reconnect to enable controls.";
  if (compact)
    return "Pair to change settings. Enter the code from your ticker in the Bluetooth prompt.";
  return "Unlock controls using Bluetooth pairing. Enter the six-digit code displayed on your physical ticker in the device system prompt. Bond keys stay in iOS and on the ticker.";
}

export const connectionLabel: Record<TickerConnectionState, string> = {
  disconnected: "Disconnected",
  connecting: "Connecting",
  verifying: "Verifying protocol",
  connected: "BLE connected",
  error: "Connection failed",
};
export const tickerStyles = StyleSheet.create({
  page: { flex: 1 },
  action: { gap: 8 },
  rowLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  label: { flexShrink: 1 },
  feedbackCopy: { flex: 1 },
  content: { padding: 12, paddingTop: 20, gap: 16 },
  card: { borderRadius: 12, padding: 16, gap: 14 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  value: { flex: 1, textAlign: "right" },
  busy: { flexDirection: "row", alignItems: "center", gap: 10 },
  device: {
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

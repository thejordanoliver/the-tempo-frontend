import { CustomHeader } from "components/CustomHeader";
import Button from "components/Buttons/Button";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation } from "expo-router";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useEffect, useLayoutEffect, type PropsWithChildren } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hydrateTickerPreference, useTickerStore } from "store/tickerStore";
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
      style={{ flex: 1, backgroundColor: colors.background }}
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
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  const { isDark } = useTickerTheme();
  return (
    <Button
      isDark={isDark}
      variant={secondary ? "outline" : "filled"}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
    >
      {label}
    </Button>
  );
}
export function TickerRow({ label, value }: { label: string; value: string }) {
  const { text } = useTickerTheme();
  return (
    <View style={tickerStyles.row}>
      <Text style={[text.secondaryText, { flexShrink: 1 }]}>{label}</Text>
      <Text selectable style={[text.text, tickerStyles.value]}>
        {value}
      </Text>
    </View>
  );
}
export function TickerFeedback() {
  const { error, authorized, connection, pendingCommands } = useTickerStore();
  const { text, colors } = useTickerTheme();
  const busy = connection === "connecting" || connection === "verifying";
  return (
    <>
      {(busy || Object.keys(pendingCommands).length > 0) && (
        <View style={tickerStyles.busy} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.text} />
          <Text style={text.secondaryText}>
            {busy
              ? connection === "verifying"
                ? "Verifying firmware protocol…"
                : "Connecting to ticker…"
              : "Waiting for device acknowledgment…"}
          </Text>
        </View>
      )}
      {error && (
        <Text accessibilityRole="alert" style={text.errorText}>
          {error}
        </Text>
      )}
      {connection === "connected" && !authorized && (
        <Text style={text.secondaryText}>
          BLE connected • Authorization required. Secure verification is
          awaiting firmware integration. Device controls remain locked.
        </Text>
      )}
    </>
  );
}
export const connectionLabel: Record<TickerConnectionState, string> = {
  disconnected: "Disconnected",
  connecting: "Connecting",
  verifying: "Verifying protocol",
  connected: "BLE connected",
  error: "Connection failed",
};
export const tickerStyles = StyleSheet.create({
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

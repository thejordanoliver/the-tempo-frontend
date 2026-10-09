import { Ionicons } from "@expo/vector-icons";
import ConfirmModal from "components/ConfirmModal";
import { Colors, Fonts, activeOpacity } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import type { SafetyActionsModalProps } from "hooks/useSafetyActions";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ReportReason } from "services/usersApi";

const REPORT_REASONS: { label: string; value: ReportReason }[] = [
  { label: "Spam", value: "spam" },
  { label: "Harassment", value: "harassment" },
  { label: "Hate or threats", value: "hate" },
  { label: "Other", value: "other" },
];

export default function SafetyActionsModal(props: SafetyActionsModalProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => safetyActionsStyles(isDark), [isDark]);
  const label = props.username ? `@${props.username}` : "this user";

  if (props.step === "block") {
    const isUnblocking = props.isBlocked;
    return (
      <ConfirmModal
        visible={props.visible}
        title={isUnblocking ? `Unblock ${label}?` : `Block ${label}?`}
        message={
          isUnblocking
            ? "You will be able to follow, message, and see each other's activity again."
            : "You won't be able to follow, message, or see each other's activity. They won't be notified."
        }
        confirmText={isUnblocking ? "Unblock" : "Block"}
        cancelText="Back"
        variant={isUnblocking ? "default" : "danger"}
        onCancel={props.onBack}
        onConfirm={props.onConfirmBlock}
        testID="block-user-modal"
      />
    );
  }

  if (props.step === "status") {
    return (
      <ConfirmModal
        visible={props.visible}
        title={props.statusTitle}
        message={props.statusMessage}
        confirmText="OK"
        showCancel={false}
        onCancel={props.onClose}
        onConfirm={props.onClose}
        testID="safety-status-modal"
      />
    );
  }

  const isReport = props.step === "report";

  return (
    <ConfirmModal
      visible={props.visible}
      title={
        isReport
          ? "Report content"
          : props.username
            ? `@${props.username}`
            : "Safety actions"
      }
      message={isReport ? "Why are you reporting this?" : undefined}
      cancelText={isReport ? "Back" : "Cancel"}
      showConfirm={false}
      onCancel={isReport ? props.onBack : props.onClose}
      onConfirm={() => undefined}
      testID={isReport ? "report-content-modal" : "safety-actions-modal"}
    >
      <View style={styles.options}>
        {isReport ? (
          REPORT_REASONS.map((reason) => (
            <Pressable
              key={reason.value}
              disabled={props.pending}
              onPress={() => void props.onSubmitReport(reason.value)}
              style={({ pressed }) => [
                styles.option,
                pressed && styles.pressed,
                props.pending && styles.disabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Report for ${reason.label}`}
            >
              <Text style={styles.optionText}>{reason.label}</Text>
              {props.pending ? (
                <ActivityIndicator size="small" color={Colors.midTone} />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.midTone}
                />
              )}
            </Pressable>
          ))
        ) : (
          <>
            <ActionRow
              label="Report"
              icon="flag-outline"
              onPress={props.onChooseReport}
              styles={styles}
            />
            {props.canBlock && (
              <ActionRow
                label={props.isBlocked ? "Unblock user" : "Block user"}
                icon={props.isBlocked ? "person-add-outline" : "ban-outline"}
                danger={!props.isBlocked}
                onPress={props.onChooseBlock}
                styles={styles}
              />
            )}
          </>
        )}
      </View>
    </ConfirmModal>
  );
}

function ActionRow({
  label,
  icon,
  danger = false,
  onPress,
  styles,
}: {
  label: string;
  icon: "flag-outline" | "ban-outline" | "person-add-outline";
  danger?: boolean;
  onPress: () => void;
  styles: ReturnType<typeof safetyActionsStyles>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.optionText, danger && styles.dangerText]}>
        {label}
      </Text>
      <Ionicons
        name={icon}
        size={20}
        color={danger ? styles.dangerText.color : Colors.midTone}
      />
    </Pressable>
  );
}

const safetyActionsStyles = (isDark: boolean) =>
  StyleSheet.create({
    options: { gap: 8 },
    option: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 16,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    optionText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    dangerText: { color: isDark ? Colors.dark.lightRed : Colors.light.red },
    pressed: { opacity: activeOpacity },
    disabled: { opacity: 0.55 },
  });

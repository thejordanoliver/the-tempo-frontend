import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Modal from "react-native-modal";

type ConfirmModalVariant = "default" | "danger";

type ConfirmModalProps = {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  children?: ReactNode;
  variant?: ConfirmModalVariant;
  confirmDisabled?: boolean;
  showCancel?: boolean;
  testID?: string;
};

export default function ConfirmModal({
  visible,
  title = "Are you sure?",
  message = "Please confirm your action.",
  onCancel,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
  children,
  variant = "default",
  confirmDisabled = false,
  showCancel = true,
  testID = "confirm-modal",
}: ConfirmModalProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => confirmModalStyles(isDark), [isDark]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDanger = variant === "danger";
  const isConfirmDisabled = confirmDisabled || isSubmitting;

  useEffect(() => {
    if (!visible) {
      setIsSubmitting(false);
    }
  }, [visible]);

  const handleCancel = useCallback(() => {
    if (isSubmitting) return;
    onCancel();
  }, [isSubmitting, onCancel]);

  const handleConfirm = useCallback(async () => {
    if (isConfirmDisabled) return;

    try {
      setIsSubmitting(true);
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  }, [isConfirmDisabled, onConfirm]);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleCancel}
      onBackButtonPress={handleCancel}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={220}
      animationOutTiming={160}
      backdropTransitionInTiming={220}
      backdropTransitionOutTiming={160}
      backdropOpacity={isDark ? 0.66 : 0.48}
      useNativeDriver
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      avoidKeyboard
      statusBarTranslucent
      style={styles.modal}
      testID={testID}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            {isDanger && (
              <View style={[styles.iconWrap, styles.dangerIconWrap]}>
                <Ionicons
                  name="alert"
                  size={28}
                  color={isDark ? Colors.dark.lightRed : Colors.light.red}
                />
              </View>
            )}

            <View style={styles.messageContainer}>
              {!!title && <Text style={styles.title}>{title}</Text>}

              {!!message && <Text style={styles.message}>{message}</Text>}
            </View>

            {!!children && <View style={styles.children}>{children}</View>}

            <View style={styles.buttonRow}>
              {showCancel && (
                <Pressable
                  onPress={handleCancel}
                  disabled={isSubmitting}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={cancelText}
                  accessibilityState={{ disabled: isSubmitting }}
                  style={({ pressed }) => [
                    styles.button,
                    styles.cancelButton,
                    pressed && !isSubmitting && styles.buttonPressed,
                    isSubmitting && styles.buttonDisabled,
                  ]}
                >
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </Pressable>
              )}

              <Pressable
                onPress={handleConfirm}
                disabled={isConfirmDisabled}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={confirmText}
                accessibilityState={{
                  disabled: isConfirmDisabled,
                  busy: isSubmitting,
                }}
                style={({ pressed }) => [
                  styles.button,
                  styles.confirmButton,
                  isDanger
                    ? styles.dangerConfirmButton
                    : styles.defaultConfirmButton,
                  pressed && !isConfirmDisabled && styles.buttonPressed,
                  isConfirmDisabled && styles.confirmButtonDisabled,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.confirmText}>{confirmText}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const confirmModalStyles = (isDark: boolean) =>
  StyleSheet.create({
    modal: {
      justifyContent: "center",
      alignItems: "center",
      margin: 0,
    },
    keyboardAvoidingView: {
      width: "100%",
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 22,
      paddingVertical: 28,
    },
    card: {
      width: "100%",
      minWidth: 300,
      overflow: "hidden",
      borderRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 18,
      backgroundColor: isDark ? Colors.black : Colors.white,
      shadowColor: Colors.black,
      shadowOpacity: isDark ? 0.42 : 0.18,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 16 },
      elevation: 22,
    },

    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
      borderWidth: StyleSheet.hairlineWidth,
    },
    dangerIconWrap: {
      backgroundColor: isDark ? "rgba(239,68,68,0.16)" : "rgba(239,68,68,0.1)",
      borderColor: isDark ? "rgba(248,113,113,0.34)" : "rgba(239,68,68,0.2)",
    },
    messageContainer: {
      gap: 9,
      marginBottom: 18,
    },
    title: {
      fontSize: 22,
      lineHeight: 28,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
      letterSpacing: -0.25,
    },
    message: {
      maxWidth: 310,
      alignSelf: "center",
      fontSize: 15,
      lineHeight: 22,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
      fontFamily: Fonts.OSREGULAR,
    },
    children: {
      width: "100%",
      marginBottom: 18,
      paddingTop: 2,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 10,
      width: "100%",
      marginTop: 2,
    },
    button: {
      flex: 1,
      minHeight: 48,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 13,
      paddingHorizontal: 16,
    },
    cancelButton: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(17,24,39,0.12)",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    confirmButton: {
      shadowColor: Colors.black,
      shadowOpacity: isDark ? 0.24 : 0.14,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 5,
    },
    defaultConfirmButton: {
      backgroundColor: isDark ? Colors.dark.blue : Colors.light.blue,
    },
    dangerConfirmButton: {
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    confirmButtonDisabled: {
      opacity: 0.58,
    },
    buttonDisabled: {
      opacity: 0.55,
    },
    buttonPressed: {
      transform: [{ scale: 0.985 }],
      opacity: 0.88,
    },
    cancelText: {
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.OSMEDIUM,
      textAlign: "center",
      fontSize: 15,
    },
    confirmText: {
      color: Colors.white,
      fontFamily: Fonts.OSMEDIUM,
      textAlign: "center",
      fontSize: 15,
    },
  });

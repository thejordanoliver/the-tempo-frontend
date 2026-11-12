import { ConfirmModalStyles } from "@/styles/ModalsStyles/ConfirmModalStyles";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useReducedMotion } from "hooks/useReducedMotion";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  findNodeHandle,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type TextInstance,
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
  onDismiss?: () => void;
  children?: ReactNode;
  variant?: ConfirmModalVariant;
  confirmDisabled?: boolean;
  showCancel?: boolean;
  showConfirm?: boolean;
  testID?: string;
};

export default function ConfirmModal({
  visible,
  title = "Are you sure?",
  message = "Please confirm your action.",
  onCancel,
  onDismiss,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
  children,
  variant = "default",
  confirmDisabled = false,
  showCancel = true,
  showConfirm = true,
  testID = "confirm-modal",
}: ConfirmModalProps) {
  const reduceMotion = useReducedMotion();
  const titleRef = useRef<TextInstance>(null);
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => ConfirmModalStyles(isDark), [isDark]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDanger = variant === "danger";
  const isConfirmDisabled = confirmDisabled || isSubmitting;

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      if (!visible) {
        setIsSubmitting(false);
      }
    });

    return () => {
      cancelled = true;
    };
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
      onModalHide={onDismiss}
      onModalShow={() => {
        if (Platform.OS !== "web") {
          const titleNode = findNodeHandle(titleRef.current);
          if (titleNode) AccessibilityInfo.setAccessibilityFocus(titleNode);
        }
      }}
      onBackdropPress={handleCancel}
      onBackButtonPress={handleCancel}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={reduceMotion ? 0 : 220}
      animationOutTiming={reduceMotion ? 0 : 160}
      backdropTransitionInTiming={reduceMotion ? 0 : 220}
      backdropTransitionOutTiming={reduceMotion ? 0 : 160}
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
          <View
            accessibilityViewIsModal
            onAccessibilityEscape={handleCancel}
            style={styles.card}
          >
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
              {!!title && (
                <Text
                  ref={titleRef}
                  accessibilityRole="header"
                  style={styles.title}
                >
                  {title}
                </Text>
              )}

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

              {showConfirm && (
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
                    <ActivityIndicator
                      size="small"
                      color={isDanger && isDark ? Colors.black : Colors.white}
                    />
                  ) : (
                    <Text style={[styles.confirmText]}>{confirmText}</Text>
                  )}
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

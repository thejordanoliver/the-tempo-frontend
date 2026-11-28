import { ConfirmModalStyles } from "@/styles/ModalsStyles/ConfirmModalStyles";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useReducedMotion } from "hooks/useReducedMotion";
import type { ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  findNodeHandle,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type TextInstance,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const messageId = `${dialogId}-message`;
  const { fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => ConfirmModalStyles(isDark), [isDark]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedAction, setFocusedAction] = useState<
    "cancel" | "confirm" | null
  >(null);

  const [presented, setPresented] = useState(visible);
  const [progress] = useState(() => new Animated.Value(0));
  if (visible && !presented) setPresented(true);
  const dismissRef = useRef(onDismiss);
  const wasPresented = useRef(false);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      const animation = Animated.timing(progress, {
        toValue: 1,
        duration: reduceMotion ? 0 : 220,
        useNativeDriver: true,
        isInteraction: false,
      });
      animation.start();
      return () => animation.stop();
    }
    if (!presented) return;

    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: reduceMotion ? 0 : 160,
      useNativeDriver: true,
      isInteraction: false,
    });
    animation.start(({ finished }) => {
      if (finished) setPresented(false);
    });
    return () => animation.stop();
  }, [visible, presented, progress, reduceMotion]);

  // Native onDismiss is iOS-only. Other platforms finish after unpresenting.
  useEffect(() => {
    if (presented) {
      wasPresented.current = true;
    } else if (wasPresented.current) {
      wasPresented.current = false;
      if (Platform.OS !== "ios") dismissRef.current?.();
    }
  }, [presented]);

  const isDanger = variant === "danger";
  const isConfirmDisabled = confirmDisabled || isSubmitting;
  const confirmTextColor = isDanger && isDark ? Colors.black : Colors.white;
  const webDialogProps =
    Platform.OS === "web"
      ? {
          "aria-labelledby": title ? titleId : undefined,
          "aria-describedby": message ? messageId : undefined,
          accessibilityLabel: title ? undefined : "Confirmation",
        }
      : {};

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
      visible={presented}
      transparent
      animationType="none"
      onDismiss={() => dismissRef.current?.()}
      onShow={() => {
        if (Platform.OS !== "web") {
          const titleNode = findNodeHandle(titleRef.current);
          if (titleNode) AccessibilityInfo.setAccessibilityFocus(titleNode);
        }
      }}
      onRequestClose={handleCancel}
      statusBarTranslucent
      testID={testID}
      {...webDialogProps}
    >
      <Animated.View style={[styles.modal, { opacity: progress }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          pointerEvents="box-none"
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            pointerEvents="box-none"
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: insets.top + 24,
                paddingRight: insets.right + 20,
                paddingBottom: insets.bottom + 24,
                paddingLeft: insets.left + 20,
              },
            ]}
          >
            <View
              style={styles.backdrop}
              onStartShouldSetResponder={() => true}
              onResponderRelease={handleCancel}
              accessible={false}
              aria-hidden
              importantForAccessibility="no-hide-descendants"
            />

            <View
              accessibilityViewIsModal
              onAccessibilityEscape={handleCancel}
              style={styles.card}
            >
              {isDanger && (
                <View
                  aria-hidden
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={[styles.iconWrap, styles.dangerIconWrap]}
                >
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
                    nativeID={titleId}
                    accessible
                    accessibilityRole="header"
                    style={styles.title}
                  >
                    {title}
                  </Text>
                )}

                {!!message && (
                  <Text nativeID={messageId} style={styles.message}>
                    {message}
                  </Text>
                )}
              </View>

              {!!children && <View style={styles.children}>{children}</View>}

              <View
                style={[
                  styles.buttonRow,
                  fontScale >= 1.3 && styles.stackedButtons,
                ]}
              >
                {showCancel && (
                  <Pressable
                    onPress={handleCancel}
                    onFocus={() => setFocusedAction("cancel")}
                    onBlur={() => setFocusedAction(null)}
                    disabled={isSubmitting}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={cancelText}
                    accessibilityState={{ disabled: isSubmitting }}
                    style={({ pressed }) => [
                      styles.button,
                      focusedAction === "cancel" && styles.focusedButton,
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
                    onFocus={() => setFocusedAction("confirm")}
                    onBlur={() => setFocusedAction(null)}
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
                      focusedAction === "confirm" && styles.focusedButton,
                      styles.confirmButton,
                      isDanger
                        ? styles.dangerConfirmButton
                        : styles.defaultConfirmButton,
                      pressed && !isConfirmDisabled && styles.buttonPressed,
                      isConfirmDisabled && styles.confirmButtonDisabled,
                    ]}
                  >
                    {isSubmitting && (
                      <ActivityIndicator
                        aria-hidden
                        size="small"
                        color={confirmTextColor}
                      />
                    )}
                    <Text
                      style={[styles.confirmText, { color: confirmTextColor }]}
                    >
                      {confirmText}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

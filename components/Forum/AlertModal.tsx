// components/Forum/CustomModal.tsx
import { Colors, Fonts, globalStyles } from "constants/Styles";
import { BlurView } from "expo-blur";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type AlertConfig = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
};


export interface CustomModalProps {
  visible: boolean;
  onCancel?: () => void; // optional now
  onConfirm?: () => void; // optional now
  isDark?: boolean;
  message?: string;
  title?: string;
  confirmText?: string;
  cancelText?: string; // optional
}

export default function AlertModal({
  visible,
  onCancel,
  onConfirm,
  isDark = false,
  title = "",
  message = "",
  confirmText = "",
  cancelText,
}: CustomModalProps) {
  const styles = customModalStyles(isDark, confirmText);
  const global = globalStyles(isDark);

  const showConfirm = !!onConfirm && !!confirmText;
  const showCancel = !!onCancel && !!cancelText;

  // Adjust flex for single button
  const confirmFlex = showCancel && showConfirm ? "100%" : undefined;
  const cancelFlex = showCancel && showConfirm ? "100%" : undefined;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <BlurView
          intensity={100}
          tint={"systemThinMaterial"}
          style={styles.modalContainer}
        >
          <View style={styles.messageContainer}>
            <Text style={styles.messageTitle}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
          <View style={styles.buttonsRow}>
            {showCancel && (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={onCancel}
                style={[styles.cancelButton, { width: cancelFlex }]}
              >
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            {showConfirm && (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={onConfirm}
                style={[styles.actionButton, { width: confirmFlex }]}
              >
                <Text style={styles.confirmText}>{confirmText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const customModalStyles = (isDark: boolean, confirmText: string) => {
  const isDestructive =
    confirmText.toLowerCase() === "delete" ||
    confirmText?.toLowerCase() === "Remove" ||
    confirmText?.toLowerCase() === "Discard";

  confirmText?.toLowerCase() === "ok" ||
    confirmText?.toLowerCase() === "save" ||
    confirmText?.toLowerCase() === "confirm";
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: "75%",
      height: "25%",
      borderRadius: 16, // main container is more rounded
      padding: 16,
      elevation: 10,
      overflow: "hidden",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: isDark ? Colors.darkGray : Colors.white, // ensure visible background
    },
    messageTitle: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSBOLD,
      fontSize: 28,
      textAlign: "center",
    },
    message: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      width: 280,
    },
    messageContainer: { gap: 12 },
    buttonsRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 12,
    },
    cancelButton: {
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 12, // button radius slightly smaller than container
      flex: 1,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray, // subtle background
    },
    actionButton: {
      backgroundColor: isDestructive
        ? Colors.dark.lightRed
        : Colors.light.green,
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 12,
      flex: 1,
      textAlign: "center",
    },
    confirmText: {
      color: Colors.white,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      fontSize: 20,
    },
    cancelText: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      fontSize: 20,
    },
  });
};

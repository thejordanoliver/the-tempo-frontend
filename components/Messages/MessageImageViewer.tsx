import { MessageImageViewerStyles } from "@/styles/MessageStyles/MessageImageViewerStyles";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { BlurView } from "expo-blur";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { ReduceMotion, ZoomIn } from "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import type { MessageAttachment } from "types/messages";
import AuthorizedMessageImage from "./AuthorizedMessageImage";

type Props = {
  attachment: MessageAttachment;
  onClose: () => void;
};

export default function MessageImageViewer({ attachment, onClose }: Props) {
  const styles = MessageImageViewerStyles;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <BlurView intensity={100} style={StyleSheet.absoluteFill} />
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.toolbar}>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close full-screen image"
              hitSlop={12}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color={Colors.white} />
            </Pressable>
          </View>
          <Animated.View
            entering={ZoomIn.duration(280).reduceMotion(ReduceMotion.System)}
            style={styles.image}
          >
            <AuthorizedMessageImage
              attachment={attachment}
              resizeMode="contain"
              style={styles.image}
            />
          </Animated.View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

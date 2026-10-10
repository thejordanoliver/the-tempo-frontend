import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { MessageAttachment } from "types/messages";
import AuthorizedMessageImage from "./AuthorizedMessageImage";

type Props = {
  attachment: MessageAttachment;
  onClose: () => void;
};

export default function MessageImageViewer({ attachment, onClose }: Props) {
  return (
    <Modal
      visible
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
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
        <AuthorizedMessageImage
          attachment={attachment}
          contentFit="contain"
          style={styles.image}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  toolbar: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButton: {
    padding: 8,
  },
  image: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.black,
  },
});

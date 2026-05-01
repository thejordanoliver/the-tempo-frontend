import { Ionicons } from "@expo/vector-icons";
import { GiphySearchModal } from "components/Forum/GiphySearchModal";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { memo, useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_HEIGHT = 60;

type Props = {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
  selectedGifUrl: string | null;
  onGifSelected: (gifUrl: string) => void;
  onRemoveGif: () => void;
};

function ChatInputBar({
  value,
  onChange,
  onSend,
  selectedGifUrl,
  onGifSelected,
  onRemoveGif,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const { bottom } = useSafeAreaInsets();
  const bottomOffset = bottom + TAB_BAR_HEIGHT;
  const translateY = useRef(new Animated.Value(0)).current;
  const [gifModalVisible, setGifModalVisible] = useState(false);

  const styles = getStyles(isDark);

  useEffect(() => {
    const keyboardShowEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardHideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const keyboardShow = Keyboard.addListener(keyboardShowEvent, (e) => {
      Animated.timing(translateY, {
        toValue: -(e.endCoordinates.height - TAB_BAR_HEIGHT - bottom),
        duration: e.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    const keyboardHide = Keyboard.addListener(keyboardHideEvent, (e) => {
      Animated.timing(translateY, {
        toValue: 0,
        duration: e.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardShow.remove();
      keyboardHide.remove();
    };
  }, [bottom, translateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingBottom: bottomOffset + 8,
          transform: [{ translateY }],
        },
      ]}
    >
      <BlurView
        intensity={100}
        tint="systemMaterial"
        style={StyleSheet.absoluteFill}
      />

      {/* GIF Preview */}
      {selectedGifUrl && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedGifUrl }} style={styles.previewGif} />
          <TouchableOpacity
            onPress={onRemoveGif}
            style={styles.previewCloseButton}
          >
            <Ionicons name="close-circle" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Row */}
      <View style={styles.inputRow}>
        {/* GIF Button */}
        <TouchableOpacity
          onPress={() => setGifModalVisible(true)}
          style={styles.iconButton}
        >
          <Ionicons
            name="images-outline"
            size={22}
            color={isDark ? Colors.white : Colors.black}
          />
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          style={styles.input}
          placeholder={selectedGifUrl ? "Add a caption..." : "Message..."}
          placeholderTextColor={isDark ? Colors.white : Colors.black}
          value={value}
          onChangeText={onChange}
          onSubmitEditing={onSend}
          returnKeyType="send"
          multiline
        />

        {/* Send Button */}
        <TouchableOpacity onPress={onSend} style={styles.sendButton}>
          <Ionicons name="send" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <GiphySearchModal
        visible={gifModalVisible}
        onClose={() => setGifModalVisible(false)}
        onGifSelected={(gifUrl) => {
          onGifSelected(gifUrl);
          setGifModalVisible(false);
        }}
        gifsCount={0}
      />
    </Animated.View>
  );
}

const MemoizedChatInputBar = memo(ChatInputBar);

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      paddingHorizontal: 12,
      paddingTop: 8,
      overflow: "hidden",
    },

    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    input: {
      flex: 1,
      maxHeight: 100,
      minHeight: 22,
      paddingVertical: 6,
      paddingHorizontal: 10,
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSREGULAR,
    },

    iconButton: {
      padding: 6,
      justifyContent: "center",
      alignItems: "center",
    },

    sendButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: isDark ? Colors.white : Colors.black,
      justifyContent: "center",
      alignItems: "center",
    },

    previewContainer: {
      marginBottom: 8,
      marginHorizontal: 4,
      alignSelf: "flex-start",
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    previewGif: {
      width: 132,
      height: 132,
    },

    previewCloseButton: {
      position: "absolute",
      top: 6,
      right: 6,
      backgroundColor: "#00000088",
      borderRadius: 999,
    },
  });

export default MemoizedChatInputBar;

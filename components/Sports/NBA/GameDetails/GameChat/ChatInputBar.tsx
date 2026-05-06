import { Ionicons } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Colors, Fonts } from "constants/styles";
import { Image } from "expo-image";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { buildChatPayload, type ChatSendPayload } from "utils/chatPayload";

type Props = {
  onSend: (payload: ChatSendPayload) => boolean | Promise<boolean>;
  isDark: boolean;
  disabled?: boolean;
  onHeightChange?: (height: number) => void;
  onSent?: () => void;
  selectedGifUrl: string | null;
  onSelectedGifUrlChange: (gifUrl: string | null) => void;
  onOpenGifPicker: () => void;
};

function ChatInputBar({
  onSend,
  isDark,
  disabled = false,
  onHeightChange,
  onSent,
  selectedGifUrl,
  onSelectedGifUrlChange,
  onOpenGifPicker,
}: Props) {
  const [value, setValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const isSendingRef = useRef(false);
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const payload = useMemo(
    () => buildChatPayload(value, selectedGifUrl),
    [selectedGifUrl, value],
  );

  const sendDisabled = !payload || isSending || disabled;

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onHeightChange?.(event.nativeEvent.layout.height);
    },
    [onHeightChange],
  );

  const handleOpenGifPicker = useCallback(() => {
    if (disabled || isSending) return;

    Keyboard.dismiss();

    requestAnimationFrame(() => {
      onOpenGifPicker();
    });
  }, [disabled, isSending, onOpenGifPicker]);

  const handleSend = useCallback(async () => {
    if (sendDisabled || isSendingRef.current) return;

    const nextPayload = buildChatPayload(value, selectedGifUrl);
    if (!nextPayload) return;

    isSendingRef.current = true;
    setIsSending(true);

    try {
      const sent = await onSend(nextPayload);
      if (!sent) return;

      setValue("");
      onSelectedGifUrlChange(null);
      Keyboard.dismiss();
      onSent?.();
    } catch (error) {
      console.warn("Failed to send chat message", error);
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  }, [
    onSelectedGifUrlChange,
    onSend,
    onSent,
    selectedGifUrl,
    sendDisabled,
    value,
  ]);

  const handleRemoveGif = useCallback(() => {
    onSelectedGifUrlChange(null);
  }, [onSelectedGifUrlChange]);

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {selectedGifUrl && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedGifUrl }} style={styles.previewGif} />

          <TouchableOpacity
            onPress={handleRemoveGif}
            style={styles.previewCloseButton}
            activeOpacity={0.85}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputRow}>
        <TouchableOpacity
          onPress={handleOpenGifPicker}
          style={styles.iconButton}
          activeOpacity={0.85}
          disabled={disabled || isSending}
          hitSlop={8}
        >
          <Ionicons
            name="images-outline"
            size={22}
            color={
              disabled || isSending
                ? Colors.darkGray
                : isDark
                  ? Colors.white
                  : Colors.black
            }
          />
        </TouchableOpacity>

        <BottomSheetTextInput
          style={styles.input}
          placeholder={selectedGifUrl ? "Add a caption..." : "Message..."}
          placeholderTextColor={isDark ? Colors.lightGray : Colors.darkGray}
          value={value}
          onChangeText={setValue}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          submitBehavior="submit"
          multiline
          editable={!disabled && !isSending}
          scrollEnabled
          textAlignVertical="center"
          blurOnSubmit={false}
        />

        <TouchableOpacity
          onPress={handleSend}
          style={[styles.sendButton, sendDisabled && styles.sendButtonDisabled]}
          disabled={sendDisabled}
          activeOpacity={0.85}
          hitSlop={8}
        >
          <Ionicons
            name="send"
            size={18}
            color={isDark ? Colors.black : Colors.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const MemoizedChatInputBar = memo(ChatInputBar);

export default MemoizedChatInputBar;

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: "100%",
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 12,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
      minHeight: 54,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark ? Colors.black : Colors.white,
      marginBottom: 8,
    },
    input: {
      flex: 1,
      maxHeight: 104,
      minHeight: 38,
      paddingTop: 9,
      paddingBottom: 9,
      paddingHorizontal: 10,
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      lineHeight: 19,
    },
    iconButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
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
    sendButtonDisabled: {
      opacity: 0.35,
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
      width: 148,
      height: 112,
    },
    previewCloseButton: {
      position: "absolute",
      top: 6,
      right: 6,
      backgroundColor: "#00000088",
      borderRadius: 999,
    },
  });
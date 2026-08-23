import { Ionicons } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Colors, Fonts, activeOpacity } from "constants/styles";
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
  sendDisabled?: boolean;
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
  sendDisabled: sendDisabledProp = false,
  onHeightChange,
  onSent,
  selectedGifUrl,
  onSelectedGifUrlChange,
  onOpenGifPicker,
  disablePanDown,
  enablePanDown,
}: Props & {
  disablePanDown: () => void;
  enablePanDown: () => void;
}) {
  const [value, setValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const isSendingRef = useRef(false);
  const styles = useMemo(() => ChatInputBarStyles(isDark), [isDark]);

  const payload = useMemo(
    () => buildChatPayload(value, selectedGifUrl),
    [selectedGifUrl, value],
  );

  const inputDisabled = disabled || isSending;
  const sendDisabled =
    !payload || isSending || disabled || sendDisabledProp;

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onHeightChange?.(event.nativeEvent.layout.height);
    },
    [onHeightChange],
  );

  const handleOpenGifPicker = useCallback(() => {
    if (inputDisabled) return;

    Keyboard.dismiss();
    disablePanDown();
    onOpenGifPicker();
  }, [inputDisabled, disablePanDown, onOpenGifPicker]);

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
            activeOpacity={activeOpacity}
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
          activeOpacity={activeOpacity}
          disabled={inputDisabled}
          hitSlop={8}
        >
          <Ionicons
            name="images-outline"
            size={22}
            color={
              inputDisabled
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
          editable={!inputDisabled}
          scrollEnabled
          textAlignVertical="center"
          blurOnSubmit={false}
          onFocus={disablePanDown}
          onBlur={enablePanDown}
        />

        <TouchableOpacity
          onPress={handleSend}
          style={[styles.sendButton, sendDisabled && styles.sendButtonDisabled]}
          disabled={sendDisabled}
          activeOpacity={activeOpacity}
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

const ChatInputBarStyles = (isDark: boolean) =>
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
      marginBottom: 8,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 22,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    input: {
      flex: 1,
      minHeight: 38,
      maxHeight: 104,
      paddingTop: 9,
      paddingBottom: 9,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 19,
      color: isDark ? Colors.white : Colors.black,
    },
    iconButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 38,
      height: 38,
      borderRadius: 19,
    },
    sendButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    sendButtonDisabled: {
      opacity: 0.35,
    },
    previewContainer: {
      alignSelf: "flex-start",
      marginBottom: 8,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 14,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
    },
    previewGif: {
      width: 148,
      height: 112,
    },
    previewCloseButton: {
      position: "absolute",
      top: 6,
      right: 6,
      borderRadius: 999,
      backgroundColor: "#00000088",
    },
  });

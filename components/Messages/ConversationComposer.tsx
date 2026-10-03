import AuthorizedMessageImage from "components/Messages/AuthorizedMessageImage";
import MessageAttachmentMenu from "components/Messages/MessageAttachmentMenu";
import { Ionicons } from "@expo/vector-icons";
import { activeOpacity, Colors } from "constants/styles";
import type { RefObject } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import type { ConversationScreenStyles } from "styles/MessageStyles/ConversationScreenStyles";
import type { MessageAttachment } from "types/messages";

type Props = {
  styles: ReturnType<typeof ConversationScreenStyles>;
  isDark: boolean;
  isUploadingImage: boolean;
  selectedAttachment: MessageAttachment | null;
  attachmentMenuVisible: boolean;
  draftMessage: string;
  isSendDisabled: boolean;
  sendError: string | null;
  inputRef: RefObject<TextInput | null>;
  handleRemoveAttachment: () => void;
  handlePickImage: () => Promise<void>;
  handleOpenGifPicker: () => void;
  handleToggleAttachmentMenu: () => void;
  handleDraftChange: (value: string) => void;
  closeAttachmentMenu: () => void;
  scrollToBottom: (animated?: boolean) => void;
  handleSend: () => Promise<void>;
};

export default function ConversationComposer({
  styles,
  isDark,
  isUploadingImage,
  selectedAttachment,
  attachmentMenuVisible,
  draftMessage,
  isSendDisabled,
  sendError,
  inputRef,
  handleRemoveAttachment,
  handlePickImage,
  handleOpenGifPicker,
  handleToggleAttachmentMenu,
  handleDraftChange,
  closeAttachmentMenu,
  scrollToBottom,
  handleSend,
}: Props) {
  return (
    <>
      {isUploadingImage && (
        <Text style={styles.uploadStatusText}>Uploading attachment...</Text>
      )}

      {selectedAttachment && (
        <View style={styles.previewContainer}>
          <AuthorizedMessageImage
            attachment={selectedAttachment}
            style={styles.previewMedia}
            contentFit="cover"
          />

          <View style={styles.previewBadge}>
            <Text style={styles.previewBadgeText}>
              {selectedAttachment.type === "gif" ? "GIF" : "Image"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleRemoveAttachment}
            style={styles.previewCloseButton}
            activeOpacity={activeOpacity}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.composer}>
        <View style={styles.attachmentAnchor}>
          <MessageAttachmentMenu
            visible={attachmentMenuVisible}
            isDark={isDark}
            onPickImage={handlePickImage}
            onOpenGifPicker={handleOpenGifPicker}
          />

          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={handleToggleAttachmentMenu}
            style={[
              styles.attachmentButton,
              attachmentMenuVisible && styles.attachmentButtonActive,
            ]}
            hitSlop={8}
          >
            <Ionicons
              name={attachmentMenuVisible ? "close" : "add"}
              size={23}
              color={isDark ? Colors.white : Colors.black}
            />
          </TouchableOpacity>
        </View>

        <TextInput
          ref={inputRef}
          value={draftMessage}
          onChangeText={handleDraftChange}
          placeholder={
            selectedAttachment ? "Add a caption..." : "Message..."
          }
          placeholderTextColor={isDark ? Colors.lightGray : Colors.darkGray}
          style={styles.input}
          multiline
          maxLength={500}
          textAlignVertical="center"
          returnKeyType="send"
          submitBehavior="submit"
          blurOnSubmit={false}
          onPressIn={closeAttachmentMenu}
          onFocus={() => {
            requestAnimationFrame(() => {
              scrollToBottom();
            });
          }}
          onSubmitEditing={handleSend}
        />

        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={handleSend}
          disabled={isSendDisabled}
          style={[
            styles.sendButton,
            isSendDisabled && styles.sendButtonDisabled,
          ]}
          hitSlop={8}
        >
          <Ionicons
            name="send"
            size={18}
            color={isDark ? Colors.black : Colors.white}
          />
        </TouchableOpacity>
      </View>

      {!!sendError && <Text style={styles.sendError}>{sendError}</Text>}
    </>
  );
}

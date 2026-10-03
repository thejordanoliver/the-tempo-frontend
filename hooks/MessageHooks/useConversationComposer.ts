import { useCallback, useRef, useState } from "react";
import { Alert, TextInput } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getAuthorizedMessageAttachment } from "services/messageAttachmentUrls";
import { uploadMessageGif, uploadMessageImage } from "services/messagesApi";
import type { useDirectMessages } from "hooks/MessageHooks/useDirectMessages";
import type { MessageAttachment } from "types/messages";
import { getErrorMessage } from "utils/getErrorMessage";

type Options = {
  conversationId: string;
  sendMessage: ReturnType<typeof useDirectMessages>["sendMessage"];
  notifyTyping: (value: string) => void;
  scrollToBottom: () => void;
};

export function useConversationComposer({
  conversationId,
  sendMessage,
  notifyTyping,
  scrollToBottom,
}: Options) {
  const inputRef = useRef<TextInput>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [selectedAttachment, setSelectedAttachment] =
    useState<MessageAttachment | null>(null);
  const [attachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const [gifModalVisible, setGifModalVisible] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const isSendDisabled =
    isUploadingImage ||
    (draftMessage.trim().length === 0 && selectedAttachment === null);

  const closeAttachmentMenu = useCallback(() => {
    setAttachmentMenuVisible(false);
  }, []);

  const handleToggleAttachmentMenu = useCallback(() => {
    setAttachmentMenuVisible((current) => !current);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const handlePickImage = useCallback(async () => {
    closeAttachmentMenu();

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo access needed",
          "Please allow photo access to send an image.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      const asset = result.assets[0];
      setIsUploadingImage(true);

      const attachment = await uploadMessageImage(conversationId, {
        uri: asset.uri,
        name: asset.fileName ?? asset.uri.split("/").pop() ?? "message.jpg",
        type: asset.mimeType ?? "image/jpeg",
      });
      const signed = await getAuthorizedMessageAttachment(attachment.id);

      setSelectedAttachment({ ...attachment, uri: signed.url });
    } catch (err: unknown) {
      Alert.alert(
        "Image upload failed",
        getErrorMessage(err, "Please try another image."),
      );
    } finally {
      setIsUploadingImage(false);

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [closeAttachmentMenu, conversationId]);

  const handleOpenGifPicker = useCallback(() => {
    closeAttachmentMenu();

    requestAnimationFrame(() => {
      setGifModalVisible(true);
    });
  }, [closeAttachmentMenu]);

  const handleCloseGifPicker = useCallback(() => {
    setGifModalVisible(false);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const handleGifSelected = useCallback(
    async (_gifUrl: string, giphyId: string) => {
      setGifModalVisible(false);
      setIsUploadingImage(true);

      try {
        const attachment = await uploadMessageGif(conversationId, giphyId);
        const signed = await getAuthorizedMessageAttachment(attachment.id);

        setSelectedAttachment({ ...attachment, uri: signed.url });
      } catch (err: unknown) {
        Alert.alert(
          "GIF upload failed",
          getErrorMessage(err, "Please try another GIF."),
        );
      } finally {
        setIsUploadingImage(false);

        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    },
    [conversationId],
  );

  const handleRemoveAttachment = useCallback(() => {
    setSelectedAttachment(null);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const handleDraftChange = useCallback(
    (value: string) => {
      setDraftMessage(value);
      notifyTyping(value);
    },
    [notifyTyping],
  );

  const handleSend = useCallback(async () => {
    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage && !selectedAttachment) return;

    const didSend = await sendMessage({
      text: trimmedMessage,
      attachment: selectedAttachment,
    });

    if (!didSend) return;

    setDraftMessage("");
    setSelectedAttachment(null);
    setAttachmentMenuVisible(false);
    scrollToBottom();

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [draftMessage, scrollToBottom, selectedAttachment, sendMessage]);

  return {
    inputRef,
    draftMessage,
    selectedAttachment,
    attachmentMenuVisible,
    gifModalVisible,
    isUploadingImage,
    isSendDisabled,
    closeAttachmentMenu,
    handleToggleAttachmentMenu,
    handlePickImage,
    handleOpenGifPicker,
    handleCloseGifPicker,
    handleGifSelected,
    handleRemoveAttachment,
    handleDraftChange,
    handleSend,
  };
}

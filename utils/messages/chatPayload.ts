export type ChatSendPayload = {
  text?: string;
  gifUrl?: string;
};

export function buildChatPayload(
  text: string,
  gifUrl?: string | null,
): ChatSendPayload | null {
  const trimmedText = text.trim();
  const normalizedGifUrl = gifUrl?.trim();

  if (!trimmedText && !normalizedGifUrl) {
    return null;
  }

  return {
    ...(trimmedText ? { text: trimmedText } : {}),
    ...(normalizedGifUrl ? { gifUrl: normalizedGifUrl } : {}),
  };
}

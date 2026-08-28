import { apiClient, subscribeAuthSession } from "utils/apiClient";
import type { MessageAttachment } from "types/messages";
import { createExpiringRequestCache } from "services/messageAttachmentUrlCache";

const EXPIRY_REFRESH_BUFFER_MS = 30_000;

export type AuthorizedMessageAttachment = {
  attachment: MessageAttachment;
  expiresAt: string;
  url: string;
};

const signedUrlCache =
  createExpiringRequestCache<AuthorizedMessageAttachment>({
    refreshBufferMs: EXPIRY_REFRESH_BUFFER_MS,
  });

const normalizeAttachmentId = (value: unknown) =>
  String(value ?? "").trim();

export const clearMessageAttachmentUrlCache = () => {
  signedUrlCache.clear();
};

let lastAccessToken: string | null = null;

subscribeAuthSession(({ accessToken }) => {
  if (
    !accessToken ||
    (lastAccessToken !== null && lastAccessToken !== accessToken)
  ) {
    clearMessageAttachmentUrlCache();
  }

  lastAccessToken = accessToken;
});

export const getAuthorizedMessageAttachment = async (
  attachmentIdValue: string,
  options: { forceRefresh?: boolean } = {},
): Promise<AuthorizedMessageAttachment> => {
  const attachmentId = normalizeAttachmentId(attachmentIdValue);

  if (!attachmentId) {
    throw new Error("Attachment is unavailable.");
  }

  return signedUrlCache.get(
    attachmentId,
    async () => {
      const response = await apiClient.get(
        `/api/messages/attachments/${attachmentId}/url`,
      );
      const raw = response.data ?? {};
      const expiresAt = String(raw.expiresAt ?? "");
      const url = String(raw.url ?? "");
      const attachment = raw.attachment as MessageAttachment | undefined;

      if (
        !url ||
        !attachment?.id ||
        attachment.id !== attachmentId
      ) {
        throw new Error("Attachment URL response was invalid.");
      }

      return {
        attachment,
        expiresAt,
        url,
      };
    },
    options,
  );
};

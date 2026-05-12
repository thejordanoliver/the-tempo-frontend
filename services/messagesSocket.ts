import { io, Socket } from "socket.io-client";
import { SendDirectMessagePayload } from "types/messages";

const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL?.replace(/\/$/, "") ??
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "";

let messagesSocket: Socket | null = null;
let activeToken: string | null = null;

export const getMessagesSocket = (token?: string | null) => {
  if (!token || !SOCKET_URL) return null;

  if (messagesSocket && activeToken === token) {
    if (!messagesSocket.connected) {
      messagesSocket.connect();
    }

    return messagesSocket;
  }

  messagesSocket?.disconnect();
  activeToken = token;

  messagesSocket = io(`${SOCKET_URL}/messages`, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
  });

  return messagesSocket;
};

export const disconnectMessagesSocket = () => {
  messagesSocket?.disconnect();
  messagesSocket = null;
  activeToken = null;
};

export const emitMessageSend = (
  payload: SendDirectMessagePayload & { conversationId: string },
  callback?: (response?: unknown) => void,
) => {
  messagesSocket?.emit("message:send", payload, callback);
};

export const emitTypingStart = (conversationId: string) => {
  messagesSocket?.emit("typing:start", { conversationId });
};

export const emitTypingStop = (conversationId: string) => {
  messagesSocket?.emit("typing:stop", { conversationId });
};

export const emitConversationRead = (conversationId: string) => {
  messagesSocket?.emit("conversation:read", { conversationId });
};

export const emitConversationPin = (
  conversationId: string,
  isPinned: boolean,
) => {
  messagesSocket?.emit("conversation:pin", { conversationId, isPinned });
};

export const emitConversationDelete = (conversationId: string) => {
  messagesSocket?.emit("conversation:delete", { conversationId });
};

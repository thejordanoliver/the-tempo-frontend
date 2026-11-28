import LiveChat from "@/components/Sports/Basketball/GameDetails/GameChat/LiveChat";
import ConfirmModal from "components/ConfirmModal";
import { useGameChatAvailability } from "hooks/useGameChatAvailability";
import { useLiveGameChat, type GameChatContext } from "hooks/useLiveGameChat";
import { memo, useCallback, useEffect, useState } from "react";
import { Animated, StyleSheet } from "react-native";
import type { ChatMessageItem } from "types/chat";
import type { ChatSendPayload } from "utils/messages/chatPayload";
import FloatingButton from "../../../../Buttons/FloatingButton";

type GameChatSessionProps = {
  currentUserId?: number;
  error: string | null;
  retryMessage: (id: string) => void;
  deleteMessage: (id: string) => void;
  messages: ChatMessageItem[];
  userCount: number;
  currentUserName: string;
  isReady: boolean;
  sendMessage: (payload: ChatSendPayload) => boolean;
  addReaction: (messageId: string, emoji: string) => void;
  hideBlockedUser: (userId: number) => void;
  onClose: () => void;
};

type GameLiveChat = {
  context: GameChatContext;
  gameId: string;
  opacityAnim: Animated.Value;
  isLive: boolean;
};

type MountedGameLiveChatOverlayProps = {
  context: GameChatContext;
  gameId: string;
  opacityAnim: Animated.Value;
  chatOpen: boolean;
  onOpenChat: () => void;
  onCloseChat: () => void;
};

const GameChatSession = memo(function GameChatSession({
  currentUserId,
  error,
  retryMessage,
  deleteMessage,
  messages,
  userCount,
  currentUserName,
  isReady,
  sendMessage,
  addReaction,
  hideBlockedUser,
  onClose,
}: GameChatSessionProps) {
  const handleSend = useCallback(
    async (payload: ChatSendPayload) => {
      return sendMessage(payload);
    },
    [sendMessage],
  );

  return (
    <LiveChat
      currentUserId={currentUserId}
      error={error}
      onRetry={retryMessage}
      onDelete={deleteMessage}
      messages={messages}
      userCount={userCount}
      currentUserName={currentUserName}
      onReaction={addReaction}
      onBlockedUser={hideBlockedUser}
      onSend={handleSend}
      sendDisabled={!isReady}
      onDismiss={onClose}
    />
  );
});

function MountedGameLiveChatOverlay({
  context,
  gameId,
  opacityAnim,
  chatOpen,
  onOpenChat,
  onCloseChat,
}: MountedGameLiveChatOverlayProps) {
  const {
    messages,
    userCount,
    currentUserName,
    isReady,
    sendMessage,
    addReaction,
    hideBlockedUser,
    currentUserId,
    error,
    retryMessage,
    deleteMessage,
  } = useLiveGameChat(gameId, context);

  return (
    <>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.floatingButtonLayer, { opacity: opacityAnim }]}
      >
        <FloatingButton
          isOpen={chatOpen}
          onPress={onOpenChat}
          icon={"chatbubble"}
        />
      </Animated.View>

      {chatOpen && (
        <GameChatSession
          currentUserId={currentUserId}
          error={error}
          retryMessage={retryMessage}
          deleteMessage={deleteMessage}
          messages={messages}
          userCount={userCount}
          currentUserName={currentUserName}
          isReady={isReady}
          sendMessage={sendMessage}
          addReaction={addReaction}
          hideBlockedUser={hideBlockedUser}
          onClose={onCloseChat}
        />
      )}
    </>
  );
}

export default function GameLiveChatOverlay({
  context,
  gameId,
  opacityAnim,
  isLive,
}: GameLiveChat) {
  const [chatOpen, setChatOpen] = useState(false);
  const [availabilityNotice, setAvailabilityNotice] = useState<{
    gameId: string;
    message: string;
  } | null>(null);
  const gameDate = context.date ? new Date(context.date) : null;
  const isAvailable = useGameChatAvailability(gameDate, isLive);

  const handleCloseChat = useCallback(() => {
    setChatOpen(false);
  }, []);

  const handleOpenChat = useCallback(() => {
    setChatOpen(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      setChatOpen(false);
      setAvailabilityNotice(null);
    });

    return () => {
      cancelled = true;
    };
  }, [gameId, isAvailable]);

  if (!context.date) return null;

  if (!isAvailable) {
    const showAvailability = () => {
      const message =
        gameDate && gameDate.getTime() > Date.now()
          ? "Chat opens 15 minutes before the game starts."
          : "Chat for this game has closed.";
      setAvailabilityNotice({ gameId, message });
    };

    return (
      <>
        <Animated.View
          pointerEvents="box-none"
          style={[styles.floatingButtonLayer, { opacity: opacityAnim }]}
        >
          <FloatingButton
            isOpen={false}
            onPress={showAvailability}
            accessibilityLabel="Game chat availability"
          />
        </Animated.View>
        <ConfirmModal
          visible={availabilityNotice?.gameId === gameId}
          title="Game chat"
          message={availabilityNotice?.message ?? ""}
          showCancel={false}
          onConfirm={() => setAvailabilityNotice(null)}
          onCancel={() => setAvailabilityNotice(null)}
        />
      </>
    );
  }

  return (
    <MountedGameLiveChatOverlay
      context={context}
      gameId={gameId}
      opacityAnim={opacityAnim}
      chatOpen={chatOpen}
      onOpenChat={handleOpenChat}
      onCloseChat={handleCloseChat}
    />
  );
}

const styles = StyleSheet.create({
  floatingButtonLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    elevation: 1000,
  },
});

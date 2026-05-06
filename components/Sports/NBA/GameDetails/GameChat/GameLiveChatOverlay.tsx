import LiveChat from "components/Sports/NBA/GameDetails/GameChat/LiveChat";
import { useLiveGameChat } from "hooks/useLiveGameChat";
import { memo, useCallback, useEffect, useState } from "react";
import { Animated, StyleSheet } from "react-native";
import type { ChatSendPayload } from "utils/chatPayload";
import ChatButton from "./ChatButton";

type GameChatSessionProps = {
  gameId: string;
  onClose: () => void;
};

const GameChatSession = memo(function GameChatSession({
  gameId,
  onClose,
}: GameChatSessionProps) {
  const {
    messages,
    userCount,
    currentUserName,
    isReady,
    sendMessage,
    addReaction,
  } = useLiveGameChat(gameId);

  const handleSend = useCallback(
    async (payload: ChatSendPayload) => {
      return sendMessage(payload);
    },
    [sendMessage],
  );

  return (
    <LiveChat
      messages={messages}
      userCount={userCount}
      currentUserName={currentUserName}
      onReaction={addReaction}
      onSend={handleSend}
      inputDisabled={!isReady}
      onDismiss={onClose}
    />
  );
});

export default function GameLiveChatOverlay({
  gameId,
  opacityAnim,
}: {
  gameId: string;
  opacityAnim: Animated.Value;
}) {
  const [chatOpen, setChatOpen] = useState(false);

  const handleCloseChat = useCallback(() => {
    setChatOpen(false);
  }, []);

  const handleOpenChat = useCallback(() => {
    setChatOpen(true);
  }, []);

  useEffect(() => {
    setChatOpen(false);
  }, [gameId]);

  return (
    <>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.floatingButtonLayer, { opacity: opacityAnim }]}
      >
        <ChatButton
          gameId={gameId}
          isOpen={chatOpen}
          onPress={handleOpenChat}
        />
      </Animated.View>

      {chatOpen && (
        <GameChatSession
          key={gameId}
          gameId={gameId}
          onClose={handleCloseChat}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  floatingButtonLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
});

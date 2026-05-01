import { Animated } from "react-native";
import { useCallback, useEffect, useState } from "react";

import LiveChat from "components/Sports/NBA/GameDetails/GameChat/LiveChat";
import ChatInputBar from "components/Sports/NBA/GameDetails/GameChat/ChatInputBar";
import { MemoizedFloatingChatButton } from "components/Sports/NBA/GameDetails";

interface ChatSendPayload {
  text?: string;
  gifUrl?: string;
}

export default function GameLiveChatOverlay({
  gameId,
  opacityAnim,
}: {
  gameId: string;
  opacityAnim: Animated.Value;
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [selectedGifUrl, setSelectedGifUrl] = useState<string | null>(null);
  const [sendFn, setSendFn] = useState<
    ((payload: ChatSendPayload) => void) | null
  >(null);
  const handleCloseChat = useCallback(() => {
    setChatOpen(false);
    setInput("");
    setSelectedGifUrl(null);
    setSendFn(null);
  }, []);

  useEffect(() => {
    setInput("");
    setSelectedGifUrl(null);
    setSendFn(null);
    setChatOpen(false);
  }, [gameId]);

  return (
    <>
      {/* Floating button */}
      <Animated.View style={{ opacity: opacityAnim }}>
        <MemoizedFloatingChatButton
          gameId={gameId}
          isOpen={chatOpen}
          onPress={() => setChatOpen(true)}
        />
      </Animated.View>

      {/* Chat UI */}
      {chatOpen && (
        <>
          <LiveChat
            gameId={gameId}
            onChange={(index) => index === -1 && handleCloseChat()}
            onSend={(fn) => setSendFn(() => fn)}
          />

          <ChatInputBar
            value={input}
            onChange={setInput}
            selectedGifUrl={selectedGifUrl}
            onGifSelected={setSelectedGifUrl}
            onRemoveGif={() => setSelectedGifUrl(null)}
            onSend={() => {
              if (!input.trim() && !selectedGifUrl) return;
              if (!sendFn) return;

              sendFn({
                text: input,
                gifUrl: selectedGifUrl ?? undefined,
              });

              setInput("");
              setSelectedGifUrl(null);
            }}
          />
        </>
      )}
    </>
  );
}

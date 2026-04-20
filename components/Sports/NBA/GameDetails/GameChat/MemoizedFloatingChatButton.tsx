import { Animated } from "react-native";
import { useRef, useEffect } from "react";
import { useChatStore } from "store/chatStore";
import FloatingChatButton from "components/Sports/NBA/GameDetails/GameChat/FloatingButton";

type Props = { gameId: string };

export default function MemoizedFloatingChatButton({ gameId }: Props) {
  const { openChat, isOpen: isChatOpen } = useChatStore();
  const opacityAnim = useRef(new Animated.Value(isChatOpen ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: isChatOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isChatOpen]);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        position: "absolute",
        bottom: 100,
        left: 0,
        right: 0,
      }}
      pointerEvents={isChatOpen ? "none" : "auto"}
    >
      <FloatingChatButton gameId={gameId} openChat={openChat} />
    </Animated.View>
  );
}

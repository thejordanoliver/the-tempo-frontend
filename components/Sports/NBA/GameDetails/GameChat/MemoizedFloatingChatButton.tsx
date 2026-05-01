import { Animated } from "react-native";
import { useRef, useEffect } from "react";
import FloatingChatButton from "components/Sports/NBA/GameDetails/GameChat/FloatingButton";

type Props = {
  gameId: string;
  isOpen: boolean;
  onPress: () => void;
};

export default function MemoizedFloatingChatButton({ gameId, isOpen, onPress }: Props) {
  const opacityAnim = useRef(new Animated.Value(isOpen ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen, opacityAnim]);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        position: "absolute",
        bottom: 100,
        left: 0,
        right: 0,
      }}
      pointerEvents={isOpen ? "none" : "auto"}
    >
      <FloatingChatButton openChat={onPress} />
    </Animated.View>
  );
}

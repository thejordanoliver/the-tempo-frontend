import { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import { useChatStore } from "store/chatStore";

export const useScrollFade = () => {
  const { isOpen: isChatOpen } = useChatStore();

  const [showDetails, setShowDetails] = useState(false);

  const opacityAnim = useRef(
    new Animated.Value(isChatOpen ? 0 : 1)
  ).current;

  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setShowDetails(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleScrollStart = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleScrollEnd = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    scrollTimeout.current = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: isChatOpen ? 0 : 1,
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 1000);
  };

  return {
    opacityAnim,
    handleScrollStart,
    handleScrollEnd,
    showDetails,
  };
};
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Keyboard, Platform, View } from "react-native";

export function useConversationKeyboard(
  scrollToBottom: () => void,
  navigationBarInset: number,
) {
  const rootRef = useRef<View>(null);
  const keyboardTop = useRef<number | null>(null);
  const [bottomInset] = useState(() => new Animated.Value(navigationBarInset));
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const updateLayout = useCallback((duration = 0) => {
    rootRef.current?.measureInWindow((_x, y, _width, height) => {
      // Measure the actual screen area: headers and Android window resizing
      // mean the keyboard's height alone is not the amount to reserve.
      const overlap = keyboardTop.current === null
        ? 0
        : Math.max(0, y + height - keyboardTop.current);

      bottomInset.stopAnimation();
      Animated.timing(bottomInset, {
        toValue: Math.max(navigationBarInset, overlap),
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && keyboardTop.current !== null) scrollToBottom();
      });
    });
  }, [bottomInset, navigationBarInset, scrollToBottom]);

  const onLayout = useCallback(() => updateLayout(), [updateLayout]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios"
      ? "keyboardWillChangeFrame"
      : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios"
      ? "keyboardWillHide"
      : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      keyboardTop.current = event.endCoordinates.height > 0
        ? event.endCoordinates.screenY
        : null;
      setKeyboardVisible(keyboardTop.current !== null);
      updateLayout(Platform.OS === "ios" ? event.duration || 250 : 220);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, (event) => {
      keyboardTop.current = null;
      setKeyboardVisible(false);
      updateLayout(Platform.OS === "ios" ? event.duration || 220 : 180);
    });

    updateLayout();
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      bottomInset.stopAnimation();
    };
  }, [bottomInset, updateLayout]);

  return { rootRef, onLayout, bottomInset, keyboardVisible };
}

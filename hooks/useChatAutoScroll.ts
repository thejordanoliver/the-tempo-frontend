import type { BottomSheetFlatListMethods } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef } from "react";

export function useChatAutoScroll(messageCount: number) {
  const listRef = useRef<BottomSheetFlatListMethods>(null);
  const pendingScrollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToLatestMessage = useCallback((animated = true) => {
    if (pendingScrollRef.current) {
      clearTimeout(pendingScrollRef.current);
    }

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
    });

    pendingScrollRef.current = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated });
      pendingScrollRef.current = null;
    }, 100);
  }, []);

  useEffect(() => {
    if (messageCount > 0) {
      scrollToLatestMessage();
    }
  }, [messageCount, scrollToLatestMessage]);

  useEffect(
    () => () => {
      if (pendingScrollRef.current) {
        clearTimeout(pendingScrollRef.current);
      }
    },
    [],
  );

  return {
    listRef,
    scrollToLatestMessage,
  };
}

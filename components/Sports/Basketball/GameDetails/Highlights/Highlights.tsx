import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/styles";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  type ListRenderItem,
  type ViewStyle,
  type ViewToken,
} from "react-native";
import type { Highlight } from "types/types";

import {
  HighlightVideoItem,
  type HighlightVideoItemStyles,
} from "./HighlightVideoItem";

type HighlightVideoProps = {
  highlights: Highlight[] | undefined;
  isDark: boolean;
};

const AUTO_ADVANCE_INTERVAL_MS = 10_000;
const CARD_GAP = 15;
const CARD_HEIGHT = 220;
const MAX_CARD_WIDTH = 420;
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 60 } as const;

export const Highlights = React.memo(function Highlights({
  highlights,
  isDark,
}: HighlightVideoProps) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(windowWidth * 0.8, MAX_CARD_WIDTH);
  const snapInterval = cardWidth + CARD_GAP;
  const styles = useMemo(() => createHighlightStyles(cardWidth), [cardWidth]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const listRef = useRef<FlatList<Highlight>>(null);
  const currentIndexRef = useRef(0);
  const highlightCount = highlights?.length ?? 0;

  const handlePlay = useCallback((id: string) => {
    setPlayingId(id);
  }, []);

  const handleEnd = useCallback((id: string) => {
    setPlayingId((currentId) => (currentId === id ? null : currentId));
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<Highlight>[] }) => {
      const firstVisibleItem = viewableItems.find(
        (viewableItem) => viewableItem.index != null,
      );

      if (firstVisibleItem?.index != null) {
        currentIndexRef.current = firstVisibleItem.index;
      }

      setPlayingId((currentId) => {
        if (
          currentId &&
          !viewableItems.some((viewableItem) => viewableItem.item.id === currentId)
        ) {
          return null;
        }

        return currentId;
      });
    },
    [],
  );

  useEffect(() => {
    if (currentIndexRef.current >= highlightCount) {
      currentIndexRef.current = 0;
    }
  }, [highlightCount]);

  useEffect(() => {
    if (highlightCount < 2 || playingId) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % highlightCount;

      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      currentIndexRef.current = nextIndex;
    }, AUTO_ADVANCE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [highlightCount, playingId]);

  const getItemLayout = useCallback(
    (_data: ArrayLike<Highlight> | null | undefined, index: number) => ({
      index,
      length: snapInterval,
      offset: snapInterval * index,
    }),
    [snapInterval],
  );

  const renderItem = useCallback<ListRenderItem<Highlight>>(
    ({ item }) => (
      <HighlightVideoItem
        item={item}
        isPlaying={playingId === item.id}
        onEnd={handleEnd}
        onPlay={handlePlay}
        styles={styles}
      />
    ),
    [handleEnd, handlePlay, playingId, styles],
  );

  if (!highlights?.length) return null;

  return (
    <View>
      <HeadingTwo isDark={isDark}>Highlights</HeadingTwo>
      <View style={styles.wrapper}>
        <FlatList
          ref={listRef}
          contentContainerStyle={styles.listContainer}
          data={highlights}
          decelerationRate="fast"
          extraData={playingId}
          getItemLayout={getItemLayout}
          horizontal
          initialNumToRender={2}
          keyExtractor={(item) => item.id}
          maxToRenderPerBatch={3}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          snapToInterval={snapInterval}
          viewabilityConfig={VIEWABILITY_CONFIG}
          windowSize={3}
        />
      </View>
    </View>
  );
});

const createHighlightStyles = (
  cardWidth: number,
): HighlightVideoItemStyles & {
  listContainer: ViewStyle;
  wrapper: ViewStyle;
} =>
  StyleSheet.create({
    listContainer: {
      paddingLeft: 12,
    },
    wrapper: {
      borderColor: Colors.midTone,
      borderRadius: 8,
      borderWidth: 1,
      padding: 12,
    },
    cardWrapper: {
      alignItems: "center",
      backgroundColor: Colors.black,
      borderRadius: 10,
      height: CARD_HEIGHT,
      justifyContent: "center",
      marginRight: CARD_GAP,
      overflow: "hidden",
      width: cardWidth,
    },
    video: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: Colors.black,
    },
    thumbnailWrapper: {
      height: "100%",
      position: "relative",
      width: "100%",
    },
    thumbnail: {
      height: "100%",
      width: "100%",
    },
    playButtonOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.28)",
      justifyContent: "center",
    },
    headlineContainer: {
      bottom: 0,
      justifyContent: "flex-end",
      left: 0,
      padding: 10,
      position: "absolute",
      right: 0,
    },
    headline: {
      color: Colors.white,
      fontFamily: Fonts.BOLD,
      fontSize: 16,
    },
    unavailable: {
      color: Colors.white,
      padding: 10,
      textAlign: "center",
    },
  });

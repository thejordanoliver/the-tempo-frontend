import AppVideo from "@/components/AppVideo";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/styles";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Highlight } from "types/types";

type HighlightVideoProps = {
  highlights: Highlight[];
  isDark: boolean;
};

const { width } = Dimensions.get("window");
const CARD_HEIGHT = 220;

// ---> FIX: SAFE ESPN VIDEO URL EXTRACTOR
const getPlayableUrl = (item: Highlight) => {
  return (
    item?.links?.source?.HLS?.href ||
    item?.links?.hls ||
    item?.links?.source?.href ||
    item?.links?.mp4 ||
    item?.links?.mobile ||
    null
  );
};

export const HighlightVideoList: React.FC<HighlightVideoProps> = ({
  highlights,
  isDark,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [paused, setPaused] = useState<Record<string, boolean>>({});
  const listRef = useRef<FlatList<Highlight>>(null);
  const currentIndexRef = useRef(0);

  const [headlineVisible, setHeadlineVisible] = useState<
    Record<string, boolean>
  >({});
  const [hasPlayed, setHasPlayed] = useState<Record<string, boolean>>({});
  const styles = highlightStyles(isDark);
  const handlePlay = useCallback((id: string) => {
    setPlayingId(id);
    setPaused((prev) => ({ ...prev, [id]: false }));
    setHasPlayed((prev) => ({ ...prev, [id]: true }));
  }, []);

  React.useEffect(() => {
    if (!highlights || highlights.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % highlights.length;

      listRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      currentIndexRef.current = nextIndex;
    }, 10000);

    return () => clearInterval(interval);
  }, [highlights]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        currentIndexRef.current = viewableItems[0].index ?? 0;
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderItem = useCallback(
    ({ item }: { item: Highlight }) => {
      const videoSource = getPlayableUrl(item);

      if (!videoSource) {
        return (
          <View style={[styles.cardWrapper, { justifyContent: "center" }]}>
            <Text style={styles.unavailable}>Video unavailable</Text>
          </View>
        );
      }

      const isPlaying = playingId === item.id;
      const isPaused = paused[item.id];

      return (
        <View style={styles.cardWrapper}>
          {isPlaying ? (
            <AppVideo
              uri={videoSource}
              style={styles.video}
              contentFit="contain"
              autoPlay={!isPaused}
              nativeControls
              onPlayingChange={(nextIsPlaying) => {
                setPaused((prev) => ({ ...prev, [item.id]: !nextIsPlaying }));

                if (!nextIsPlaying) {
                  setHeadlineVisible((prev) => ({ ...prev, [item.id]: true }));

                  setTimeout(() => {
                    setHeadlineVisible((prev) => ({
                      ...prev,
                      [item.id]: false,
                    }));
                  }, 2500);
                }
              }}
              onEnd={() => {
                setPaused((prev) => ({ ...prev, [item.id]: true }));
                setPlayingId(null);
                setHeadlineVisible((prev) => ({ ...prev, [item.id]: false }));
              }}
            />
          ) : (
            <Pressable
              style={styles.thumbnailWrapper}
              onPress={() => handlePlay(item.id)}
            >
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.thumbnail}
              />
              <View style={styles.playButtonOverlay}>
                <Text style={styles.playButtonText}>▶</Text>
              </View>
            </Pressable>
          )}

          {(!hasPlayed[item.id] ||
            (!isPlaying && headlineVisible[item.id])) && (
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.headlineContainer}
            >
              <Text style={styles.headline} numberOfLines={2}>
                {item.headline}
              </Text>
            </LinearGradient>
          )}
        </View>
      );
    },
    [
      styles.cardWrapper,
      styles.headline,
      styles.headlineContainer,
      styles.playButtonText,
      styles.thumbnailWrapper,
      styles.unavailable,
      styles.thumbnail,
      styles.video,
      styles.playButtonOverlay,
      playingId,
      paused,
      handlePlay,

      headlineVisible,
      hasPlayed,
    ],
  );

  if (!highlights || highlights.length === 0) return null;

  return (
    <View>
      <HeadingTwo isDark={isDark}>Highlights</HeadingTwo>
      <View style={styles.wrapper}>
        <FlatList
          ref={listRef}
          data={highlights}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width * 0.8 + 15}
          decelerationRate="fast"
          contentContainerStyle={styles.listContainer}
          extraData={[playingId, paused]}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </View>
    </View>
  );
};

const highlightStyles = (isDark: boolean) =>
  StyleSheet.create({
    listContainer: {
      paddingLeft: 12,
    },
    unavailable: { color: Colors.white, padding: 10 },
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
    },
    cardWrapper: {
      width: width * 0.8,
      height: CARD_HEIGHT,
      marginRight: 15,
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: Colors.black,
      justifyContent: "flex-end",
    },
    video: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: Colors.black,
    },
    headlineContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 8,
      justifyContent: "flex-end",
    },
    headline: {
      color: Colors.white,
      fontFamily: Fonts.OSBOLD,
      fontSize: 16,
    },
    empty: {
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    playButtonOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.3)",
    },
    playButtonText: {
      fontSize: 50,
      color: Colors.white,
      fontWeight: "bold",
    },
    thumbnailWrapper: {
      width: "100%",
      height: "100%",
      position: "relative",
    },
    thumbnail: {
      width: "100%",
      height: "100%",
    },
  });

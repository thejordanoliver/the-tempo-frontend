import HeadingTwo from "components/Headings/HeadingTwo";
import { Fonts } from "constants/fonts";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Highlight } from "types/types";
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

type HighlightVideoProps = {
  highlights: Highlight[];
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
}) => {
  const [isLoaded, setIsLoaded] = useState<Record<string, boolean>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [paused, setPaused] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, Video>>(Object.create(null));
  const [headlineVisible, setHeadlineVisible] = useState<
    Record<string, boolean>
  >({});
  const [hasPlayed, setHasPlayed] = useState<Record<string, boolean>>({});

  const handlePlay = useCallback(
    (id: string) => {
      if (playingId && playingId !== id) {
        videoRefs.current[playingId]?.pauseAsync();
      }

      setPlayingId(id);
      setPaused((prev) => ({ ...prev, [id]: false }));
      setHasPlayed((prev) => ({ ...prev, [id]: true }));
      setIsLoaded((prev) => ({ ...prev, [id]: false }));
    },
    [playingId]
  );

  const handlePlaybackStatusUpdate = useCallback(
    (id: string, status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;

      const isPaused = !status.isPlaying;
      setPaused((prev) => ({ ...prev, [id]: isPaused }));

      if (isPaused) {
        setHeadlineVisible((prev) => ({ ...prev, [id]: true }));
        setTimeout(() => {
          setHeadlineVisible((prev) => ({ ...prev, [id]: false }));
        }, 2500);
      }

      if (status.didJustFinish) {
        const video = videoRefs.current[id];
        video?.pauseAsync();
        video?.setPositionAsync(0);

        setPaused((prev) => ({ ...prev, [id]: true }));
        setPlayingId(null);
        setHeadlineVisible((prev) => ({ ...prev, [id]: false }));
      }
    },
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: Highlight }) => {
      const videoSource = getPlayableUrl(item);

      if (!videoSource) {
        return (
          <View style={[styles.cardWrapper, { justifyContent: "center" }]}>
            <Text style={{ color: "#fff", padding: 10 }}>
              Video unavailable
            </Text>
          </View>
        );
      }

      const isPlaying = playingId === item.id;
      const isPaused = paused[item.id];

      return (
        <View style={styles.cardWrapper}>
          {isPlaying ? (
            <Video
              ref={(ref) => {
                if (ref) videoRefs.current[item.id] = ref;
              }}
              source={{ uri: videoSource }}
              style={styles.video}
              useNativeControls={true}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={!isPaused}
              onLoad={() => {
                setIsLoaded((prev) => ({ ...prev, [item.id]: true }));

                // ---> FIX: Only present fullscreen AFTER loaded
                requestAnimationFrame(() => {
                  const vid = videoRefs.current[item.id];
                  if (vid) {
                    try {
                      vid.presentFullscreenPlayer();
                    } catch (e) {
                      console.log("Fullscreen failed:", e);
                    }
                  }
                });
              }}
              onPlaybackStatusUpdate={(status) =>
                handlePlaybackStatusUpdate(item.id, status)
              }
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
      playingId,
      paused,
      handlePlay,
      handlePlaybackStatusUpdate,
      headlineVisible,
      hasPlayed,
    ]
  );

  return (
    <View style={{ marginTop: 20 }}>
      <HeadingTwo>Highlights</HeadingTwo>

      {!highlights || highlights.length === 0 ? (
        <Text style={styles.noHighlights}>No highlights available.</Text>
      ) : (
        <FlatList
          data={highlights}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width * 0.8 + 15}
          decelerationRate="fast"
          contentContainerStyle={styles.listContainer}
          extraData={[playingId, paused]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 10,
    paddingLeft: 12,
  },
  cardWrapper: {
    width: width * 0.8,
    height: CARD_HEIGHT,
    marginRight: 15,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#000",
    justifyContent: "flex-end",
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
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
    color: "#fff",
    fontFamily: Fonts.OSBOLD,
    fontSize: 16,
  },
  noHighlights: {
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  playButtonText: {
    fontSize: 50,
    color: "#fff",
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

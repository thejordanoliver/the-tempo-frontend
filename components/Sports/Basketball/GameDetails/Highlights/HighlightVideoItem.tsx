import { Ionicons } from "@expo/vector-icons";
import AppVideo from "components/AppVideo";
import { Colors } from "constants/styles";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback } from "react";
import type { ImageStyle, TextStyle, ViewStyle } from "react-native";
import { Pressable, Text, View } from "react-native";
import type { Highlight } from "types/types";

export interface HighlightVideoItemStyles {
  cardWrapper: ViewStyle;
  video: ViewStyle;
  thumbnailWrapper: ViewStyle;
  thumbnail: ImageStyle;
  playButtonOverlay: ViewStyle;
  headlineContainer: ViewStyle;
  headline: TextStyle;
  unavailable: TextStyle;
}

interface HighlightVideoItemProps {
  item: Highlight;
  isPlaying: boolean;
  onPlay: (id: string) => void;
  onEnd: (id: string) => void;
  styles: HighlightVideoItemStyles;
}

const getPlayableUrl = (item: Highlight): string | null =>
  item.links?.source?.HLS?.href ||
  item.links?.hls ||
  item.links?.source?.href ||
  item.links?.mp4 ||
  item.links?.mobile ||
  null;

export const HighlightVideoItem = React.memo(function HighlightVideoItem({
  item,
  isPlaying,
  onPlay,
  onEnd,
  styles,
}: HighlightVideoItemProps) {
  const videoSource = getPlayableUrl(item);

  const handlePlay = useCallback(() => {
    onPlay(item.id);
  }, [item.id, onPlay]);

  const handleEnd = useCallback(() => {
    onEnd(item.id);
  }, [item.id, onEnd]);

  if (!videoSource) {
    return (
      <View style={styles.cardWrapper}>
        <Text style={styles.unavailable}>Video unavailable</Text>
      </View>
    );
  }

  return (
    <View style={styles.cardWrapper}>
      {isPlaying ? (
        <AppVideo
          uri={videoSource}
          style={styles.video}
          contentFit="contain"
          autoPlay
          nativeControls
          onEnd={handleEnd}
        />
      ) : (
        <Pressable
          accessibilityHint="Plays this highlight video"
          accessibilityLabel={item.headline || "Game highlight"}
          accessibilityRole="button"
          onPress={handlePlay}
          style={styles.thumbnailWrapper}
        >
          <Image
            accessibilityLabel=""
            contentFit="cover"
            recyclingKey={item.id}
            source={item.thumbnail}
            style={styles.thumbnail}
            transition={150}
          />
          <View pointerEvents="none" style={styles.playButtonOverlay}>
            <Ionicons name="play" size={52} color={Colors.white} />
          </View>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.78)"]}
            pointerEvents="none"
            style={styles.headlineContainer}
          >
            <Text style={styles.headline} numberOfLines={2}>
              {item.headline}
            </Text>
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
});

import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useMemo } from "react";
import {
  Image,
  ImageStyle,
  Pressable,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { Colors } from "constants/Styles";
import { Highlight } from "types/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  isActive: boolean;
  onPlay: (id: string) => void;
  hasPlayed: Record<string, boolean>;
  setHasPlayed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  styles: HighlightVideoItemStyles;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getPlayableUrl = (item: Highlight): string | null =>
  item?.links?.source?.HLS?.href ||
  item?.links?.hls ||
  item?.links?.source?.href ||
  item?.links?.mp4 ||
  item?.links?.mobile ||
  null;

const FULLSCREEN_OPTIONS = { enable: true };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const HighlightVideoItem = React.memo(({
  item,
  isActive,
  onPlay,
  hasPlayed,
  setHasPlayed,
  styles,
}: HighlightVideoItemProps) => {
  const videoSource = useMemo(() => getPlayableUrl(item), [item]);

  // Hooks before early return — Rules of Hooks compliant
  const player = useVideoPlayer(videoSource ?? "", (p) => {
    p.loop = false;
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // Pause when scrolled off screen; never auto-play
  React.useEffect(() => {
    if (!videoSource) return;
    if (!isActive) player.pause();
  }, [isActive, player, videoSource]);

  const handlePress = useCallback(() => {
    onPlay(item.id);
    setHasPlayed((prev) => ({ ...prev, [item.id]: true }));
    player.replay();
    player.play();
  }, [item.id, onPlay, player, setHasPlayed]);

  if (!videoSource) {
    return (
      <View style={styles.cardWrapper}>
        <Text style={styles.unavailable}>Video unavailable</Text>
      </View>
    );
  }

  return (
    <View style={styles.cardWrapper}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        nativeControls
        fullscreenOptions={FULLSCREEN_OPTIONS}
        allowsPictureInPicture
        startsPictureInPictureAutomatically={false}
      />

      {/* Thumbnail overlay — shown until first play */}
      {!isPlaying && (
        <Pressable style={styles.thumbnailWrapper} onPress={handlePress}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          <View style={styles.playButtonOverlay}>
            <Ionicons name="play" size={60} color={Colors.white} />
          </View>
        </Pressable>
      )}

      {/* Headline — hidden while playing so it doesn't block native controls */}
      {!isPlaying && (
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.headlineContainer}
          pointerEvents="none"
        >
          <Text style={styles.headline} numberOfLines={2}>
            {item.headline}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
});
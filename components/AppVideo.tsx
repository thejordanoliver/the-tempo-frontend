// components/Video/AppVideo.tsx

import { useEvent, useEventListener } from "expo";
import {
  VideoView,
  useVideoPlayer,
  type VideoContentFit,
} from "expo-video";
import { useEffect } from "react";
import type { StyleProp, ViewStyle } from "react-native";

type Props = {
  uri: string;
  style: StyleProp<ViewStyle>;
  contentFit?: VideoContentFit;
  autoPlay?: boolean;
  nativeControls?: boolean;
  fullscreen?: boolean;
  onEnd?: () => void;
  onPlayingChange?: (isPlaying: boolean) => void;
};

export default function AppVideo({
  uri,
  style,
  contentFit = "contain",
  autoPlay = false,
  nativeControls = true,
  fullscreen = true,
  onEnd,
  onPlayingChange,
}: Props) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;

    if (autoPlay) {
      player.play();
    }
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  useEffect(() => {
    if (autoPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [autoPlay, player]);

  useEventListener(player, "playToEnd", () => {
    player.pause();
    player.currentTime = 0;
    onEnd?.();
  });

  return (
    <VideoView
      player={player}
      style={style}
      contentFit={contentFit}
      nativeControls={nativeControls}
      fullscreenOptions={{ enable: fullscreen }}
    />
  );
}
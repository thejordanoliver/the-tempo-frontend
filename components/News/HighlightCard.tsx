import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { highlightCardStyles } from "styles/NewsStyles/HighlightCardStyles";

type HighlightCardProps = {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  channelName?: string;
  thumbnailHeight?: number;
  duration?: string;
};

export function formatDuration(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0)
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function HighlightCard({
  videoId,
  title,
  thumbnail,
  channelName,
  thumbnailHeight = 300,
  duration,
}: HighlightCardProps) {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = highlightCardStyles(isDark, thumbnailHeight);

  const handlePress = () => {
    router.push({
      pathname: "/highlights/video",
      params: { videoId, title },
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.card}>
        <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
        {duration && (
          <BlurView
            intensity={100}
            tint={"systemUltraThinMaterial"}
            style={styles.timeContainer}
          >
            <Text style={styles.time}>{formatDuration(Number(duration))}</Text>
          </BlurView>
        )}
        <View style={styles.details}>
          <Text numberOfLines={2} style={styles.title}>
            {title}
          </Text>
          <View style={styles.subtitle}>
            <Text style={styles.date}>{channelName}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

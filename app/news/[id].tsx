import { Ionicons } from "@expo/vector-icons";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import NewsArticleSkeleton from "components/Skeletons/NewsArticleSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useArticle } from "hooks/NewsHooks/useArticle";
import { useLayoutEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getStyles } from "styles/NewsStyles/NewsArticleStyle";

export default function ArticleScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getStyles(isDark);
  const global = globalStyles(isDark);
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const newsId = Array.isArray(id) ? id[0] : id;
  const { article, loading, error } = useArticle(newsId);

  const headline = article?.headline;
  const source = article?.byline || article?.source;

  const thumbnail = article?.images?.[0];
  const firstVideo = article?.videos?.[0];

  const videoThumbnail = firstVideo?.thumbnail || thumbnail?.url || null;
  const videoUrl = firstVideo?.url;
  const hasVideo = typeof videoUrl === "string" && videoUrl.length > 0;
  const isMedia = article?.type === "Media" || article?.type === "Preview";
  const story = article?.story;
  const description = article?.description;
  const duration = firstVideo?.duration ?? 0;
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const formattedSeconds = String(seconds).padStart(2, "0");
  const videoTime = firstVideo ? `${minutes}:${formattedSeconds}` : "";

  const publishedDate = article?.published ? new Date(article.published) : null;
  const timeAgo = publishedDate
    ? formatDistanceToNow(publishedDate, { addSuffix: true })
    : "";
  const formattedDate = publishedDate
    ? publishedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const handlePlay = async () => {
    setHasPlayed(true);
    setIsPlaying(true);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle title="" onBack={() => navigation.goBack?.()} />
      ),
    });
  }, [navigation]);

  if (loading) return <NewsArticleSkeleton />;

  if (error)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Failed to load article</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{headline}</Text>

    {hasVideo && videoUrl ? (
  <View style={styles.image}>
    {hasPlayed ? (
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.image}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={isPlaying}
        useNativeControls
        onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;
          setIsPlaying(status.isPlaying);

          if (status.didJustFinish) {
            videoRef.current?.pauseAsync();
            videoRef.current?.setPositionAsync(0);
            setIsPlaying(false);
            setHasPlayed(false);
          }
        }}
      />
    ) : videoThumbnail ? (
      <Pressable style={styles.image} onPress={handlePlay}>
        <Image source={{ uri: videoThumbnail }} style={styles.image} />
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <Ionicons name="play-circle" size={64} color="white" />
        </View>
      </Pressable>
    ) : null}
  </View>
) : thumbnail?.url ? (
  <Image style={styles.image} source={{ uri: thumbnail.url }} />
) : null}

      <View style={styles.descriptionContainer}>
        {videoTime && isMedia && (
          <View style={styles.timeContainer}>
            <Ionicons
              name="time-outline"
              size={20}
              color={isDark ? Colors.white : Colors.black}
            />
            <Text style={styles.description}>{videoTime}</Text>
          </View>
        )}
        {description && <Text style={styles.description}>{description}</Text>}
        {source && <Text style={styles.source}>{source}</Text>}
        <View style={styles.publishContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.date}>{timeAgo}</Text>
        </View>
      </View>

      {story && <Text style={styles.content}>{story}</Text>}
    </ScrollView>
  );
}

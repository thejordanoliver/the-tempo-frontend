import AppVideo from "@/components/AppVideo";
import { CustomHeader } from "@/components/CustomHeader";
import { Ionicons } from "@expo/vector-icons";
import NewsArticleSkeleton from "components/Skeletons/NewsArticleSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useLocalSearchParams, useNavigation } from "expo-router";
import type { ArticleStoryLinkTarget } from "hooks/NewsHooks/useArticle";
import { useArticle } from "hooks/NewsHooks/useArticle";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useLayoutEffect, useMemo, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { newsArticleStyles } from "styles/NewsStyles/NewsArticleStyle";
import { getNewsGameTarget, getNewsPlayerTarget } from "utils/newsArticleLinks";

export default function ArticleScreen() {
  const navigationContentStyle = useNavigationBarContentStyle();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const { width } = useWindowDimensions();
  const styles = newsArticleStyles(isDark, width);
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useScopedRouter();
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
  const storyParagraphs = article?.storyParagraphs;
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

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const handlePlay = async () => {
    setHasPlayed(true);
    setIsPlaying(true);
  };

  const handleOpenLink = async (link: string | null | undefined) => {
    if (!link) return;

    const gameTarget = getNewsGameTarget(link);
    if (gameTarget) {
      const params = { game: gameTarget.gameId, league: gameTarget.league };
      if (gameTarget.screen === "football") {
        router.push({ pathname: "/game/football/[game]", params });
      } else {
        router.push({ pathname: "/game/basketball/[game]", params });
      }
      return;
    }

    const playerTarget = getNewsPlayerTarget(link);

    if (playerTarget) {
      const params = {
        id: playerTarget.playerId,
        league: playerTarget.league,
      };

      switch (playerTarget.screen) {
        case "baseball":
          router.push({ pathname: "/player/baseball/[id]", params });
          return;
        case "basketball":
          router.push({ pathname: "/player/basketball/[id]", params });
          return;
        case "football":
          router.push({ pathname: "/player/football/[id]", params });
          return;
        case "hockey":
          router.push({ pathname: "/player/hockey/[id]", params });
          return;
        case "mma":
          router.push({ pathname: "/player/mma/[id]", params });
          return;
        case "soccer":
          router.push({ pathname: "/player/soccer/[id]", params });
          return;
      }
    }

    try {
      await Linking.openURL(link);
    } catch {
      // Keep the article readable if the device cannot open the source URL.
    }
  };

  const handleOpenTarget = (target: ArticleStoryLinkTarget) => {
    if (target.kind === "article") {
      router.push({
        pathname: "/news/[id]",
        params: { id: target.id },
      });
      return;
    }

    const params = { teamId: target.id };

    switch (target.league) {
      case "nba":
        router.push({ pathname: "/team/[teamId]", params });
        return;
      case "gleague":
        router.push({ pathname: "/team/gleague/[teamId]", params });
        return;
      case "wnba":
        router.push({ pathname: "/team/wnba/[teamId]", params });
        return;
      case "nfl":
        router.push({ pathname: "/team/nfl/[teamId]", params });
        return;
      case "ufl":
        router.push({ pathname: "/team/ufl/[teamId]", params });
        return;
      case "cfb":
        router.push({ pathname: "/team/cfb/[teamId]", params });
        return;
      case "mcbb":
        router.push({ pathname: "/team/mcbb/[teamId]", params });
        return;
      case "wcbb":
        router.push({ pathname: "/team/wcbb/[teamId]", params });
        return;
      case "mlb":
        router.push({ pathname: "/team/mlb/[teamId]", params });
        return;
      case "cb":
        router.push({ pathname: "/team/cb/[teamId]", params });
        return;
      case "sb":
        router.push({ pathname: "/team/sb/[teamId]", params });
        return;
      case "nhl":
        router.push({ pathname: "/team/nhl/[teamId]", params });
        return;
      default:
        router.push({
          pathname: "/team/soccer/[teamId]",
          params: { ...params, league: target.league },
        });
        return;
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader title="" onBack={() => navigation.goBack?.()} />
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

  if (!article)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>Article unavailable</Text>
      </View>
    );

  return (
    <ScrollView
      contentContainerStyle={navigationContentStyle(styles.container)}
    >
      <Text style={styles.title}>{headline}</Text>

      {hasVideo && videoUrl ? (
        <View style={styles.image}>
          {hasPlayed ? (
            <AppVideo
              uri={videoUrl}
              style={styles.image}
              contentFit="contain"
              autoPlay={isPlaying}
              nativeControls
              onPlayingChange={setIsPlaying}
              onEnd={() => {
                setIsPlaying(false);
                setHasPlayed(false);
              }}
            />
          ) : videoThumbnail ? (
            <Pressable style={styles.image} onPress={handlePlay}>
              <Image source={{ uri: videoThumbnail }} style={styles.image} />
              <View
                style={{
                  ...StyleSheet.absoluteFill,
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

      {storyParagraphs?.length ? (
        <View style={styles.contentContainer}>
          {storyParagraphs.map((paragraph, paragraphIndex) => (
            <Text key={paragraphIndex} style={styles.content}>
              {paragraph.segments.map((segment, segmentIndex) =>
                segment.link || segment.target ? (
                  <Text
                    key={segmentIndex}
                    accessibilityRole="link"
                    onPress={() => {
                      if (segment.target) {
                        handleOpenTarget(segment.target);
                        return;
                      }
                      void handleOpenLink(segment.link);
                    }}
                    style={styles.inlineLink}
                  >
                    {segment.text}
                  </Text>
                ) : (
                  segment.text
                ),
              )}
            </Text>
          ))}
        </View>
      ) : (
        story && <Text style={styles.content}>{story}</Text>
      )}
    </ScrollView>
  );
}

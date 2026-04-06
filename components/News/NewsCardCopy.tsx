import { formatDistanceToNowStrict } from "date-fns";
import { useRouter } from "expo-router";
import { NewsArticle } from "hooks/NewsHooks/useLeaguesNews";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { newsCardStyles } from "styles/NewsStyles/NewsCardStyles";

type NewsCardProps = {
  content: NewsArticle;
  isDark: boolean;
};

export default function NewsCardCopy({ content, isDark }: NewsCardProps) {
  const router = useRouter();
  const styles = newsCardStyles(isDark);
  const [imageError, setImageError] = useState(false);
  const formattedDate = new Date(content.published).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
  const newsId = content.id;
  const thumbnail = content.image;
  const title = content.headline;
  const published = formattedDate;
  const source = content.byline;
  const timeAgo = formatDistanceToNowStrict(new Date(content.published), {
    addSuffix: true,
  });

    const handlePress = () => {
    router.push({
      pathname: "/news/[id]",
      params: { id: newsId },
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.card}>
        <Image
          source={imageError || !thumbnail ? { uri: "" } : { uri: thumbnail }}
          onError={() => setImageError(true)}
          style={styles.thumbnail}
        />
        <View style={styles.details}>
          <Text numberOfLines={2} style={styles.title}>
            {title}
          </Text>
          {source && <Text style={styles.source}>{source}</Text>}
          <View style={styles.timeContainer}>
            <Text style={styles.source}>{published}</Text>
            <Text style={styles.source}>{timeAgo}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

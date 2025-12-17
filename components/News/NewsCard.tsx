import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
// ✅ Import fallback image
import { newsCardStyles } from "styles/NewsCardStyles";
import FallbackImage from "../../assets/Logos/ThumbnailFallback.png";

type NewsCardProps = {
  id: string;
  title: string;
  source: string | { id?: string; name?: string };

  url: string;
  thumbnail?: string;
  publishedAt?: string;
  date?: string;
};

export default function NewsCard({
  title,
  source,
  url,
  thumbnail,
}: NewsCardProps) {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const styles = newsCardStyles(isDark);

  const [imageError, setImageError] = useState(false);
  const displaySource =
    typeof source === "string" ? source : source?.name ?? "Unknown Source";

  const handlePress = () => {
    router.push({
      pathname: "/news/article",
      params: { url, title, thumbnail },
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.card}>
        <Image
          source={imageError || !thumbnail ? FallbackImage : { uri: thumbnail }}
          onError={() => setImageError(true)}
          style={styles.thumbnail}
        />
        <View style={styles.details}>
          <Text numberOfLines={2} style={styles.title}>
            {title}
          </Text>
          <Text style={styles.source}>{displaySource}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

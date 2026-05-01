import { Ionicons } from "@expo/vector-icons";
import VerfiedIcon from "assets/Placeholders/XVerifiedIcon.webp";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

export const XCARD_WIDTH = 240;
export const XCARD_HEIGHT = 280;

export type XCardProps = {
  id: string;
  text: string;
  created_at: string;
  author: {
    name: string;
    id: string;
    verified: boolean;
    profile_image_url: string;
    username: string;
    public_metrics?: {
      followers_count?: number;
      following_count?: number;
      tweet_count?: number;
      listed_count?: number;
      like_count?: number;
      media_count?: number;
    };
  };
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    bookmark_count: number;
    impression_count: number;
  };
  media?: {
    media_key: string;
    type: string;
    url?: string | null;
    preview_image_url?: string | null;
    display_url?: string | null;
    width?: number | null;
    height?: number | null;
    view_count?: number | null;
  }[];
  edit_history_tweet_ids?: string[];
  lang?: string;
  author_id?: string;
  _isOfficial?: boolean;
  _isBreaking?: boolean;
  _author?: string;
};
function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function XCard(content: XCardProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = xCardStyles(isDark);
  const isVerified = content.author.verified === true;
  const firstMedia = content.media?.[0];
  const mediaImage =
    firstMedia?.preview_image_url ?? firstMedia?.display_url ?? null;
  const hasMedia = !!mediaImage;

  const formattedDate = new Date(content.created_at).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric" },
  );

  return (
    <View style={styles.container}>
      {/* Top: media thumbnail — full bleed */}
      {hasMedia && (
        <Image
          key={firstMedia?.media_key}
          source={{ uri: mediaImage }}
          style={styles.thumbnail}
          contentFit="cover"
        />
      )}

      {/* Body */}
      <View style={styles.body}>
        {/* Author row */}
        <View style={styles.authorRow}>
          <Image
            source={{ uri: content.author.profile_image_url }}
            style={styles.avatar}
          />
          <View style={styles.authorInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {content.author.name}
              </Text>
              {isVerified && (
                <Image source={VerfiedIcon} style={styles.verifiedIcon} />
              )}
            </View>
            <Text style={styles.username} numberOfLines={1}>
              @{content.author.username}
            </Text>
          </View>
        </View>

        {/* Tweet text */}
        <Text
          style={styles.text}
          numberOfLines={hasMedia ? 3 : 6}
          ellipsizeMode="tail"
        >
          {content.text}
        </Text>

        {/* Footer metrics */}
        <View style={styles.footer}>
          {content.public_metrics && (
            <>
              <View style={styles.metricContainer}>
                <Ionicons name="heart-outline" style={styles.metric} />
                <Text style={styles.metric}>
                  {formatCount(content.public_metrics.like_count)}
                </Text>
              </View>
              <View style={styles.metricContainer}>
                <Ionicons name="repeat-outline" style={styles.metric} />
                <Text style={styles.metric}>
                  {formatCount(content.public_metrics.retweet_count)}
                </Text>
              </View>
            </>
          )}
          <Text style={[styles.metric, styles.metricRight]}>
            {formattedDate}
          </Text>
        </View>
      </View>
    </View>
  );
}

export const xCardStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: XCARD_WIDTH,
      height: XCARD_HEIGHT,
      borderWidth: 0.5,
      borderRadius: 12,
      borderColor: Colors.midTone,
      backgroundColor: isDark ? Colors.black : Colors.white,
      overflow: "hidden",
      flexDirection: "column",
    },
    thumbnail: {
      width: "100%",
      height: 120,
      flexShrink: 0,
    },
    body: {
      flex: 1,
      padding: 12,
      gap: 10,
      flexDirection: "column",
    },
    authorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    authorInfo: {
      flex: 1,
      gap: 1,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    metricContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    name: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSBOLD,
      fontSize: 13,
      flexShrink: 1,
    },
    username: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 11,
    },
    verifiedIcon: {
      width: 13,
      height: 13,
    },
    text: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      lineHeight: 18,
      color: isDark ? Colors.white : Colors.black,
      flex: 1,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingTop: 8,
      borderTopWidth: 0.5,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    metric: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 11,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    metricRight: {
      marginLeft: "auto",
    },
  });

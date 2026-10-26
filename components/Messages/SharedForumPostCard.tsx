import {
  activeOpacity,
  Colors,
  Fonts,
  globalStyles,
  PLACEHOLDER_AVATAR,
} from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { useSharedForumPostPreview } from "hooks/ForumHooks/useSharedForumPostPreview";
import { useScopedRouter } from "hooks/useScopedRouter";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  postId: string;
  messageText: string;
  onLongPress: () => void;
};

export default function SharedForumPostCard({
  postId,
  messageText,
  onLongPress,
}: Props) {
  const router = useScopedRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const typography = globalStyles(isDark);
  const preview = useSharedForumPostPreview(postId, messageText);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={
        preview.username
          ? `Open shared forum post by @${preview.username}`
          : "Open shared forum post"
      }
      onPress={() =>
        router.push({ pathname: "/post/[postId]", params: { postId } })
      }
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: isDark
            ? Colors.dark.itemBackground
            : Colors.light.background,
          borderColor: isDark ? Colors.darkGray : Colors.lightGray,
        },
        pressed && { opacity: activeOpacity },
      ]}
    >
      <View style={styles.author}>
        <Image
          source={{ uri: preview.profileImage || PLACEHOLDER_AVATAR }}
          placeholder={{ uri: PLACEHOLDER_AVATAR }}
          style={styles.avatar}
          contentFit="cover"
          recyclingKey={`${postId}-${preview.profileImage}`}
          accessibilityLabel={
            preview.username
              ? `@${preview.username}'s profile picture`
              : "Post author's profile picture"
          }
        />
        <View style={styles.authorInfo}>
          <Text
            style={[typography.textMedium, styles.username]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {preview.username ? `@${preview.username}` : "Shared post"}
          </Text>
        </View>
      </View>
      {!!preview.text && (
        <Text
          style={[typography.text, styles.text]}
          numberOfLines={4}
          ellipsizeMode="tail"
        >
          {preview.text}
        </Text>
      )}
      {preview.image && (
        <Image
          source={{ uri: preview.image }}
          style={styles.image}
          contentFit="cover"
          recyclingKey={`${postId}-${preview.image}`}
          accessibilityLabel="Shared post image"
        />
      )}
      <Text style={[typography.caption, styles.link]}>View full post</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    maxWidth: "100%",
    alignSelf: "stretch",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  author: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  avatar: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: 18,
    backgroundColor: Colors.transparentMidTone,
  },
  authorInfo: {
    flex: 1,
    minWidth: 0,
  },
  username: {
    fontFamily: Fonts.SEMIBOLD,
    fontSize: 14,
    lineHeight: 19,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  image: {
    width: "100%",
    aspectRatio: 1.6,
    borderRadius: 8,
    backgroundColor: Colors.transparentMidTone,
  },
  link: {
    fontFamily: Fonts.MEDIUM,
  },
});

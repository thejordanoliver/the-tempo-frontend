// components/Forum/PostContent.tsx
import { activeOpacity, Colors } from "constants/styles";
import { useScopedRouter } from "hooks/useScopedRouter";
import { memo, useMemo } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { PostItemStyles } from "styles/ForumStyles/PostItemStyles";
import type { ForumDisplayMediaItem, ForumPost } from "types/forum";
import PollBlock from "../PollBlock";
import PostImages from "../PostImages";

type PostContentProps = {
  item: ForumPost;
  isDark: boolean;
  currentUserId: number | null;

  isEditing: boolean;
  editText: string;
  onChangeEditText: (text: string) => void;
  showFullText?: boolean;
};

export const PostContent = memo(function PostContent({
  item,
  isDark,
  currentUserId,
  isEditing,
  editText,
  onChangeEditText,
  showFullText = false,
}: PostContentProps) {
  const styles = PostItemStyles(isDark);
  const router = useScopedRouter();
  const previewText = item.text.slice(0, 280).split("\n").slice(0, 4).join("\n");
  const isTruncated = !showFullText && previewText.length < item.text.length;

  /* -------------------------------------------------------------------------- */
  /*                                   Media                                    */
  /* -------------------------------------------------------------------------- */

  const media = useMemo<ForumDisplayMediaItem[]>(
    () => [
      ...(item.images ?? []).map((uri, index) => ({
        id: `img-${item.id}-${index}`,
        type: "image" as const,
        uri,
      })),

      ...(item.videos ?? []).map((uri, index) => ({
        id: `vid-${item.id}-${index}`,
        type: "video" as const,
        uri,
        thumbnailUri: item.video_thumbnails?.[index] ?? undefined,
      })),
    ],
    [item.id, item.images, item.videos, item.video_thumbnails],
  );

  /* -------------------------------------------------------------------------- */
  /*                                   Editing                                  */
  /* -------------------------------------------------------------------------- */

  if (isEditing) {
    return (
      <TextInput
        style={styles.editPostText}
        multiline
        value={editText}
        onChangeText={onChangeEditText}
        placeholder="Edit your post..."
        placeholderTextColor={isDark ? Colors.lightGray : Colors.darkGray}
        textAlignVertical="top"
      />
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Display                                  */
  /* -------------------------------------------------------------------------- */

  return (
    <View style={styles.postTextWrapper}>
      {!!item.text && (
        <Text style={styles.postText}>
          {isTruncated ? `${previewText.trimEnd()}…` : item.text}
        </Text>
      )}

      {isTruncated && (
        <TouchableOpacity
          style={styles.readMoreButton}
          activeOpacity={activeOpacity}
          accessibilityRole="button"
          accessibilityLabel="Read full post and comments"
          onPress={() =>
            router.push({
              pathname: "/post/[postId]",
              params: { postId: item.id },
            })
          }
        >
          <Text style={styles.readMoreText}>Read more</Text>
        </TouchableOpacity>
      )}

      {media.length > 0 && (
        <PostImages media={media} item={item} currentUserId={currentUserId} />
      )}

      <PollBlock postId={item.id} isDark={isDark} />
    </View>
  );
});

// components/Forum/PostContent.tsx
import { Colors } from "constants/styles";
import { memo, useMemo } from "react";
import { Text, TextInput, View } from "react-native";
import { postItemStyles } from "styles/ForumStyles/PostItemStyles";
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
};

export const PostContent = memo(function PostContent({
  item,
  isDark,
  currentUserId,
  isEditing,
  editText,
  onChangeEditText,
}: PostContentProps) {
  const styles = postItemStyles(isDark);

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
      {!!item.text && <Text style={styles.postText}>{item.text}</Text>}

      {media.length > 0 && (
        <PostImages media={media} item={item} currentUserId={currentUserId} />
      )}

      <PollBlock postId={item.id} isDark={isDark} />
    </View>
  );
});

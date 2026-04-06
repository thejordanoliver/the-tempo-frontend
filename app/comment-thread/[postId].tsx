//comment-thread/[postId].tsx

import { Ionicons } from "@expo/vector-icons";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import AlertModal from "components/Forum/AlertModal";
import { CommentItem } from "components/Forum/CommentItem";
import { Post, PostItem } from "components/Forum/PostItem";
import { Colors, globalStyles } from "constants/styles";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useCommentThread } from "hooks/ForumHooks/useCommentThread";
import { useLayoutEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { commentThreadStyles } from "styles/ForumStyles/CommentThreadStyles";

interface Comment {
  id: string;
  text: string;
  user_id: number;
  username: string;
  created_at: string;
  profile_image: string;
}

function mapCommentToPost(comment: Comment): Post {
  return {
    id: comment.id,
    text: comment.text,
    user_id: comment.user_id,
    username: comment.username,
    created_at: comment.created_at,
    full_name: null,
    profile_image: comment.profile_image,
    likes: 0,
    comments_count: 0,
    liked_by_current_user: false,
    images: [],
  };
}

export default function CommentThreadScreen() {
  const params = useLocalSearchParams();
  const postId = typeof params.postId === "string" ? params.postId : null;
  const isDark = useColorScheme() === "dark";
  const styles = commentThreadStyles(isDark);
  const global = globalStyles(isDark);
  const navigation = useNavigation();
  const [newComment, setNewComment] = useState("");
  const [inputHeight, setInputHeight] = useState(40); // default height

  const closeAlert = () => {
    setAlertConfig(null);
  };

  const {
    BASE_URL,
    currentUserId,
    post,
    comments,
    loading,
    submitting,
    alertConfig,
    setAlertConfig,
    postComment,
    editComment,
    deleteComment,
    deletePost,
  } = useCommentThread(postId);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeaderTitle title="Comments" onBack={goBack} />,
    });
  }, [navigation]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    await postComment(newComment);
    setNewComment("");
  };

  if (!postId) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Invalid post ID</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator isDark={isDark} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0} // adjust for header height
    >
      <FlatList
        data={comments.map(mapCommentToPost)}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <CommentItem
            comment={item}
            postId={item.id} // ✅ REQUIRED
            isDark={isDark}
            BASE_URL={BASE_URL}
            currentUserId={currentUserId ?? ""}
            editComment={editComment}
            deleteComment={deleteComment}
            isLast={index === comments.length - 1}
          />
        )}
        ListHeaderComponent={
          post ? (
            <PostItem
              item={post}
              isDark={isDark}
              currentUserId={currentUserId}
              deletePost={deletePost}
              editPost={() => {}}
              BASE_URL={BASE_URL}
              onImagePress={() => {}}
            />
          ) : null
        }
        keyboardShouldPersistTaps="handled"
      />

      {/* Input bar positioned at bottom */}
      <BlurView
        intensity={100}
        tint={"systemMaterial"}
        style={styles.blurviewContainer}
      >
        <TextInput
          placeholder="Write a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          onContentSizeChange={(event) => {
            setInputHeight(event.nativeEvent.contentSize.height);
          }}
          style={styles.textInputContainer}
          placeholderTextColor={Colors.midTone}
        />

        <TouchableOpacity
          onPress={handlePostComment}
          disabled={submitting}
          style={styles.sendButton}
        >
          <Ionicons
            name="send"
            color={isDark ? Colors.black : Colors.white}
            size={22}
          />
        </TouchableOpacity>
      </BlurView>

      <AlertModal
        visible={!!alertConfig}
        isDark={isDark}
        title={alertConfig?.title}
        message={alertConfig?.message}
        confirmText={alertConfig?.confirmText ?? "OK"}
        cancelText={alertConfig?.cancelText}
        onCancel={closeAlert}
        onConfirm={() => {
          alertConfig?.onConfirm?.();
          if (!alertConfig?.onConfirm) closeAlert();
        }}
      />
    </KeyboardAvoidingView>
  );
}

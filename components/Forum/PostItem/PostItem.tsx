// components/Forum/PostItem.tsx
import ConfirmModal from "components/ConfirmModal";
import { memo, useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { postItemStyles } from "styles/ForumStyles/PostItemStyles";
import type { ForumPostItemProps } from "types/forum";
import { Interactions } from "./Interactions";
import { PostContent } from "./PostContent";
import { UserHeader } from "./UserHeader";

export const PostItem = memo(function PostItem({
  item,
  isDark,
  currentUserId,
  deletePost,
  editPost,
  onBookmarkChange,
  disableCommentNavigation,
}: ForumPostItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const styles = postItemStyles(isDark);

  /* -------------------------------------------------------------------------- */
  /*                                  Effects                                   */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    setEditText(item.text);
  }, [item.text]);

  /* -------------------------------------------------------------------------- */
  /*                                    Edit                                    */
  /* -------------------------------------------------------------------------- */

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const onSaveEdit = () => {
    const nextText = editText.trim();

    if (nextText && nextText !== item.text) {
      editPost(item.id, nextText);
    }

    setIsEditing(false);
  };

  const onCancelEdit = () => {
    setEditText(item.text);
    setIsEditing(false);
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Delete                                   */
  /* -------------------------------------------------------------------------- */

  const handleDeleteRequest = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    deletePost(item.id);
    setShowDeleteModal(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <View style={styles.container}>
      <View style={styles.postContainer}>
        {/* User Header */}
        <UserHeader
          item={item}
          isDark={isDark}
          currentUserId={currentUserId}
          onEdit={handleStartEdit}
          onDelete={handleDeleteRequest}
        />

        {/* Post Body */}
        <PostContent
          item={item}
          isDark={isDark}
          currentUserId={currentUserId}
          isEditing={isEditing}
          editText={editText}
          onChangeEditText={setEditText}
        />

        {/* Footer */}
        <View style={styles.postFooter}>
          {isEditing && (
            <View style={styles.editActionsContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={onSaveEdit}
              >
                <Text style={styles.saveText}>
                  Save
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={onCancelEdit}
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Interactions
            item={item}
            isDark={isDark}
            currentUserId={currentUserId}
            onBookmarkChange={onBookmarkChange}
            disableCommentNavigation={
              disableCommentNavigation
            }
          />
        </View>
      </View>

      {/* Delete Confirmation */}
      <ConfirmModal
        title="Delete Post"
        message="This action can't be undone. The post and its replies will be permanently deleted."
        visible={showDeleteModal}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </View>
  );
});
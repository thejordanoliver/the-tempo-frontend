import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Colors } from "constants/Colors";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useFollowers } from "hooks/useFollowers";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, useColorScheme, View } from "react-native";
import { useFollowersModalStore } from "store/followersModalStore";
import { followersListModalStyles } from "styles/ModalsStyles/FollowersListModal.styles";
import FollowersList from "./FollowersList";
type Props = {
  visible: boolean;
  onClose: () => void;
  type: "followers" | "following";
  currentUserId: string;
  targetUserId: string; // user whose followers/following we want to show
};

export default function FollowersModal({
  visible,
  onClose,
  type,
  currentUserId,
  targetUserId,
}: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const router = useRouter();

  // State
  const [search, setSearch] = useState("");
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = followersListModalStyles(isDark);
  // Custom hook for followers/following data & toggle
  const {
    users: usersFromHook,
    loading,
    error,
    toggleFollow,
  } = useFollowers(currentUserId, targetUserId, type);

  // Local copy of users for optimistic UI updates
  const [users, setUsers] = useState(usersFromHook);

  // Sync local users state when hook updates
  useEffect(() => {
    setUsers(usersFromHook);
  }, [usersFromHook]);

  // Show or hide bottom sheet based on visible prop
  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
      setSearch(""); // Clear search on close
    }
  }, [visible]);

  // Navigate to user profile, close modal and mark modal restore
  const { markForRestore } = useFollowersModalStore();
  const handleUserPress = (userId: string) => {
    markForRestore();
    onClose();
    router.push(`/user/${userId}`);
  };

  // Optimistic follow toggle handler
  const handleToggleFollow = async (targetId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id.toString() === targetId
          ? { ...user, isFollowing: !user.isFollowing }
          : user
      )
    );
    setLoadingIds((prev) => [...prev, targetId]);
    try {
      await toggleFollow(targetId);
    } catch {
      // Rollback if error
      setUsers((prev) =>
        prev.map((user) =>
          user.id.toString() === targetId
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== targetId));
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      ? users
          .filter((u) =>
            u.username.toLowerCase().includes(search.toLowerCase())
          )
          .map((u) => ({
            ...u,
            id: u.id.toString(), // <-- normalize to string
          }))
      : [];
  }, [users, search]);

  // Snap points for BottomSheet
  const snapPoints = useMemo(() => ["60%", "70%", "80%", "94%"], []);

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={onClose}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      )}
      handleComponent={() => (
        <View style={styles.header}>
          <View style={styles.handleIndicatorStyle}></View>
          <Text
            style={[styles.headerText, { color: isDark ? "#fff" : "#1d1d1d" }]}
          >
            {type === "followers" ? "Followers" : "Following"}
          </Text>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons
              name="close"
              size={28}
              color={isDark ? Colors.white : Colors.black}
            />
          </Pressable>
        </View>
      )}
      backgroundStyle={{ backgroundColor: "transparent" }}
    >
      <BlurView
        intensity={100}
        tint={isDark ? "systemMaterialDark" : "systemMaterialLight"}
        style={styles.blurContainer}
      >
        <View style={styles.modalContainer}>
          <TextInput
            placeholder="Search..."
            placeholderTextColor={isDark ? "#aaa" : "#1d1d1d"}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
          >
            <FollowersList
              users={filteredUsers}
              loadingIds={loadingIds}
              currentUserId={currentUserId}
              onUserPress={handleUserPress}
              onToggleFollow={handleToggleFollow}
            />
          </BottomSheetScrollView>
        </View>
      </BlurView>
    </BottomSheetModal>
  );
}

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import SearchBar from "components/SearchBars/SearchBar";
import { globalStyles } from "constants/Styles";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useFollowers } from "hooks/useFollowers";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Text, useColorScheme, View } from "react-native";
import { followersListModalStyles } from "styles/ModalsStyles/FollowersListModalStyles";
import { snapPoints } from "utils/modalUtils";
import FollowersList from "./FollowersList";
type Props = {
  type: "followers" | "following";
  currentUserId: string;
  targetUserId: string;
  onClose?: () => void;
};

const FollowersModal = forwardRef<BottomSheetModal, Props>(
  ({ type, currentUserId, targetUserId, onClose }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const router = useRouter();
    const isDark = useColorScheme() === "dark";
    const styles = followersListModalStyles(isDark);
    const global = globalStyles(isDark);

    // Forward the ref
    useImperativeHandle(ref, () => sheetRef.current as BottomSheetModal);

    const [search, setSearch] = useState("");
    const [loadingIds, setLoadingIds] = useState<string[]>([]);

    const {
      users: usersFromHook,
      error,
      toggleFollow,
    } = useFollowers(currentUserId, targetUserId, type);
    const [users, setUsers] = useState(usersFromHook);

    // Sync local users state when hook updates
    useEffect(() => {
      setUsers(usersFromHook);
    }, [usersFromHook]);

    const handleUserPress = (userId: string) => {
      onClose?.();
      router.push(`/user/${userId}`);
    };

    const handleToggleFollow = async (targetId: string) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id.toString() === targetId
            ? { ...u, isFollowing: !u.isFollowing }
            : u
        )
      );
      setLoadingIds((prev) => [...prev, targetId]);
      try {
        await toggleFollow(targetId);
      } catch {
        setUsers((prev) =>
          prev.map((u) =>
            u.id.toString() === targetId
              ? { ...u, isFollowing: !u.isFollowing }
              : u
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
            .map((u) => ({ ...u, id: u.id.toString() }))
        : [];
    }, [users, search]);

    return (
      <BottomSheetModal
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        onDismiss={onClose}
        handleComponent={() => (
          <View style={styles.header}>
            <View style={styles.handleIndicatorStyle} />
            <Text style={styles.headerText}>
              {type === "followers" ? "Followers" : "Following"}
            </Text>
          </View>
        )}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}
        handleIndicatorStyle={styles.handleIndicatorStyle}
        backgroundStyle={styles.backgroundStyle}
      >
        <BlurView
          intensity={100}
          tint={isDark ? "systemMaterialDark" : "systemMaterialLight"}
          style={styles.blurViewContainer}
        >
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainerStyle}
          >
            <SearchBar
              placeholder="Search."
              value={search}
              onChangeText={setSearch}
            />

            <FollowersList
              users={filteredUsers}
              loadingIds={loadingIds}
              currentUserId={currentUserId}
              onUserPress={handleUserPress}
              onToggleFollow={handleToggleFollow}
              error={error}
            />
          </BottomSheetScrollView>
        </BlurView>
      </BottomSheetModal>
    );
  }
);

export default FollowersModal;

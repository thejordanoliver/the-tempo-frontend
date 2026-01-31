// profile.tsx
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useFocusEffect } from "@react-navigation/native";
import ConfirmModal from "components/ConfirmModal";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FavoriteTeamsSection from "components/Favorites/FavoriteTeamsSection";
import BioSection from "components/Profile/BioSection";
import FollowersModal from "components/Profile/FollowersModal";
import FollowStats from "components/Profile/FollowStats";
import ProfileBanner from "components/Profile/ProfileBanner";
import ProfileHeader from "components/Profile/ProfileHeader";
import { SkeletonProfileScreen } from "components/Skeletons/SkeletonProfileScreen";
import { teams } from "constants/teams";
import { teams as cbbteams } from "constants/teamsCBB";
import { teams as cfbteams } from "constants/teamsCFB";
import { teams as mlbteams } from "constants/teamsMLB";
import { teams as nflteams } from "constants/teamsNFL";
import { useNavigation, useRouter } from "expo-router";
import { useProfile } from "hooks/useProfile";
import { useAuth } from "hooks/UserHooks/useAuth";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { useFollowersModalStore } from "store/followersModalStore";
import { useSettingsModalStore } from "store/settingsModalStore";
import { profileStyles } from "styles/ProfileScreenStyles";

export default function ProfileScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const numColumns = 3;
  const horizontalPadding = 40;
  const columnGap = 12;
  const totalGap = columnGap * (numColumns - 1);
  const availableWidth = screenWidth - horizontalPadding - totalGap;
  const itemWidth = availableWidth / numColumns;

  const { deleteAccount } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const styles = profileStyles(isDark);

  // Local UI state
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isGridView, setIsGridView] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState("");
  const followersModalRef = useRef<BottomSheetModal>(null);
  // Add local state for modal props
  const [modalType, setModalType] = useState<"followers" | "following">(
    "followers"
  );
  const [modalTargetUserId, setModalTargetUserId] = useState<string>("");

  // Profile hook
  const {
    isLoading,
    currentUserId,
    username,
    fullName,
    bio,
    profileImage,
    bannerImage,
    favorites,
    followersCount,
    followingCount,
    loadProfile,
  } = useProfile();
  const viewedUserId = currentUserId;

  // Followers modal & settings modal stores
  const { type, targetUserId, openModal, shouldRestore, clearRestore } =
    useFollowersModalStore();

  const { showOnReturn, setShowOnReturn, setShowSettingsModal } =
    useSettingsModalStore();

  /** Toggle between grid and list view for favorite teams */
  const toggleFavoriteTeamsView = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsGridView((prev) => !prev);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  /** Delete account handler */
  const confirmDeleteAccount = async () => {
    if (!password.trim()) {
      alert("Please enter your password.");
      return;
    }
    try {
      await deleteAccount(password);
      setShowDeleteModal(false);
      setPassword("");
      router.replace("/settings/deleteaccountsplash");
    } catch {
      alert("Failed to delete account. Check your password and try again.");
    }
  };

  /** Sign out handler */
  const signOut = async () => {
    try {
      await AsyncStorage.clear();
      router.replace("/login");
    } catch (error) {
      console.warn("Failed to sign out:", error);
    } finally {
      setShowSignOutModal(false);
    }
  };

  /** Load profile on focus and handle modal restore / settings */
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const initialize = async () => {
        if (!isActive) return;
        await loadProfile();

        if (shouldRestore && targetUserId) {
          clearRestore();
          openModal(
            type,
            targetUserId,
            currentUserId ? String(currentUserId) : undefined
          );
        }

        if (showOnReturn) {
          setShowSettingsModal(true);
          setShowOnReturn(false);
        }
      };

      initialize();

      return () => {
        isActive = false;
      };
    }, [
      loadProfile,
      shouldRestore,
      targetUserId,
      type,
      currentUserId,
      openModal,
      clearRestore,
      showOnReturn,
      setShowSettingsModal,
      setShowOnReturn,
    ])
  );

  /** Header with logout/settings buttons */
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          title={`@${username}`}
          tabName="Profile"
          onLogout={() => setShowSignOutModal(true)}
          onSettings={() => router.push("/settings")}
        />
      ),
    });
  }, [navigation, username, isDark]);

  /** Map favorites strings to team objects */
  const favoriteTeamsWithLeague = favorites
    .map((fav) => {
      const [league, id] = fav.split(":");
      let team;
      if (league === "NBA") team = teams.find((t) => String(t.id) === id);
      if (league === "NFL") team = nflteams.find((t) => String(t.id) === id);
      if (league === "CFB") team = cfbteams.find((t) => String(t.id) === id);
      if (league === "CBB") team = cbbteams.find((t) => String(t.id) === id);
      if (league === "WCBB") team = cbbteams.find((t) => String(t.wid) === id);
      if (league === "MLB") team = mlbteams.find((t) => String(t.id) === id);
      if (!team) return null;
      return { ...team, league: league as any };
    })
    .filter(Boolean);

  if (isLoading) return <SkeletonProfileScreen isDark={isDark} />;

  // Handlers
  const onFollowersPress = () => {
    if (!currentUserId) return;
    setModalType("followers");
    setModalTargetUserId(String(currentUserId));
    followersModalRef.current?.present();
  };

  const onFollowingPress = () => {
    if (!currentUserId) return;
    setModalType("following");
    setModalTargetUserId(String(currentUserId));
    followersModalRef.current?.present();
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentInsetAdjustmentBehavior="never"
      >
        <ProfileBanner
          bannerImage={bannerImage}
          profileImage={profileImage}
          isDark={isDark}
        />

        <FollowStats
          followersCount={followersCount}
          followingCount={followingCount}
          isDark={isDark}
          currentUserId={currentUserId ? String(currentUserId) : ""}
          targetUserId={currentUserId ? String(currentUserId) : ""}
          onFollowersPress={onFollowersPress}
          onFollowingPress={onFollowingPress}
        />

        <ProfileHeader
          fullName={fullName}
          username={username}
          isDark={isDark}
          isCurrentUser
          onEditPress={() => router.push("/edit-profile")}
        />

        <BioSection bio={bio} isDark={isDark} />

        <View style={styles.favoritesContainer}>
          <FavoriteTeamsSection
            favoriteTeams={favoriteTeamsWithLeague}
            isGridView={isGridView}
            fadeAnim={fadeAnim}
            toggleFavoriteTeamsView={toggleFavoriteTeamsView}
            styles={styles}
            itemWidth={itemWidth}
            isCurrentUser={currentUserId === viewedUserId}
            username={username ?? undefined}
          />
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showSignOutModal}
        title="Confirm Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={signOut}
        onCancel={() => setShowSignOutModal(false)}
      />

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Account"
        message="This action cannot be undone. Are you sure you want to delete your account?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Add Followers Modal */}

      <FollowersModal
        ref={followersModalRef}
        type={modalType}
        currentUserId={currentUserId ? String(currentUserId) : ""}
        targetUserId={modalTargetUserId}
        onClose={() => followersModalRef.current?.dismiss()}
      />
    </>
  );
}

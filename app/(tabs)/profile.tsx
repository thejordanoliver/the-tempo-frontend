// profile.tsx
import { useFocusEffect } from "@react-navigation/native";
import ConfirmModal from "components/ConfirmModal";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FavoriteTeamsSection from "components/Favorites/FavoriteTeamsSection";
import BioSection from "components/Profile/BioSection";
import FollowStats from "components/Profile/FollowStats";
import ProfileBanner from "components/Profile/ProfileBanner";
import ProfileHeader from "components/Profile/ProfileHeader";
import { SkeletonProfileScreen } from "components/Skeletons/SkeletonProfileScreen";
import { teams } from "constants/teams";
import { cbbTeams } from "constants/teamsCBB";
import { cfbTeams } from "constants/teamsCFB";
import { mlbTeams } from "constants/teamsMLB";
import { nflTeams } from "constants/teamsNFL";
import { nhlTeams } from "constants/teamsNHL";
import { wnbaTeams } from "constants/teamsWNBA";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation, useRouter } from "expo-router";
import { useAuth } from "hooks/UserHooks/useAuth";
import { useProfile } from "hooks/UserHooks/useProfile";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Animated, ScrollView, View, useWindowDimensions } from "react-native";
import { useFollowersStore } from "store/followersStore";
import { useSettingsModalStore } from "store/settingsModalStore";
import { profileStyles } from "styles/ProfileStyles/ProfileScreenStyles";

export default function ProfileScreen() {
  const { favorites, loadFavorites, clearFavorites } =
    useFavoriteTeamsContext();
  const { width: screenWidth } = useWindowDimensions();
  const numColumns = 3;
  const horizontalPadding = 40;
  const columnGap = 12;
  const totalGap = columnGap * (numColumns - 1);
  const availableWidth = screenWidth - horizontalPadding - totalGap;
  const itemWidth = availableWidth / numColumns;
  const { logout, deleteAccount } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = profileStyles(isDark);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isGridView, setIsGridView] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    isLoading,
    currentUserId,
    username,
    fullName,
    bio,
    profileImage,
    bannerImage,
    followersCount,
    followingCount,
    loadProfile,
    resetProfile,
  } = useProfile();
  const viewedUserId = currentUserId;

  const { type, targetUserId, openModal, shouldRestore, clearRestore } =
    useFollowersStore();

  const { showOnReturn, setShowOnReturn, setShowSettingsModal } =
    useSettingsModalStore();

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

  const confirmDeleteAccount = async () => {
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      router.replace("/settings/deleteaccountsplash");
    } catch {
      alert("Failed to delete account. Please try again.");
    }
  };

  const signOut = async () => {
    try {
      clearFavorites();
      resetProfile();
      await logout();
    } catch (error) {
      console.warn("Failed to sign out:", error);
    } finally {
      setShowSignOutModal(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const initialize = async () => {
        if (!isActive) return;
        const loadedUserId = await loadProfile();
        if (!isActive) return;

        await loadFavorites(loadedUserId);
        if (!isActive) return;

        if (shouldRestore && targetUserId) {
          clearRestore();
          openModal(
            type,
            targetUserId,
            loadedUserId ? String(loadedUserId) : undefined,
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
      loadFavorites,
      shouldRestore,
      targetUserId,
      type,
      openModal,
      clearRestore,
      showOnReturn,
      setShowSettingsModal,
      setShowOnReturn,
    ]),
  );

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
  }, [navigation, router, username]);

  const favoriteTeamsWithLeague = favorites
    .map((fav) => {
      const [league, id] = fav.split(":");
      let team;
      if (league === "NBA") team = teams.find((t) => String(t.id) === id);
      if (league === "WNBA") team = wnbaTeams.find((t) => String(t.id) === id);
      if (league === "NFL") team = nflTeams.find((t) => String(t.id) === id);
      if (league === "CFB") team = cfbTeams.find((t) => String(t.id) === id);
      if (league === "CBB") team = cbbTeams.find((t) => String(t.id) === id);
      if (league === "WCBB") team = cbbTeams.find((t) => String(t.wid) === id);
      if (league === "MLB") team = mlbTeams.find((t) => String(t.id) === id);
      if (league === "NHL") team = nhlTeams.find((t) => String(t.id) === id);
      if (!team) return null;
      return { ...team, league: league as any };
    })
    .filter(Boolean);

  if (isLoading) return <SkeletonProfileScreen isDark={isDark} />;

  const onFollowersPress = () => {
    if (!currentUserId) return;
    router.push({
      pathname: "/user/followers",
      params: {
        type: "followers",
        currentUserId: String(currentUserId),
        targetUserId: String(currentUserId),
      },
    });
  };

  const onFollowingPress = () => {
    if (!currentUserId) return;
    router.push({
      pathname: "/user/followers",
      params: {
        type: "following",
        currentUserId: String(currentUserId),
        targetUserId: String(currentUserId),
      },
    });
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
            favorites={favoriteTeamsWithLeague}
            isGridView={isGridView}
            fadeAnim={fadeAnim}
            toggleFavoriteTeamsView={toggleFavoriteTeamsView}
            styles={styles}
            itemWidth={itemWidth}
            isCurrentUser={currentUserId === viewedUserId}
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
    </>
  );
}

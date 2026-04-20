import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FavoriteTeamsSection from "components/Favorites/FavoriteTeamsSection";
import BioSection from "components/Profile/BioSection";
import FollowStats from "components/Profile/FollowStats";
import ProfileBanner from "components/Profile/ProfileBanner";
import ProfileHeader from "components/Profile/ProfileHeader";
import { SkeletonProfileScreen } from "components/Skeletons/SkeletonProfileScreen";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useUserProfile } from "hooks/useUserProfile";
import { useLayoutEffect, useState } from "react";
import { Animated, ScrollView, View, useWindowDimensions } from "react-native";
import { useFollowersStore } from "store/followersStore";
import { profileStyles } from "styles/ProfileStyles/ProfileScreenStyles";

export default function UserProfileScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const numColumns = 3;
  const horizontalPadding = 40;
  const columnGap = 12;
  const totalGap = columnGap * (numColumns - 1);
  const availableWidth = screenWidth - horizontalPadding - totalGap;
  const itemWidth = availableWidth / numColumns;
  const params = useLocalSearchParams();
  const userId = params.id as string | undefined;
  const [isGridView, setIsGridView] = useState(true);
  const navigation = useNavigation();
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const {
    isLoading,
    username,
    fullName,
    bio,
    profileImage,
    bannerImage,
    followersCount,
    followingCount,
    isFollowing,
    followLoading,
    favoriteTeamsWithLeague,
    fadeAnim,
    currentUserId,
    toggleFollow,
  } = useUserProfile(userId);

  const {
    isVisible,
    type,
    targetUserId,
    openModal,
    closeModal,
    shouldRestore,
    clearRestore,
  } = useFollowersStore();

  // Navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          title={username ? `@${username}` : "User"}
          tabName="User"
          onBack={() => router.back()}
        />
      ),
    });
  }, [navigation, username, router]);

  // Toggle favorite teams grid/list
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

  const styles = profileStyles(isDark);

  if (isLoading) {
    return <SkeletonProfileScreen isDark={isDark} />;
  }

  const onFollowersPress = () => {
    if (!currentUserId || !userId) return;

    router.push({
      pathname: "/user/followers",
      params: {
        type: "followers",
        currentUserId: String(currentUserId),
        targetUserId: String(userId), // ✅ viewed profile
      },
    });
  };

  const onFollowingPress = () => {
    if (!currentUserId || !userId) return;

    router.push({
      pathname: "/user/followers",
      params: {
        type: "following",
        currentUserId: String(currentUserId),
        targetUserId: String(userId), // ✅ viewed profile
      },
    });
  };

  const isCurrentUser =
    currentUserId !== null && String(currentUserId) === userId;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 30 }}
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
          targetUserId={userId ?? ""}
          onFollowersPress={onFollowersPress}
          onFollowingPress={onFollowingPress}
        />

        <ProfileHeader
          fullName={fullName}
          username={username}
          isDark={isDark}
          isCurrentUser={isCurrentUser}
          isFollowing={isFollowing}
          loading={followLoading}
          onToggleFollow={toggleFollow}
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
            isCurrentUser={isCurrentUser}
          />
        </View>
      </ScrollView>
    </>
  );
}

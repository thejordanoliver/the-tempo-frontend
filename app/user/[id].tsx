import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FavoriteTeamsSection from "components/Favorites/FavoriteTeamsSection";
import BioSection from "components/Profile/BioSection";
import FollowStats from "components/Profile/FollowStats";
import ProfileBanner from "components/Profile/ProfileBanner";
import ProfileHeader from "components/Profile/ProfileHeader";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useState } from "react";
import {
  Animated,
  ScrollView,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { useFollowersModalStore } from "store/followersModalStore";

import { SkeletonProfileScreen } from "components/Skeletons/SkeletonProfileScreen";
import { useUserProfile } from "hooks/useUserProfile";
import { profileStyles } from "styles/ProfileScreenStyles";



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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
  } = useFollowersModalStore();

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
    if (currentUserId && userId) {
      openModal("followers", userId, String(currentUserId));
    }
  };

  const onFollowingPress = () => {
    if (currentUserId && userId) {
      openModal("following", userId, String(currentUserId));
    }
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
            favoriteTeams={favoriteTeamsWithLeague}
            isGridView={isGridView}
            fadeAnim={fadeAnim}
            toggleFavoriteTeamsView={toggleFavoriteTeamsView}
            styles={styles}
            itemWidth={itemWidth}
            isCurrentUser={isCurrentUser}
            username={username ?? undefined}
          />
        </View>
      </ScrollView>
    </>
  );
}

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
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { profileStyles } from "styles/ProfileStyles/ProfileScreenStyles";

const NUM_COLUMNS = 3;
const HORIZONTAL_PADDING = 40;
const COLUMN_GAP = 12;

type RouteParam = string | string[] | undefined;

const normalizeRouteParam = (param: RouteParam) => {
  if (Array.isArray(param)) return param[0] ?? "";
  return param ?? "";
};

export default function UserProfileScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = useMemo(() => {
    const totalGap = COLUMN_GAP * (NUM_COLUMNS - 1);
    const availableWidth = screenWidth - HORIZONTAL_PADDING - totalGap;
    return availableWidth / NUM_COLUMNS;
  }, [screenWidth]);
  const params = useLocalSearchParams<{ id?: RouteParam }>();
  const userId = useMemo(() => normalizeRouteParam(params.id), [params.id]);
  const [isGridView, setIsGridView] = useState(true);
  const isAnimatingRef = useRef(false);
  const navigation = useNavigation();
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => profileStyles(isDark), [isDark]);
  const scrollContentStyle = useMemo(() => ({ paddingBottom: 30 }), []);

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

  const headerTitle = useMemo(
    () => (username ? `@${username}` : "User"),
    [username],
  );

  const currentUserIdString = useMemo(
    () => (currentUserId ? String(currentUserId) : ""),
    [currentUserId],
  );

  const isCurrentUser = useMemo(
    () => Boolean(currentUserIdString && userId && currentUserIdString === userId),
    [currentUserIdString, userId],
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          title={headerTitle}
          tabName="User"
          onBack={handleBack}
        />
      ),
    });
  }, [navigation, headerTitle, handleBack]);

  const toggleFavoriteTeamsView = useCallback(() => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
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
      }).start(() => {
        isAnimatingRef.current = false;
      });
    });
  }, [fadeAnim]);

  const onFollowersPress = useCallback(() => {
    if (!currentUserIdString || !userId) return;

    router.push({
      pathname: "/user/followers",
      params: {
        type: "followers",
        currentUserId: currentUserIdString,
        targetUserId: userId,
      },
    });
  }, [currentUserIdString, router, userId]);

  const onFollowingPress = useCallback(() => {
    if (!currentUserIdString || !userId) return;

    router.push({
      pathname: "/user/followers",
      params: {
        type: "following",
        currentUserId: currentUserIdString,
        targetUserId: userId,
      },
    });
  }, [currentUserIdString, router, userId]);

  const handleToggleFollow = useCallback(() => {
    if (isCurrentUser || !userId || !currentUserIdString) return;
    toggleFollow();
  }, [currentUserIdString, isCurrentUser, toggleFollow, userId]);

  if (!userId) {
    return (
      <View style={styles.container}>
        <Text style={styles.bioText}>User not found.</Text>
      </View>
    );
  }

  if (isLoading) {
    return <SkeletonProfileScreen isDark={isDark} />;
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={scrollContentStyle}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
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
          currentUserId={currentUserIdString}
          targetUserId={userId}
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
          onToggleFollow={handleToggleFollow}
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

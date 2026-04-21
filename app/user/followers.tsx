import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FollowersList from "components/Profile/FollowersList";
import SearchBar from "components/SearchBars/SearchBar";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useFollowers } from "hooks/UserHooks/useFollowers";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { followersListStyles } from "styles/ProfileStyles/FollowersListStyles";
import { Mode } from "types/user";

export default function FollowersScreen() {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = followersListStyles(isDark);
  const navigation = useNavigation();
  const { type, currentUserId, targetUserId } = useLocalSearchParams<{
    type: Mode;
    currentUserId: string;
    targetUserId: string;
  }>();

  const mode: Mode =
    type === "followers" || type === "following" ? type : "followers";

  const [search, setSearch] = useState("");
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const {
    users: usersFromHook,
    error,
    toggleFollow,
  } = useFollowers(currentUserId ?? "", targetUserId ?? "", mode);

  useEffect(() => {
    setUsers(usersFromHook ?? []);
  }, [usersFromHook]);

  const handleUserPress = (userId: string) => {
    router.push(`/user/${userId}`);
  };

  const handleToggleFollow = async (targetId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id.toString() === targetId
          ? { ...u, isFollowing: !u.isFollowing }
          : u,
      ),
    );

    setLoadingIds((prev) => [...prev, targetId]);

    try {
      await toggleFollow(targetId);
    } catch {
      // rollback
      setUsers((prev) =>
        prev.map((u) =>
          u.id.toString() === targetId
            ? { ...u, isFollowing: !u.isFollowing }
            : u,
        ),
      );
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== targetId));
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => u.username?.toLowerCase().includes(search.toLowerCase()))
      .map((u) => ({ ...u, id: u.id.toString() }));
  }, [users, search]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          title={mode === "followers" ? "Followers" : "Following"}
          tabName="User"
          onBack={() => router.back()}
        />
      ),
    });
  }, [navigation, mode, router]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainerStyle}
      >
        <SearchBar
          placeholder="Search"
          value={search}
          onChangeText={setSearch}
        />

        <FollowersList
          users={filteredUsers}
          loadingIds={loadingIds}
          currentUserId={currentUserId ?? ""}
          onUserPress={handleUserPress}
          onToggleFollow={handleToggleFollow}
          error={error}
        />
      </ScrollView>
    </View>
  );
}

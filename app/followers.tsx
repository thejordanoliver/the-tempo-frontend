// app/followers.tsx or wherever your FollowersScreen route lives

import FollowersList from "components/Profile/FollowersList";
import SearchBar from "components/SearchBars/SearchBar";
import { useFollowersScreen } from "hooks/UserHooks/useFollowersScreen";
import { ScrollView, View } from "react-native";

export default function FollowersScreen() {
  const {
    styles,
    search,
    filteredUsers,
    loading,
    loadingIds,
    error,
    normalizedCurrentUserId,
    handleSearchChange,
    handleUserPress,
    handleToggleFollow,
  } = useFollowersScreen();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainerStyle}
      >
        <SearchBar
          placeholder="Search"
          value={search}
          onChangeText={handleSearchChange}
        />

        <FollowersList
          users={filteredUsers}
          loading={loading}
          loadingIds={loadingIds}
          currentUserId={normalizedCurrentUserId}
          onUserPress={handleUserPress}
          onToggleFollow={handleToggleFollow}
          error={error}
        />
      </ScrollView>
    </View>
  );
}

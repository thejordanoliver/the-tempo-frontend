// components/FollowersList.tsx
import { Ionicons } from "@expo/vector-icons";
import { Colors, globalStyles } from "constants/Styles";
import { User } from "hooks/UserHooks/useFollowers";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { followersListStyles } from "styles/ProfileStyles/FollowersListStyles";
import FollowingButton from "./ModalFollowingButton";

type Props = {
  users: User[];
  loadingIds: string[];
  currentUserId: string;
  onUserPress: (id: string) => void;
  onToggleFollow: (id: string) => void;
  error: string | null;
};

export default function FollowersList({
  users,
  loadingIds,
  currentUserId,
  onUserPress,
  onToggleFollow,
  error,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = followersListStyles(isDark);
  const global = globalStyles(isDark);

  if (!users || users.length === 0) {
    return <Text style={global.emptyText}>No users found.</Text>;
  }
  if (error) {
    return <Text style={global.errorText}>{error}</Text>;
  }

  const renderItem = ({ item }: { item: User }) => {
    const imageUri = item.profile_image.startsWith("http")
      ? item.profile_image
      : `${process.env.EXPO_PUBLIC_API_URL}${item.profile_image}`;

    const isCurrentUser = item.id.toString() === currentUserId;
    // console.log(JSON.stringify(item, null, 2))
    const isMutual = item.isFollowing && item.followsYou;

    return (
      <View style={styles.itemRow}>
        <View style={styles.itemContainer}>
          <TouchableOpacity
            onPress={() => onUserPress(item.id.toString())}
            style={styles.userRow}
          >
            <View style={styles.avatarContainer}>
              <Image source={{ uri: imageUri }} style={styles.avatar} />
            </View>
            <Text style={styles.username}>{item.username}</Text>
          </TouchableOpacity>
        </View>
        {item.followsYou && (
          <Ionicons
            name="infinite-outline"
            size={14}
            color={Colors.midTone}
            style={{ marginRight: 6 }}
          />
        )}
        {!isCurrentUser && (
          <FollowingButton
            isFollowing={item.isFollowing}
            loading={loadingIds.includes(item.id.toString())}
            onToggle={() => onToggleFollow(item.id.toString())}
          />
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
}

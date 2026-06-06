import { Text, TouchableOpacity, View } from "react-native";
import { Follow } from "types/user";
import { profileStyles } from "../../styles/ProfileStyles/ProfileScreenStyles";

export default function FollowStats({
  followersCount,
  followingCount,
  isDark,
  onFollowersPress, // <-- new
  onFollowingPress, // <-- new
}: Follow & { onFollowersPress: () => void; onFollowingPress: () => void }) {
  const styles = profileStyles(isDark);

  return (
    <View style={styles.followContainer}>
      <TouchableOpacity
        onPress={onFollowersPress} // <-- use handler from props
        style={styles.followItem}
        activeOpacity={0.6}
      >
        <Text style={styles.followCount}>{followersCount}</Text>
        <Text style={styles.followLabel}>Followers</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onFollowingPress} // <-- use handler from props
        style={styles.followItem}
        activeOpacity={0.6}
      >
        <Text style={styles.followCount}>{followingCount}</Text>
        <Text style={styles.followLabel}>Following</Text>
      </TouchableOpacity>
    </View>
  );
}

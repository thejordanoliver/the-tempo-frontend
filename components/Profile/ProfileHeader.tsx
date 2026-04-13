import { Ionicons } from "@expo/vector-icons";
import FollowButton from "components/Profile/FollowButton";
import { Colors } from "constants/styles";
import { Pressable, Text, View } from "react-native";
import { profileStyles } from "../../styles/ProfileStyles/ProfileScreenStyles";

type Props = {
  fullName?: string | null;
  username?: string | null;
  isDark: boolean;
  isCurrentUser: boolean;
  onEditPress?: () => void;
  isFollowing?: boolean;
  loading?: boolean;
  onToggleFollow?: () => void;
};

export default function ProfileHeader({
  fullName,
  username,
  isDark,
  isCurrentUser,
  onEditPress,
  isFollowing,
  loading,
  onToggleFollow,
}: Props) {
  const styles = profileStyles(isDark);

  return (
    <View style={styles.wrapper}>
      <View style={styles.nameContainer}>
        <Text style={styles.fullNameText}>{fullName}</Text>
        <Text style={styles.usernameText}>
          {"@" + (username || "Your Username")}
        </Text>
      </View>

      {isCurrentUser ? (
        <Pressable style={styles.editProfileBtn} onPress={onEditPress}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
          <Ionicons
            name="create"
            size={18}
            color={isDark ? Colors.black : Colors.white}
          />
        </Pressable>
      ) : (
        <FollowButton
          isFollowing={!!isFollowing}
          loading={!!loading}
          onToggle={onToggleFollow ?? (() => {})}
        />
      )}
    </View>
  );
}

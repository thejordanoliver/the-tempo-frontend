import { Ionicons } from "@expo/vector-icons";
import FollowButton from "components/Profile/FollowButton";
import { Colors } from "constants/Styles";
import { Pressable, Text, View } from "react-native";
import { profileStyles } from "../../styles/ProfileScreenStyles";

type Props = {
  fullName?: string | null;
  username?: string | null;
  isDark: boolean;
  isCurrentUser: boolean;

  // Props for edit profile (only relevant if isCurrentUser)
  onEditPress?: () => void;

  // Props for follow button (only relevant if !isCurrentUser)
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
          <Ionicons
            style={styles.editIcon}
            name="create"
            size={18}
            color={isDark ? Colors.black : Colors.white}
          />
          <Text style={styles.editProfileText}>Edit Profile</Text>
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

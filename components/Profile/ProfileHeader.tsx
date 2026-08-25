import FollowButton from "components/Profile/FollowButton";
import { Text, View } from "react-native";
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

      {!isCurrentUser && (
        <FollowButton
          isFollowing={!!isFollowing}
          loading={!!loading}
          onToggle={onToggleFollow ?? (() => {})}
        />
      )}
    </View>
  );
}

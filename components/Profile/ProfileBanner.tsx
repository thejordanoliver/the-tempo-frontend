import React from "react";
import {
  GestureResponderEvent,
  Image,
  TouchableOpacity,
  View,
} from "react-native";
import { profileStyles } from "../../styles/ProfileStyles/ProfileScreenStyles";

type Props = {
  bannerImage?: string | null;
  profileImage?: string | null;
  isDark: boolean;
  editable?: boolean;
  onPressBanner?: (e: GestureResponderEvent) => void;
  onPressProfile?: (e: GestureResponderEvent) => void;
};

const bannerDefault = { uri: "https://placehold.co/800x200/png" };
const profileDefault = { uri: "https://placehold.co/120" };

function safeSource(uri?: string | null) {
  if (!uri || typeof uri !== "string") return undefined;

  // Show local file URIs for preview
  if (uri.startsWith("file://")) return { uri };

  // Show remote URLs
  if (uri.startsWith("http")) return { uri };

  return undefined;
}

export default function ProfileBanner({
  bannerImage,
  profileImage,
  isDark,
  editable = false,
  onPressBanner,
  onPressProfile,
}: Props) {
  const styles = profileStyles(isDark);

  const BannerComponent = editable ? TouchableOpacity : View;
  const ProfileComponent = editable ? TouchableOpacity : View;

  return (
    <View style={styles.bannerContainer}>
      <BannerComponent onPress={onPressBanner} activeOpacity={0.7}>
        <Image
          source={safeSource(bannerImage) ?? bannerDefault}
          style={styles.banner}
        />
      </BannerComponent>

      <View style={styles.profilePicWrapper}>
        <ProfileComponent onPress={onPressProfile} activeOpacity={0.7}>
          <Image
            source={safeSource(profileImage) ?? profileDefault}
            style={styles.profilePic}
          />
        </ProfileComponent>
      </View>
    </View>
  );
}

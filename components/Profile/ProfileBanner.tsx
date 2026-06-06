import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { ProfileBannerProps } from "types/user";
import { profileStyles } from "../../styles/ProfileStyles/ProfileScreenStyles";

const bannerPlaceholder =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1776393764/BannerPlaceholder.png";
const profilePlaceholder =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1776393743/ProfilePlaceholder.png";

export default function ProfileBanner({
  bannerImage,
  profileImage,
  isDark,
  editable = false,
  onPressBanner,
  onPressProfile,
}: ProfileBannerProps) {
  const styles = profileStyles(isDark);
  const BannerComponent = editable ? TouchableOpacity : View;
  const ProfileComponent = editable ? TouchableOpacity : View;

  return (
    <View style={styles.bannerContainer}>
      <BannerComponent onPress={onPressBanner} activeOpacity={0.7}>
        <Image
          source={{ uri: bannerImage ?? bannerPlaceholder }}
          style={styles.banner}
        />
      </BannerComponent>

      <View style={styles.profilePicWrapper}>
        <ProfileComponent onPress={onPressProfile} activeOpacity={0.7}>
          <Image
            source={{ uri: profileImage ?? profilePlaceholder }}
            style={styles.profilePic}
          />
        </ProfileComponent>
      </View>
    </View>
  );
}

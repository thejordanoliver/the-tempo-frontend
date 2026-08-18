import {
  activeOpacity,
  PLACEHOLDER_AVATAR,
  PLACEHOLDER_BANNER,
} from "@/constants/styles";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { ProfileBannerProps } from "types/user";
import { profileStyles } from "../../styles/ProfileStyles/ProfileScreenStyles";

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
      <BannerComponent onPress={onPressBanner} activeOpacity={activeOpacity}>
        <Image
          source={{ uri: bannerImage ?? PLACEHOLDER_BANNER }}
          style={styles.banner}
        />
      </BannerComponent>

      <View style={styles.profilePicWrapper}>
        <ProfileComponent
          onPress={onPressProfile}
          activeOpacity={activeOpacity}
        >
          <Image
            source={{ uri: profileImage ?? PLACEHOLDER_AVATAR }}
            style={styles.profilePic}
          />
        </ProfileComponent>
      </View>
    </View>
  );
}

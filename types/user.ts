import { GestureResponderEvent } from "react-native";

export type ProfileBannerProps = {
  bannerImage?: string | null;
  profileImage?: string | null;
  isDark: boolean;
  editable?: boolean;
  onPressBanner?: (e: GestureResponderEvent) => void;
  onPressProfile?: (e: GestureResponderEvent) => void;
};

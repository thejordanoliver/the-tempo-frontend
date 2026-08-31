import { Colors, Fonts } from "constants/styles";
import { Animated, StyleSheet } from "react-native";
export const PROFILE_BANNER_HEIGHT = 120;
export const PROFILE_PIC_SIZE = 120;

export const profileStyles = (
  isDark: boolean,
  isFollowing?: boolean,
  opacityAnim?: Animated.Value,
) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 0,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    title: {
      padding: 0,
    },
    bannerContainer: {
      position: "relative",
      top: 0,
      width: "100%",
      height: PROFILE_BANNER_HEIGHT,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    banner: {
      width: "100%",
      height: PROFILE_BANNER_HEIGHT,
    },
    profilePicWrapper: {
      position: "absolute",
      bottom: -PROFILE_PIC_SIZE / 2,
      left: "50%",
      width: PROFILE_PIC_SIZE,
      height: PROFILE_PIC_SIZE,
      marginLeft: -PROFILE_PIC_SIZE / 2,
      borderWidth: 4,
      borderColor: isDark ? Colors.black : Colors.white,
      borderRadius: PROFILE_PIC_SIZE / 2,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      overflow: "hidden",
    },
    profilePic: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    bioContainer: {
      marginTop: 0,
      paddingHorizontal: 12,
    },
    wrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
      paddingHorizontal: 12,
    },
    nameContainer: {
      flexDirection: "column",
    },
    fullNameText: {
      fontFamily: Fonts.BOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
    },
    usernameText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    followContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: 16,
      paddingVertical: 20,
      paddingHorizontal: 50,
    },
    followItem: {
      alignItems: "center",
    },

    followButtonContainer: {
      width: 120,
      borderRadius: 10,
      opacity: opacityAnim,
      overflow: "hidden",
    },
    followButton: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: isFollowing
        ? isDark
          ? Colors.black
          : Colors.black
        : isDark
          ? Colors.white
          : Colors.black,
      borderRadius: 10,
      backgroundColor: isFollowing
        ? isDark
          ? Colors.white
          : Colors.black
        : isDark
          ? Colors.black
          : Colors.white,
    },
    followText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      color: isFollowing
        ? isDark
          ? Colors.black
          : Colors.white
        : isDark
          ? Colors.white
          : Colors.black,
    },
    followCount: {
      fontFamily: Fonts.BOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
    },
    followLabel: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    bioText: {
      marginVertical: 8,
      fontFamily: Fonts.LIGHT,
      fontSize: 16,
      lineHeight: 22,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    editProfileBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    editProfileText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      color: isDark ? Colors.black : Colors.white,
    },
    contentContainer: {
      marginTop: 20,
      paddingHorizontal: 12,
      paddingBottom: 100,
    },
    bookmarkContainer: {
      marginTop: 20,
      paddingBottom: 100,
    },
    favoritesHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
  });
};

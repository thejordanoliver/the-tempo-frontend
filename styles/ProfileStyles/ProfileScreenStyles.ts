import { Colors, Fonts } from "constants/styles";
import { Animated, StyleSheet } from "react-native";
const BANNER_HEIGHT = 120;
const PROFILE_PIC_SIZE = 120;

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
      height: BANNER_HEIGHT,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    banner: {
      width: "100%",
      height: BANNER_HEIGHT,
    },
    profilePicWrapper: {
      position: "absolute",
      bottom: -PROFILE_PIC_SIZE / 2,
      left: "50%",
      marginLeft: -PROFILE_PIC_SIZE / 2,
      borderRadius: PROFILE_PIC_SIZE / 2,
      borderWidth: 4,
      borderColor: isDark ? Colors.black : Colors.white,
      overflow: "hidden",
      width: PROFILE_PIC_SIZE,
      height: PROFILE_PIC_SIZE,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
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
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      paddingHorizontal: 12,
    },
    nameContainer: {
      flexDirection: "column",
    },
    fullNameText: {
      fontSize: 20,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    usernameText: {
      fontSize: 16,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    followContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 20,
      paddingHorizontal: 50,
      width: "100%",
      marginBottom: 16,
    },
    followItem: {
      alignItems: "center",
    },

    followButtonContainer: {
      opacity: opacityAnim,
      width: 120,
      borderRadius: 10,
      overflow: "hidden",
    },
    followButton: {
      backgroundColor: isFollowing
        ? isDark
          ? Colors.white
          : Colors.black
        : isDark
          ? Colors.black
          : Colors.white,
      borderColor: isFollowing
        ? isDark
          ? Colors.black
          : Colors.black
        : isDark
          ? Colors.white
          : Colors.black,
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    followText: {
      color: isFollowing
        ? isDark
          ? Colors.black
          : Colors.white
        : isDark
          ? Colors.white
          : Colors.black,
      fontSize: 16,
      fontFamily: Fonts.OSMEDIUM,
    },
    followCount: {
      fontSize: 20,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    followLabel: {
      fontSize: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSMEDIUM,
    },
    bioText: {
      marginVertical: 8,
      fontSize: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      lineHeight: 22,
      fontFamily: Fonts.OSLIGHT,
    },
    editProfileBtn: {
      backgroundColor: isDark ? Colors.white : Colors.black,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    editProfileText: {
      color: isDark ? Colors.black : Colors.white,
      fontSize: 16,
      fontFamily: Fonts.OSMEDIUM,
    },
    favoritesContainer: {
      marginTop: 20,
      paddingHorizontal: 12,
      paddingBottom: 100,
    },
  });
};

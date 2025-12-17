// ProfileScreen.styles.ts
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";
const BANNER_HEIGHT = 120;
const PROFILE_PIC_SIZE = 120;

const theme = (isDark: boolean) => ({
  colors: {
    background: isDark ? Colors.black : Colors.white,
    inverse: isDark ? Colors.white : Colors.black,
    bannerBackground: isDark ? Colors.darkGray : Colors.lightGray,
    profileBorder: isDark ? "#222" : Colors.white,
    profileBackground: isDark ? Colors.darkGray : Colors.lightGray,
    textPrimary: isDark ? Colors.white : Colors.black,
    textSecondary: isDark ? Colors.lightGray : Colors.darkGray,
    textTertiary: isDark ? Colors.midTone : Colors.midTone,
    accent: isDark ? Colors.black : Colors.white,
    border: isDark ? Colors.darkGray : Colors.lightGray,
    followCount: isDark ? Colors.white : Colors.black,
  },
});

export const getStyles = (isDark: boolean) => {
  const { colors } = theme(isDark);

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 0,
      backgroundColor: colors.background,
    },
    title: {
      padding: 0,
    },
    bannerContainer: {
      position: "relative",
      top: 0,
      width: "100%",
      height: BANNER_HEIGHT,
      backgroundColor: colors.bannerBackground,
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
      borderColor: colors.profileBorder,
      overflow: "hidden",
      width: PROFILE_PIC_SIZE,
      height: PROFILE_PIC_SIZE,
      backgroundColor: colors.profileBackground,
    },
    profilePic: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    bioContainer: {
      marginTop: 20,
      paddingHorizontal: 16,
    },
    wrapper: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    nameContainer: {
      flexDirection: "column",
    },
    fullNameText: {
      fontSize: 20,
      fontFamily: Fonts.OSBOLD,
      color: colors.textPrimary,
    },
    usernameText: {
      fontSize: 16,
      fontFamily: Fonts.OSMEDIUM,
      color: "gray",
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
    followCount: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.followCount,
    },
    followLabel: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: Fonts.OSMEDIUM,
    },
    bioText: {
      marginVertical: 20,
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 22,
      fontFamily: Fonts.OSLIGHT,
    },
    editProfileBtn: {
      backgroundColor: colors.inverse,
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
    favoritesHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      color: colors.textPrimary,
    },
    toggleIcon: {
      paddingHorizontal: 4,
    },

    heading: {
      fontSize: 24,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? "white" : Colors.black,
    },
    noFavoritesText: {
      fontStyle: "italic",
      color: colors.textTertiary,
      textAlign: "center",
    },
    teamGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 8,
    },

    teamItem: {
      flexDirection: "row",
      flex: 1,
      alignItems: "center",
      margin: 2,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
    },

    teamLogo: {
      width: 50,
      height: 50,
      resizeMode: "contain",
    },
    teamName: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.white,
      width: "auto",
    },

    editButton: {
      backgroundColor: isDark ? Colors.white : Colors.black,
      marginVertical: 8,
      paddingHorizontal: 0,
      paddingVertical: 16,
      borderRadius: 8,
    },
    editText: {
      color: isDark ? Colors.black : Colors.white,
      fontSize: 20,
      fontFamily: Fonts.OSMEDIUM,
    },
    editIcon: {
      marginLeft: 4,
      color: isDark ? Colors.black : Colors.white,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: Fonts.OSSEMIBOLD,
      marginBottom: 8,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    teamCard: {
      alignItems: "center",
      marginRight: 16,
      width: 80,
    },
  });
};

import { Colors, Fonts } from "constants/styles";
import { Dimensions, StyleSheet } from "react-native";

export const HEADER_WIDTH = Dimensions.get("window").width;

export const customHeaderStyles = (isDark: boolean) =>
  StyleSheet.create({
    bgImage: {
      position: "absolute",
      top: -70,
      zIndex: 0,
      width: "100%",
      height: 200,
      opacity: 0.25,
      resizeMode: "contain",
    },

    headerSidePlaceholder: {
      width: 24,
    },

    profileHeaderPlaceholder: {
      width: 32,
    },

    defaultHeaderTitleContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    leagueHeaderContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      height: 56,
      overflow: "hidden",
    },

    leagueHeaderButton: {
      zIndex: 2,
      flexDirection: "row",
      alignItems: "center",
    },

    teamHeaderActions: {
      flexDirection: "row",
      alignItems: "center",
    },

    teamHeaderActionButton: {
      padding: 8,
    },

    teamHalfWrapper: {
      position: "relative",
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },

    teamHalfContent: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 2,
      alignItems: "center",
      justifyContent: "center",
    },

    bgLogo: {
      position: "absolute",
      alignSelf: "center",
      width: "100%",
      height: 180,
      marginTop: 10,
      opacity: 0.25,
    },

    teamCode: {
      zIndex: 2,
      fontFamily: Fonts.BOLD,
      fontSize: 24,
      color: Colors.white,
    },

    teamCodeRow: {
      flexDirection: "row",
    },

    dividerWrapper: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 2,
      alignItems: "center",
      justifyContent: "center",
    },

    dividerText: {
      fontFamily: Fonts.BOLD,
      fontSize: 24,
      color: Colors.white,
    },

    racingHeader: {
      zIndex: -10,
      backgroundColor: Colors.black,
      overflow: "hidden",
    },

    racingAccent: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      zIndex: 3,
      width: 5,
    },

    racingHeaderContent: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 54,
    },

    racingCodeRow: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 10,
    },

    racingCode: {
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      color: Colors.white,
    },

    racingTextWrapper: {
      flexShrink: 1,
      alignItems: "flex-start",
      justifyContent: "center",
    },

    racingSeriesLabel: {
      fontFamily: Fonts.BOLD,
      fontSize: 8,
      letterSpacing: 1.1,
      color: "rgba(255,255,255,0.72)",
    },

    racingEventTitle: {
      maxWidth: HEADER_WIDTH * 0.48,
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: Colors.white,
    },

    racingLogoWrapper: {
      position: "absolute",
      top: -26,
      right: 34,
      zIndex: 1,
      width: 116,
      height: 116,
      opacity: 0.18,
    },

    racingLogo: {
      width: "100%",
      height: "100%",
    },

    racingLargeText: {
      position: "absolute",
      right: -4,
      bottom: -22,
      zIndex: 1,
      opacity: 0.09,
      fontFamily: Fonts.BOLD,
      fontSize: 70,
      lineHeight: 78,
      letterSpacing: -3,
    },

    racingCheckeredPattern: {
      position: "absolute",
      top: -14,
      right: -12,
      flexDirection: "row",
      flexWrap: "wrap",
      width: 108,
      opacity: 0.08,
      transform: [
        {
          rotate: "12deg",
        },
      ],
    },

    racingCheckeredCell: {
      width: 18,
      height: 18,
    },

    racingCheckeredCellFilled: {
      backgroundColor: Colors.white,
    },

    racingCheckeredCellEmpty: {
      backgroundColor: "transparent",
    },

    messageHeaderContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 56,
      paddingHorizontal: 8,
    },

    messageAvatarWrap: {
      width: 36,
      height: 36,
      marginRight: 9,
      borderRadius: 18,
    },

    messageAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: Colors.darkGray,
    },

    messageOnlineDot: {
      position: "absolute",
      right: -1,
      bottom: 1,
      width: 10,
      height: 10,
      borderWidth: 1.5,
      borderRadius: 5,
      backgroundColor: Colors.dark.leafGreen,
    },

    messageHeaderTextWrap: {
      justifyContent: "center",
      maxWidth: HEADER_WIDTH * 0.54,
    },

    messageUsernameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    messageUsername: {
      flexShrink: 1,
      fontFamily: Fonts.BOLD,
      fontSize: 15,
    },

    messageFullName: {
      marginTop: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
    },

    profileMenuAnchor: {
      position: "relative",
      zIndex: 50,
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      elevation: 50,
    },

    profileHeaderActionButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      borderRadius: 16,
    },

    profileSubmenu: {
      position: "absolute",
      top: 38,
      right: 0,
      width: 150,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      shadowColor: Colors.black,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 18,
    },

    profileSubmenuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 10,
      paddingVertical: 10,
    },

    profileSubmenuIconWrap: {
      alignItems: "center",
      justifyContent: "center",
      width: 24,
      height: 24,
      borderRadius: 12,
    },

    profileSubmenuText: {
      flex: 1,
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },

    profileSubmenuSeparator: {
      height: StyleSheet.hairlineWidth,
      marginLeft: 42,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    headerActionButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      height: 40,
      borderRadius: 20,
    },

    headerActionButtonPressed: {
      opacity: 0.65,
    },

    notificationButton: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
    },

    notificationBadge: {
      position: "absolute",
      top: -5,
      right: -2,
      minWidth: 20,
      height: 20,
      paddingHorizontal: 4,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      borderRadius: 999,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
      borderWidth: 2,
      borderColor: isDark ? Colors.black : Colors.white,
    },

    notificationBadgeText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: Colors.white,
      textAlign: "center",
    },
  });

import { Colors, Fonts } from "constants/styles";
import { Dimensions, StyleSheet } from "react-native";

export const HEADER_WIDTH = Dimensions.get("window").width;

export const customHeaderStyles = StyleSheet.create({
  bgImage: {
    height: 200,
    width: "100%",
    resizeMode: "contain",
    opacity: 0.25,
    position: "absolute",
    top: -70,
    zIndex: 0,
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
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  leagueHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },

  teamHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  teamHeaderActionButton: {
    padding: 8,
  },

  teamHalfWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },

  teamHalfContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  bgLogo: {
    position: "absolute",
    width: "100%",
    height: 180,
    opacity: 0.25,
    alignSelf: "center",
    marginTop: 10,
  },

  teamCode: {
    color: Colors.white,
    fontFamily: Fonts.BOLD,
    fontSize: 24,
    zIndex: 2,
  },

  teamCodeRow: {
    flexDirection: "row",
  },

  dividerWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  dividerText: {
    color: Colors.white,
    fontFamily: Fonts.BOLD,
    fontSize: 24,
  },

  racingHeader: {
    zIndex: -10,
    overflow: "hidden",
    backgroundColor: Colors.black,
  },

  racingAccent: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 5,
    zIndex: 3,
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
    color: Colors.white,
    fontFamily: Fonts.BOLD,
    fontSize: 12,
  },

  racingTextWrapper: {
    flexShrink: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  racingSeriesLabel: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: Fonts.BOLD,
    fontSize: 8,
    letterSpacing: 1.1,
  },

  racingEventTitle: {
    color: Colors.white,
    fontFamily: Fonts.BOLD,
    fontSize: 14,
    maxWidth: HEADER_WIDTH * 0.48,
  },

  racingLogoWrapper: {
    position: "absolute",
    right: 34,
    top: -26,
    width: 116,
    height: 116,
    opacity: 0.18,
    zIndex: 1,
  },

  racingLogo: {
    width: "100%",
    height: "100%",
  },

  racingLargeText: {
    position: "absolute",
    right: -4,
    bottom: -22,
    fontFamily: Fonts.BOLD,
    fontSize: 70,
    lineHeight: 78,
    letterSpacing: -3,
    opacity: 0.09,
    zIndex: 1,
  },

  racingCheckeredPattern: {
    position: "absolute",
    top: -14,
    right: -12,
    width: 108,
    flexDirection: "row",
    flexWrap: "wrap",
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
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  messageAvatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 9,
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
    borderRadius: 5,
    borderWidth: 1.5,
    backgroundColor: Colors.dark.leafGreen,
  },

  messageHeaderTextWrap: {
    maxWidth: HEADER_WIDTH * 0.54,
    justifyContent: "center",
  },

  messageUsernameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  messageUsername: {
    flexShrink: 1,
    fontSize: 15,
    fontFamily: Fonts.BOLD,
  },

  messageFullName: {
    marginTop: 1,
    fontSize: 11,
    fontFamily: Fonts.REGULAR,
  },

  profileMenuAnchor: {
    position: "relative",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    elevation: 50,
  },

  profileHeaderActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  profileSubmenu: {
    position: "absolute",
    top: 38,
    right: 0,
    width: 150,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: Colors.black,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 18,
    overflow: "hidden",
  },

  profileSubmenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },

  profileSubmenuIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  profileSubmenuText: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.BOLD,
  },

  profileSubmenuSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 42,
  },

  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  headerActionButtonPressed: {
    opacity: 0.65,
  },
});

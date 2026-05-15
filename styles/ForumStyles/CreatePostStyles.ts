import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const createPostStyles = (isDark: boolean) =>
  StyleSheet.create({
    // ─── Screen / scroll ────────────────────────────────────────────────
    container: {
      flexGrow: 1,
      paddingBottom: 40,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    // ─── User identity row ───────────────────────────────────────────────
    userRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingTop: 14,
      paddingBottom: 8,
      gap: 10,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    avatarImage: {
      width: 38,
      height: 38,
      resizeMode: "cover",
    },

    userInfo: {
      flexDirection: "column",
      gap: 2,
    },
    username: {
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.white : Colors.black,
      lineHeight: 18,
    },
    audiencePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      alignSelf: "flex-start",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    audiencePillText: {
      fontSize: 11,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    // ─── Text composer ───────────────────────────────────────────────────
    textContainer: {
      flex: 1,
    },
    textInput: {
      minHeight: 120,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      textAlignVertical: "top",
      color: isDark ? Colors.white : Colors.black,
      backgroundColor: "transparent",
    },

    // ─── Media strip (inline thumbnails) ────────────────────────────────
    mediaStrip: {
      paddingHorizontal: 12,
      paddingBottom: 12,
      overflow: "visible",
    },
    mediaThumb: {
      width: 80,
      height: 80,
      borderRadius: 10,
      marginRight: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    mediaThumbImage: {
      width: 80,
      height: 80,
      borderRadius: 10,
    },
    mediaAddButton: {
      width: 80,
      height: 80,
      borderRadius: 10,
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      alignItems: "center",
      justifyContent: "center",
    },
    mediaBadge: {
      position: "absolute",
      left: 5,
      bottom: 5,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: "rgba(0,0,0,0.7)",
    },
    mediaBadgeText: {
      color: Colors.white,
      fontSize: 10,
      fontFamily: Fonts.OSBOLD,
    },
    removeButton: {
      position: "absolute",
      top: 3,
      right: 3,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: "rgba(0,0,0,0.6)",
      alignItems: "center",
      justifyContent: "center",
    },

    // ─── Divider ─────────────────────────────────────────────────────────
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    // ─── Toolbar ─────────────────────────────────────────────────────────
    toolbar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 4,
    },
    toolBtn: {
      width: 40,
      height: 40,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    toolBtnActive: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    toolGifLabel: {
      fontSize: 11,
      fontFamily: Fonts.OSBOLD,
      letterSpacing: 0.5,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      borderWidth: 1.5,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 2,
      overflow: "hidden",
    },
    toolSpacer: {
      flex: 1,
    },
    charCountRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    charCountLabel: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.darkGray : Colors.lightGray,
    },

    // ─── Poll card ───────────────────────────────────────────────────────
    pollCardContainer: {
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      overflow: "hidden",
    },
    pollQuestion: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 6,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 8,
      marginHorizontal: 12,
      marginBottom: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    pollOptionsText: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 13,
      fontFamily: Fonts.OSREGULAR,
    },
    metaContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingTop: 6,
      paddingBottom: 10,
    },
    pollDuration: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    pollDurationText: {
      fontSize: 11,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    pollRemoveContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    pollRemoveButton: {
      fontFamily: Fonts.OSREGULAR,
      color: Colors.midTone,
      fontSize: 11,
    },

    // ─── Bottom bar ──────────────────────────────────────────────────────
    bottom: {
      gap: 20,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    bottomBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    teamBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    teamDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.dark.blue : Colors.light.blue,
    },
    teamBadgeText: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    mediaCountText: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.darkGray : Colors.lightGray,
    },

    // ─── Legacy / kept for modals ────────────────────────────────────────
    label: {
      fontSize: 18,
      fontFamily: Fonts.OSREGULAR,
      marginBottom: 12,
      color: isDark ? Colors.white : Colors.black,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    thumbnail: {
      width: 80,
      height: 80,
      borderRadius: 10,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      justifyContent: "center",
      alignItems: "center",
    },
    // kept as alias so renderMediaItem still compiles
    thumnailPreview: {
      width: 80,
      height: 80,
      borderRadius: 10,
    },
    imageContainer: {
      overflow: "visible",
      marginBottom: 12,
    },
    addMediaText: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 16,
      marginLeft: 4,
    },
    mediaItem: {
      marginRight: 8,
      position: "relative",
      overflow: "visible",
    },
    postOptionsContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
    postOptionsWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flex: 1,
      paddingVertical: 12,
    },
    postOptionsInnerWrapper: {
      flexDirection: "row",
      alignItems: "center",
    },
  });

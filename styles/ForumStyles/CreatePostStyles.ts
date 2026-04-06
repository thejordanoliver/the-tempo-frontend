import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const createPostStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      paddingBottom: 100,
    },
    label: {
      fontSize: 18,
      fontFamily: Fonts.OSREGULAR,
      marginBottom: 12,
      color: isDark ? Colors.white : Colors.black,
    },
    textContainer: {
      height: "auto",
    },
    textInput: {
      minHeight: 200,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      textAlignVertical: "top",
      color: isDark ? Colors.white : Colors.black,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    mediaItem: {
      marginRight: 10,
      position: "relative",
      overflow: "visible",
    },
    addMediaText: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 16,
      marginLeft: 4,
    },
    thumbnail: {
      width: 200,
      height: 200,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      justifyContent: "center",
      alignItems: "center",
    },
    thumnailPreview: {
      width: 200,
      height: 200,
      resizeMode: "cover",
      borderRadius: 8,
      marginTop: 20,
    },
    removeButton: {
      position: "absolute",
      top: 8,
      right: -10,
      borderRadius: 999,
      backgroundColor: Colors.black,
      borderWidth: 2,
      borderColor: Colors.white,
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
    postOptionsInnerWrapper: { flexDirection: "row", alignItems: "center" },

    pollCardContainer: {
      overflow: "hidden",
    },

    pollQuestion: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 15,
      fontFamily: Fonts.OSBOLD,
      marginBottom: 10,
    },

    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 10,
      marginBottom: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: isDark ? Colors.white : Colors.black,
    },

    pollOptionsText: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
    },

    metaContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 10,
    },
    pollRemoveContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
    pollRemoveButton: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.midTone : Colors.midTone,
      fontSize: 12,
    },
  });

import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const formStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      margin: 12,
      backgroundColor: isDark ? Colors.black : Colors.white,
      marginBottom: 30,
    },

    formContainer: {
      flex: 1,
      justifyContent: "space-around",
      gap: 12,
    },

    formWrapper: {
      flex: 1,
      justifyContent: "center",
      gap: 12,
    },

    signInInput: {
      width: "100%",
      color: isDark ? Colors.white : Colors.black,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      padding: 16,
      borderRadius: 8,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
    },

    input: {
      color: isDark ? Colors.white : Colors.black,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      padding: 20,
      borderRadius: 8,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
    },
    passwordInput: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
      padding: 20,
    },
    passwordText: {
      flex: 1,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
    },

    button: {
      backgroundColor: isDark ? Colors.white : Colors.black,
      padding: 14,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: {
      color: isDark ? Colors.black : Colors.white,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
    },
    row: {
      flexDirection: "column",
      justifyContent: "space-between",
    },
    logo: {
      width: 50,
      height: 50,
      resizeMode: "contain",
    },

    teamName: {
      marginLeft: 16,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
    },

    imageUploadBox: {
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 10,
      height: 100,
      justifyContent: "center",
      alignItems: "center",
    },
    profileImageUploadBox: {
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 100,
      height: 120,
      width: 120,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
    },

    heading: {
      fontSize: 16,
      fontFamily: Fonts.OSMEDIUM,
      marginTop: 8,
      paddingBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      color: isDark ? Colors.white : Colors.black,
    },

    reviewInput: {
      width: "100%",
      marginTop: 16,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },

    reviewContainer: {
      justifyContent: "center",
      alignContent: "center",
      paddingHorizontal: 8,
      paddingBottom: 24,
    },
    favoritesScroll: {
      maxHeight: 280,
      marginTop: 8,
    },
    imagePreview: {
      height: 120,
      width: 120,
      borderRadius: 100,
      alignSelf: "center",
    },
    imagePlaceholder: {
      color: isDark ? Colors.darkGray : Colors.lightGray,
      textAlign: "center",
      fontFamily: Fonts.OSLIGHT,
      fontSize: 12,
    },
    reviewText: {
      marginVertical: 8,
      color: isDark ? Colors.light.itemBackground : "#333",
      fontFamily: Fonts.OSREGULAR,
    },
    progressBarBackground: {
      height: 2,
      width: "100%",
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 100,
      overflow: "hidden",
      marginBottom: 10,
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: "#007AFF",
    },
    skipText: {
      color: Colors.midTone,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
    },
    teamCardList: {
      flexDirection: "row",
      flex: 1,
      alignItems: "center",
      marginTop: 12,
      padding: 12,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
    },
    teamCardGrid: {
      flexDirection: "column",
      flex: 0, // important: don't stretch full width
      alignItems: "center",
      marginTop: 12,
      padding: 12,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
      width: "30%", // or fixed width to fit 3 columns nicely
      maxWidth: 120, // optional max width for consistency
    },

    tabBarWrapper: { paddingHorizontal: 80 },
  });

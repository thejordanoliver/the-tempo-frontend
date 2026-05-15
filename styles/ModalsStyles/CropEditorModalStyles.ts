import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const cropEditorModalStyles = (
  isDark: boolean,
  isProfile: boolean,
  cropWidth: number,
  cropHeight: number,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    wrapper: {
      padding: 12,
      flex: 1,
      justifyContent: "flex-start",
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 20,
    },

    headerBtn: { padding: 8 },
    headerTitle: {
      fontSize: 18,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },
    cropContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      marginTop: 12,
      color: Colors.white,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
    },
    cropBox: {
      borderWidth: 2,
      overflow: "hidden",
      backgroundColor: Colors.black,
    },
    imageContainer: {
      width: cropWidth,
      height: cropHeight,
      borderRadius: isProfile ? cropHeight / 2 : 8,
      overflow: "hidden",
      backgroundColor: Colors.black,
      alignItems: "center",
      justifyContent: "center",
    },
    cropFrame: {
      ...StyleSheet.absoluteFillObject,
      borderColor: isDark ? Colors.white : Colors.black,
      borderWidth: 2,
      borderRadius: isProfile ? cropHeight / 2 : 8,
    },
    controlsContainer: {
      paddingVertical: 20,
      paddingHorizontal: 16,
    },
    controlRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      marginBottom: 12,
    },
    controlButton: {
      alignItems: "center",
      padding: 8,
    },
    controlButtonDisabled: {
      opacity: 0.5,
    },
    controlLabel: {
      marginTop: 4,
      color: Colors.white,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
    },
    controlLabelDisabled: {
      color: Colors.darkGray,
    },
    scaleIndicator: {
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 16,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingHorizontal: 40,
      paddingVertical: 20,
    },
    cancelButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      flex: 1,
      marginRight: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    saveButton: {
      backgroundColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      flex: 1,
      marginLeft: 8,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    saveText: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 18,
    },
    cancelText: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 18,
    },
    buttonTextDisabled: {
      opacity: 0.5,
    },
  });

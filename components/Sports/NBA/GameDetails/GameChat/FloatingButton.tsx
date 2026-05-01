import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function FloatingChatButton({
  openChat,
}: {
  openChat: () => void;
}) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = floatingButtonStyles(isDark);

  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={openChat}
      activeOpacity={0.8}
    >
      <Ionicons
        name="chatbubble"
        size={24}
        color={isDark ? Colors.black : Colors.white}
      />
    </TouchableOpacity>
  );
}

const floatingButtonStyles = (isDark: boolean) =>
  StyleSheet.create({
    floatingButton: {
      alignSelf: "flex-end",
      alignContent: "center",
      justifyContent: "center",
      flexDirection: "row",
      backgroundColor: isDark ? Colors.white : Colors.black,
      paddingVertical: 20,
      paddingHorizontal: 20,
      borderRadius: 100,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.5 : 0.3,
      shadowRadius: 4.65,
      elevation: 7,
      zIndex: 999,
      marginHorizontal: 20,
    },
    buttonText: {
      color: isDark ? Colors.black : Colors.white,
      textAlign: "center",
      textAlignVertical: "center",
      fontSize: 16,
      fontFamily: Fonts.OSBOLD,
    },
  });

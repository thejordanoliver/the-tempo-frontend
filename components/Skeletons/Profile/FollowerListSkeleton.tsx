import { SkeletonBlock, SkeletonCircle } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { StyleSheet, View } from "react-native";

export default function FollowerListSkeleton() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = followersListStyles(isDark);

  return (
    <View style={styles.container}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index} style={styles.itemRow}>
          <View key={index} style={styles.itemContainer}>
            <View key={index} style={styles.userRow}>
              <SkeletonCircle size={44} style={styles.avatarContainer} />
              <SkeletonBlock style={styles.username} />
            </View>
          </View>
          <SkeletonBlock style={styles.buttonContainer} />
        </View>
      ))}
    </View>
  );
}

export const followersListStyles = (isDark: boolean) => {
  const skeletonColor = isDark ? Colors.darkGray : Colors.lightGray;

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    itemContainer: {
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    username: {
      width: 60,
      height: 12,
      marginTop: 6,
      borderRadius: 4,
      backgroundColor: skeletonColor,
    },
    avatarContainer: {
      marginRight: 12,
      borderRadius: 100,
      backgroundColor: skeletonColor,
    },
    userRow: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.midTone,
    },
    mutalIcon: { marginRight: 6 },
    buttonContainer: {
      width: 80,
      padding: 16,
      overflow: "hidden",
    },
  });
};

import { SkeletonBlock, SkeletonCircle } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { StyleSheet, View } from "react-native";

export default function SearchItemSkeleton() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getStyles(isDark);

  const borderBottomColor = isDark ? Colors.darkGray : Colors.midTone;

  return (
    <View style={[styles.card, { borderBottomColor }]}>
      {/* Top Team */}
      <View style={styles.itemContainer}>
        <SkeletonCircle size={44} style={styles.avatarContainer} />
        <View style={styles.textContainer}>
          <SkeletonBlock style={styles.name} />

          <SkeletonBlock style={styles.subText} />
        </View>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-evenly",
      borderBottomWidth: 1,
      borderRadius: 8,
    },
    itemContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingVertical: 12,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    avatarContainer: {
      width: 44,
      height: 44,
      marginRight: 12,
      borderRadius: 24,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      overflow: "hidden",
    },
    textContainer: {
      gap: 4,
    },
    name: {
      width: 120,
      height: 10,
      borderRadius: 24,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      color: isDark ? Colors.white : Colors.black,
    },
    subText: {
      width: 50,
      height: 8,
      borderRadius: 24,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      color: isDark ? Colors.white : Colors.black,
    },
  });

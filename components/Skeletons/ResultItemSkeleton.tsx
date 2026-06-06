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
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "space-evenly",
      borderBottomWidth: 1,
    },
    itemContainer: {
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      flex: 1,
    },
    avatarContainer: {
      width: 44,
      height: 44,
      borderRadius: 24,
      marginRight: 12,
      overflow: "hidden",
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    textContainer: {
      gap: 4,
    },
    name: {
      height: 10,
      width: 120,
      borderRadius: 24,
      color: isDark ? Colors.white : Colors.black,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    subText: {
      height: 8,
      width: 50,
      borderRadius: 24,
      color: isDark ? Colors.white : Colors.black,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });

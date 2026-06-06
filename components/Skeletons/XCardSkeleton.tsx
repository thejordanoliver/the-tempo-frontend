import { SkeletonBlock } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { StyleSheet, View } from "react-native";

export const XCARD_WIDTH = 240;
export const XCARD_HEIGHT = 280;

export default function XCardSkeleton() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = xCardStyles(isDark);

  return (
    <View style={styles.container}>
      <SkeletonBlock style={styles.thumbnail} />

      <View style={styles.body}>
        <View style={styles.authorRow}>
          <View style={styles.authorInfo}>
            <SkeletonBlock width={120} height={14} radius={7} />
          </View>
        </View>

        <View style={styles.footer}>
          <SkeletonBlock
            width={44}
            height={12}
            radius={6}
            style={styles.metricContainer}
          />
          <SkeletonBlock
            width={44}
            height={12}
            radius={6}
            style={styles.metricContainer}
          />

          <SkeletonBlock
            width={28}
            height={12}
            radius={6}
            style={styles.metricRight}
          />
        </View>
      </View>
    </View>
  );
}

export const xCardStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: XCARD_WIDTH,
      height: XCARD_HEIGHT,
      borderWidth: 0.5,
      borderRadius: 12,
      borderColor: Colors.midTone,
      backgroundColor: isDark ? Colors.black : Colors.white,
      overflow: "hidden",
      flexDirection: "column",
      marginBottom: 12,
    },
    thumbnail: {
      width: "100%",
      height: 120,
      flexShrink: 0,
    },
    body: {
      flex: 1,
      padding: 12,
      gap: 10,
      flexDirection: "column",
    },
    authorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    authorInfo: {
      flex: 1,
      gap: 1,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    metricContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    name: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 13,
      flexShrink: 1,
    },
    username: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    verifiedIcon: {
      width: 13,
      height: 13,
    },
    text: {
      fontSize: 12,
      lineHeight: 18,
      color: isDark ? Colors.white : Colors.black,
      flex: 1,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingTop: 8,
      borderTopWidth: 0.5,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    metric: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    metricRight: {
      marginLeft: "auto",
    },
  });

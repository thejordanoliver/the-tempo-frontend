import { SkeletonBlock } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { StyleSheet, View } from "react-native";

export default function NewsCardSkeleton() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = newsCardSkeletonStyles(isDark);

  return (
    <View style={styles.card}>
      {/* Thumbnail */}
      <SkeletonBlock style={styles.thumbnail} />

      <View style={styles.content}>
        {/* Title */}
        <SkeletonBlock style={styles.title} />

        {/* Source */}
        <SkeletonBlock style={styles.source} />
      </View>
    </View>
  );
}

const newsCardSkeletonStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 8,
      overflow: "hidden",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderWidth: 1,
    },

    content: {
      padding: 12,
    },

    thumbnail: {
      height: 300,
      width: "100%",
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    title: {
      height: 16,
      width: "60%",
      borderRadius: 8,
      marginTop: 12,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    source: {
      height: 12,
      width: "20%",
      borderRadius: 8,
      marginTop: 10,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });

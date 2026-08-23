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
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
    },

    content: {
      padding: 12,
    },

    thumbnail: {
      width: "100%",
      height: 300,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    title: {
      width: "60%",
      height: 16,
      marginTop: 12,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    source: {
      width: "20%",
      height: 12,
      marginTop: 10,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });

// components/NewsArticleSkeleton.tsx
import { SkeletonBlock } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { StyleSheet, View } from "react-native";
export default function NewsArticleSkeleton() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = newsArticleSkeletonStyles(isDark);

  return (
    <View style={styles.container}>
      {/* Title placeholders */}
      <SkeletonBlock style={styles.title} />
      <SkeletonBlock style={styles.titleRowTwo} />

      {/* Image placeholder */}
      <SkeletonBlock style={styles.image} />

      {/* Content line placeholders */}
      {[...Array(12)].map((_, i) => (
        <SkeletonBlock
          key={i}
          style={[styles.contentLine, { width: i === 11 ? "70%" : "100%" }]}
        />
      ))}
    </View>
  );
}

const newsArticleSkeletonStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { paddingHorizontal: 12 },

    title: {
      height: 28,
      width: "60%",
      borderRadius: 8,
      marginBottom: 20,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    titleRowTwo: {
      height: 28,
      width: "80%",
      borderRadius: 8,
      marginBottom: 20,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    image: {
      height: 180,
      width: "100%",
      borderRadius: 8,
      marginBottom: 20,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    contentLine: {
      height: 16,
      borderRadius: 8,
      marginBottom: 12,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
  });

import { SkeletonBlock } from "components/Skeletons/primitives";
import { usePreferences } from "contexts/PreferencesContext";
import { View, useWindowDimensions } from "react-native";
import {
  NewsCardSkeletonStyles,
  NewsCardStyles,
} from "styles/NewsStyles/NewsCardStyles";

export default function NewsCardSkeleton() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const { width } = useWindowDimensions();
  const cardStyles = NewsCardStyles(isDark, width);
  const styles = NewsCardSkeletonStyles(isDark, width);

  return (
    <View style={cardStyles.card}>
      <SkeletonBlock style={[cardStyles.thumbnail, styles.thumbnail]} />

      <View style={cardStyles.details}>
        <View style={styles.headline}>
          <View style={styles.headlineRow}>
            <SkeletonBlock style={styles.title} />
          </View>
          <View style={styles.headlineRow}>
            <SkeletonBlock style={[styles.title, styles.titleSecondLine]} />
          </View>
        </View>

        <View style={styles.metadataRow}>
          <SkeletonBlock style={styles.source} />
        </View>

        <View style={[cardStyles.timeContainer, styles.metadataRow]}>
          <SkeletonBlock style={styles.date} />
          <SkeletonBlock style={styles.timeAgo} />
        </View>
      </View>
    </View>
  );
}

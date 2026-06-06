import { SkeletonBlock } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type HeaderSkeletonProps = {
  style?: StyleProp<ViewStyle>;
};

export default function HeaderSkeleton({ style }: HeaderSkeletonProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = skeletonStyles(isDark);

  return (
    <View
      style={[
        styles.container,
        style,
        { borderBottomColor: isDark ? Colors.darkGray : Colors.midTone },
      ]}
    >
      <SkeletonBlock height={28} width={160} radius={6} />
    </View>
  );
}

const skeletonStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingBottom: 4,
      marginBottom: 12,
      borderBottomWidth: 1,
    },
  });

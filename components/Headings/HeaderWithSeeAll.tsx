import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  onPressSeeAll: () => void;
};

const HeaderWithSeeAll: React.FC<Props> = ({
  title,
  subtitle,
  onPressSeeAll,
}) => {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = HeaderWithSeeAllStyles(isDark);

  return (
    <View style={styles.favoritesHeader}>
      <View style={styles.titleContainer}>
        <Text style={styles.heading}>{title}</Text>

        {subtitle ? (
          <Text selectable style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}: see all`}
        onPress={onPressSeeAll}
        hitSlop={10}
      >
        <Text selectable style={styles.seeAll}>
          See all
        </Text>
      </Pressable>
    </View>
  );
};

const HeaderWithSeeAllStyles = (isDark: boolean) =>
  StyleSheet.create({
    favoritesHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
    titleContainer: {
      flex: 1,
      gap: 2,
    },
    seeAll: {
      color: isDark ? Colors.dark.blue : Colors.light.blue,
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
    },
    heading: {
      fontSize: 20,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },
    subtitle: {
      fontSize: 13,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });

export default HeaderWithSeeAll;

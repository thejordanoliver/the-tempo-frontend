// components/NBA/DraftNewsCard.tsx
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { BreakingNews } from "hooks/LeagueHooks/useLeagueDraft";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const CARD_WIDTH = 200;
export const CARD_SEPARATOR = 12;

type Props = {
  item: BreakingNews;
};

export default function DraftNewsCard({ item }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getStyles(isDark);

  const timeAgo = formatDistanceToNow(new Date(item.timestamp), {
    addSuffix: true,
  });

  return (
    <View style={styles.card}>
      <Text numberOfLines={2} ellipsizeMode="tail" style={styles.title}>
        {item.title}
      </Text>
      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.timeText}>
        {timeAgo}
      </Text>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      width: CARD_WIDTH,
      padding: 12,
      gap: 6,
      justifyContent: "space-between",
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    title: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 13,
      color: isDark ? Colors.dark.white : Colors.light.black,
    },
    timeText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 11,
      color: Colors.midTone,
    },
  });

// components/NBA/DraftNewsList.tsx
import HeadingThree from "components/Headings/HeadingThree";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useDraft } from "hooks/LeagueHooks/useLeagueDraft";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DraftNewsCard, { CARD_SEPARATOR, CARD_WIDTH } from "./DraftNewsCard";

// Width occupied by one card + its trailing separator
const ITEM_STRIDE = CARD_WIDTH + CARD_SEPARATOR;

// Pixels per second the ticker travels
const TICKER_SPEED = 40;

type Props = {
  year: string;
  league: "nba" | "wnba" | "nfl";
};

export default function DraftNewsList({ year, league }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = draftNewsList(isDark);
  const global = globalStyles(isDark);
  const tickerX = useRef(new Animated.Value(0)).current;
  const { draft, loading, error } = useDraft(league, Number(year));

  const news = draft?.breakingNews ?? [];

  // Total pixel width of one full set of items
  const singleSetWidth = news.length * ITEM_STRIDE;

  useEffect(() => {
    if (singleSetWidth === 0) return;

    // Duration so speed stays constant regardless of item count
    const duration = (singleSetWidth / TICKER_SPEED) * 1000;

    tickerX.setValue(0);

    const animation = Animated.loop(
      Animated.timing(tickerX, {
        toValue: -singleSetWidth,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();
    return () => animation.stop();
  }, [singleSetWidth]);

  if (error)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Error: {String(error)}</Text>
      </View>
    );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="small"
          color={isDark ? Colors.dark.white : Colors.light.black}
        />
      </View>
    );

  if (news.length === 0) return null;

  // Duplicate items so the second set is always ready to fill the gap
  const tickerItems = [...news, ...news];

  return (
    <View style={styles.container}>
      <HeadingThree>Headlines</HeadingThree>

      {/* Clip the scrolling row to the container bounds */}
      <View style={styles.tickerWindow}>
        <Animated.View
          style={[styles.tickerRow, { transform: [{ translateX: tickerX }] }]}
        >
          {tickerItems.map((item, index) => (
            <React.Fragment key={`${item.id}-${index}`}>
              <DraftNewsCard item={item} />
              {/* Separator after every card except the last one */}
              {index < tickerItems.length - 1 && (
                <View style={styles.separator} />
              )}
            </React.Fragment>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const draftNewsList = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 12,
    },
    tickerWindow: {
      overflow: "hidden",
      marginTop: 4,
    },
    tickerRow: {
      flexDirection: "row",
      alignItems: "stretch",
    },
    separator: {
      width: CARD_SEPARATOR,
    },
    center: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 24,
    },
  });

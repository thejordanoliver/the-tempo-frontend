import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import type { EventOddsBookmaker } from "hooks/OddsHooks/useEventOdds";
import { useEventOdds } from "hooks/OddsHooks/useEventOdds";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type EventOddsMarket = EventOddsBookmaker["markets"][number];
type EventOddsOutcome = EventOddsMarket["outcomes"][number];

type DisplayMarket = {
  key: string;
  last_update?: string;
  outcomes: EventOddsOutcome[];
};

type DisplayOutcomeRow = {
  key: string;
  selection: string;
  point?: number | null;
  over?: EventOddsOutcome;
  under?: EventOddsOutcome;
};

export type EventOddsCardProps = {
  league?: string;
  eventId?: string | null;
  homeId?: number | string | null;
  awayId?: number | string | null;
  commenceTime?: string | Date | null;
  markets?: string;
  title?: string;
  compact?: boolean;
  onPress?: () => void;
};

const COMPACT_MARKET_LIMIT = 1;
const COMPACT_ROW_LIMIT = 6;

function EventOddsCardComponent({
  league = "nba",
  eventId = null,
  homeId = null,
  awayId = null,
  commenceTime = null,
  markets,
  title,
  compact = false,
  onPress,
}: EventOddsCardProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const [isExpanded, setIsExpanded] = useState(false);

  const styles = useMemo(() => eventOddsCardStyles(isDark), [isDark]);

  const normalizedEventId = useMemo(
    () => normalizeOptionalString(eventId),
    [eventId],
  );

  const canLoadOdds = useMemo(() => {
    if (normalizedEventId) return true;
    return Boolean(homeId && awayId && commenceTime);
  }, [awayId, commenceTime, homeId, normalizedEventId]);

  const eventOddsParams = useMemo(
    () => ({
      league,
      eventId: normalizedEventId,
      homeId,
      awayId,
      commenceTime,
      markets,
      enabled: canLoadOdds,
    }),
    [
      league,
      normalizedEventId,
      homeId,
      awayId,
      commenceTime,
      markets,
      canLoadOdds,
    ],
  );

  const { game, matchedEvent, loading, error } = useEventOdds(eventOddsParams);

  useEffect(() => {
    setIsExpanded(false);
  }, [
    league,
    normalizedEventId,
    homeId,
    awayId,
    commenceTime,
    markets,
    compact,
  ]);

  const shouldCompact = compact && !isExpanded;

  const selectedBookmaker = useMemo(() => {
    const bookmakers = game?.bookmakers ?? [];

    return (
      bookmakers.find(
        (bookmaker) =>
          bookmaker.key?.toLowerCase() === "draftkings" ||
          bookmaker.title?.toLowerCase().includes("draftkings"),
      ) ??
      bookmakers[0] ??
      null
    );
  }, [game?.bookmakers]);

  const groupedMarkets = useMemo(
    () => groupMarketsByKey(selectedBookmaker?.markets ?? []),
    [selectedBookmaker?.markets],
  );

  const rowsByMarket = useMemo(() => {
    return groupedMarkets.map((market) => {
      const rows = groupOutcomesIntoRows(market.outcomes);

      return {
        market,
        rows,
      };
    });
  }, [groupedMarkets]);

  const visibleRowsByMarket = useMemo(() => {
    const visibleMarkets = shouldCompact
      ? rowsByMarket.slice(0, COMPACT_MARKET_LIMIT)
      : rowsByMarket;

    return visibleMarkets.map(({ market, rows }) => ({
      market,
      rows: shouldCompact ? rows.slice(0, COMPACT_ROW_LIMIT) : rows,
      totalRows: rows.length,
    }));
  }, [rowsByMarket, shouldCompact]);

  const totalRowCount = useMemo(
    () => rowsByMarket.reduce((total, item) => total + item.rows.length, 0),
    [rowsByMarket],
  );

  const visibleRowCount = useMemo(
    () =>
      visibleRowsByMarket.reduce((total, item) => total + item.rows.length, 0),
    [visibleRowsByMarket],
  );

  const hasHiddenOdds = useMemo(() => {
    if (!compact) return false;

    return (
      rowsByMarket.length > visibleRowsByMarket.length ||
      totalRowCount > visibleRowCount
    );
  }, [
    compact,
    rowsByMarket.length,
    totalRowCount,
    visibleRowCount,
    visibleRowsByMarket.length,
  ]);

  const matchup = useMemo(() => {
    const awayTeam = game?.away_team || matchedEvent?.away_team;
    const homeTeam = game?.home_team || matchedEvent?.home_team;

    if (!awayTeam || !homeTeam) return null;

    return `${awayTeam} at ${homeTeam}`;
  }, [
    game?.away_team,
    game?.home_team,
    matchedEvent?.away_team,
    matchedEvent?.home_team,
  ]);

  const displayCommenceTime = useMemo(
    () =>
      formatCommenceTime(
        game?.commence_time || matchedEvent?.commence_time || commenceTime,
      ),
    [commenceTime, game?.commence_time, matchedEvent?.commence_time],
  );

  const headerTitle = useMemo(
    () => title || matchup || "Event Odds",
    [title, matchup],
  );

  const headerSubtitle = useMemo(() => {
    const subtitleParts = [
      title && matchup ? matchup : null,
      displayCommenceTime,
    ].filter(Boolean);

    return subtitleParts.length > 0 ? subtitleParts.join(" - ") : null;
  }, [title, matchup, displayCommenceTime]);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((currentValue) => !currentValue);
  }, []);

  const renderMarketSection = useCallback(
    ({
      market,
      rows,
      marketIndex,
    }: {
      market: DisplayMarket;
      rows: DisplayOutcomeRow[];
      marketIndex: number;
    }) => (
      <View
        key={market.key}
        style={[
          styles.marketSection,
          marketIndex === 0 ? styles.firstMarketSection : null,
        ]}
      >
        <Text style={styles.marketTitle}>{formatMarketName(market.key)}</Text>

        <View style={styles.outcomeHeaderRow}>
          <Text style={styles.selectionHeaderText}>Selection</Text>
          <Text style={styles.lineHeaderText}>Line</Text>
          <Text style={styles.oddsHeaderText}>Over</Text>
          <Text style={styles.oddsHeaderText}>Under</Text>
        </View>

        {rows.map((row) => (
          <MemoizedOutcomeRow
            key={`${market.key}-${row.key}`}
            row={row}
            styles={styles}
          />
        ))}
      </View>
    ),
    [styles],
  );

  const headerContent = useMemo(
    () => (
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrapper}>
          <Text style={styles.titleText} numberOfLines={2}>
            {headerTitle}
          </Text>

          {headerSubtitle ? (
            <Text style={styles.subtitleText} numberOfLines={1}>
              {headerSubtitle}
            </Text>
          ) : null}
        </View>

        {loading && game ? (
          <CustomActivityIndicator size={22} thickness={3} />
        ) : null}
      </View>
    ),
    [game, headerSubtitle, headerTitle, loading, styles],
  );

  const toggleButton = useMemo(() => {
    if (!compact || (!hasHiddenOdds && !isExpanded)) return null;

    return (
      <Pressable
        accessibilityRole="button"
        onPress={handleToggleExpanded}
        style={({ pressed }) => [
          styles.viewMoreButton,
          pressed ? styles.viewMoreButtonPressed : null,
        ]}
      >
        <Text style={styles.moreText}>
          {isExpanded ? "View less odds" : "View more odds"}
        </Text>
      </Pressable>
    );
  }, [compact, handleToggleExpanded, hasHiddenOdds, isExpanded, styles]);

  const bodyContent = useMemo(() => {
    if (!canLoadOdds) {
      return null;
    }

    if (loading && !game) {
      return (
        <View style={styles.stateRow}>
          <CustomActivityIndicator size={26} thickness={3} />
          <Text style={styles.stateText}>Loading odds...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <Text style={[styles.stateText, styles.errorText]} numberOfLines={2}>
          {error}
        </Text>
      );
    }

    if (!game || !selectedBookmaker || rowsByMarket.length === 0) {
      return <Text style={styles.stateText}>No odds available yet.</Text>;
    }

    return (
      <>
        <View style={styles.bookmakerRow}>
          <Text style={styles.bookmakerLabel}>Bookmaker</Text>
          <Text style={styles.bookmakerTitle} numberOfLines={1}>
            {selectedBookmaker.title}
          </Text>
        </View>

        {visibleRowsByMarket.map(({ market, rows }, marketIndex) =>
          renderMarketSection({ market, rows, marketIndex }),
        )}

        {toggleButton}

        <View style={styles.footerRow}>
          <Text style={styles.footerText} numberOfLines={1}>
            Powered By: {selectedBookmaker.title}
          </Text>

          {displayCommenceTime ? (
            <Text style={styles.footerText} numberOfLines={1}>
              Commence Time: {displayCommenceTime}
            </Text>
          ) : null}
        </View>
      </>
    );
  }, [
    canLoadOdds,
    displayCommenceTime,
    error,
    game,
    loading,
    renderMarketSection,
    rowsByMarket.length,
    selectedBookmaker,
    styles,
    toggleButton,
    visibleRowsByMarket,
  ]);

  const cardContent = useMemo(
    () => (
      <>
        {headerContent}
        {bodyContent}
      </>
    ),
    [bodyContent, headerContent],
  );

  const pressableStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [
      styles.card,
      pressed ? styles.pressed : null,
    ],
    [styles],
  );

  if (!canLoadOdds) {
    return null;
  }

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={pressableStyle}
      >
        {cardContent}
      </Pressable>
    );
  }

  return <View style={styles.card}>{cardContent}</View>;
}

const OutcomeRow = ({
  row,
  styles,
}: {
  row: DisplayOutcomeRow;
  styles: ReturnType<typeof eventOddsCardStyles>;
}) => {
  const line = useMemo(() => formatPoint(row.point), [row.point]);

  const overPrice = useMemo(
    () => formatAmericanOdds(row.over?.price),
    [row.over?.price],
  );

  const underPrice = useMemo(
    () => formatAmericanOdds(row.under?.price),
    [row.under?.price],
  );

  return (
    <View style={styles.outcomeRow}>
      <View style={styles.outcomeNameColumn}>
        <Text style={styles.outcomeNameText} numberOfLines={1}>
          {row.selection}
        </Text>
      </View>

      <Text style={styles.lineText} numberOfLines={1}>
        {line}
      </Text>

      <Text style={styles.priceText} numberOfLines={1}>
        {overPrice}
      </Text>

      <Text style={styles.priceText} numberOfLines={1}>
        {underPrice}
      </Text>
    </View>
  );
};

const MemoizedOutcomeRow = memo(OutcomeRow);

function groupMarketsByKey(markets: EventOddsMarket[]): DisplayMarket[] {
  const marketMap = new Map<string, DisplayMarket>();

  markets.forEach((market) => {
    const existingMarket = marketMap.get(market.key);

    if (existingMarket) {
      marketMap.set(market.key, {
        ...existingMarket,
        outcomes: [...existingMarket.outcomes, ...market.outcomes],
      });
      return;
    }

    marketMap.set(market.key, {
      key: market.key,
      last_update: market.last_update,
      outcomes: [...market.outcomes],
    });
  });

  return Array.from(marketMap.values()).filter(
    (market) => market.outcomes.length > 0,
  );
}

function groupOutcomesIntoRows(
  outcomes: EventOddsOutcome[],
): DisplayOutcomeRow[] {
  const rowMap = new Map<string, DisplayOutcomeRow>();

  outcomes.forEach((outcome) => {
    const selection = outcome.description || outcome.name || "Unknown";
    const point = outcome.point ?? null;
    const key = `${selection}-${point ?? "no-line"}`;
    const outcomeName = outcome.name?.toLowerCase();

    const existingRow =
      rowMap.get(key) ||
      ({
        key,
        selection,
        point,
      } satisfies DisplayOutcomeRow);

    if (outcomeName === "over") {
      existingRow.over = outcome;
    } else if (outcomeName === "under") {
      existingRow.under = outcome;
    } else if (!existingRow.over) {
      existingRow.over = outcome;
    } else if (!existingRow.under) {
      existingRow.under = outcome;
    }

    rowMap.set(key, existingRow);
  });

  return Array.from(rowMap.values());
}

function formatMarketName(key: string) {
  const labels: Record<string, string> = {
    h2h: "H2H",
    spreads: "Spread",
    totals: "Total",
    player_assists: "Player Assists",
    player_points: "Player Points",
    player_rebounds: "Player Rebounds",
  };

  if (labels[key]) return labels[key];

  return key
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatAmericanOdds(price?: number | null) {
  if (price === null || price === undefined) return "-";
  return price > 0 ? `+${price}` : String(price);
}

function formatPoint(point?: number | null) {
  if (point === null || point === undefined) return "-";
  return String(point);
}

function formatCommenceTime(value?: string | Date | null) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

function normalizeOptionalString(value?: string | null) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

const eventOddsCardStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      paddingVertical: 12,
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    pressed: {
      opacity: 0.85,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      gap: 12,
    },
    headerTextWrapper: {
      flex: 1,
      minWidth: 0,
    },
    titleText: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSBOLD,
      fontSize: 15,
    },
    subtitleText: {
      marginTop: 2,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
    },
    bookmakerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 10,
    },
    bookmakerLabel: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSBOLD,
      fontSize: 12,
    },
    bookmakerTitle: {
      flex: 1,
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 13,
      textAlign: "right",
    },
    marketSection: {
      marginTop: 14,
    },
    firstMarketSection: {
      marginTop: 0,
    },
    marketTitle: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSBOLD,
      fontSize: 13,
      marginBottom: 8,
    },
    outcomeHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomColor: isDark ? Colors.midTone : Colors.lightGray,
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingBottom: 6,
      marginBottom: 2,
    },
    selectionHeaderText: {
      flex: 1,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSBOLD,
      fontSize: 12,
    },
    lineHeaderText: {
      width: 54,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSBOLD,
      fontSize: 12,
      textAlign: "center",
    },
    oddsHeaderText: {
      width: 58,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSBOLD,
      fontSize: 12,
      textAlign: "right",
    },
    outcomeRow: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 38,
      paddingVertical: 6,
      borderBottomColor: isDark
        ? Colors.transparentDarkGray
        : Colors.transparentLightGray,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    outcomeNameColumn: {
      flex: 1,
      minWidth: 0,
      paddingRight: 8,
    },
    outcomeNameText: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 14,
    },
    lineText: {
      width: 54,
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      textAlign: "center",
    },
    priceText: {
      width: 58,
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      textAlign: "right",
    },
    viewMoreButton: {
      alignSelf: "center",
      marginTop: 12,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: isDark
        ? Colors.transparentDarkGray
        : Colors.transparentLightGray,
    },
    viewMoreButtonPressed: {
      opacity: 0.75,
    },
    moreText: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 12,
      textAlign: "center",
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginTop: 12,
    },
    footerText: {
      flexShrink: 1,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
    },
    stateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 8,
    },
    stateText: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 13,
    },
    errorText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });

export const EventOddsCard = memo(EventOddsCardComponent);
export default EventOddsCard;

import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { useRouter } from "expo-router";
import { NewsArticle, useAllNews } from "hooks/NewsHooks/useAllNews";
import { ReactNode } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ExploreWidgetSize } from "types/widgets";

type NewsWidgetProps = {
  isDark: boolean;
  size?: ExploreWidgetSize;
  containerWidth?: number;
  containerHeight?: number;
  controls?: ReactNode;
  onRemove?: () => void;
};

const rowsBySize: Record<ExploreWidgetSize, number> = {
  small: 2,
  medium: 4,
  large: 6,
};

const getNewsLayout = ({
  size,
  compact,
  containerHeight,
}: {
  size: ExploreWidgetSize;
  compact: boolean;
  containerHeight?: number;
}) => {
  const preferredRows = compact ? 2 : rowsBySize[size];
  const rowGap = compact ? 8 : 10;
  const defaultRowHeight = compact ? 52 : 62;

  if (!containerHeight) {
    return {
      rowCount: preferredRows,
      rowHeight: defaultRowHeight,
      rowGap,
    };
  }

  const verticalPadding = compact ? 20 : 28;
  const headerHeight = compact ? 20 : 34;
  const cardGap = compact ? 9 : 12;
  const availableListHeight =
    containerHeight - verticalPadding - headerHeight - cardGap;
  const rowsThatFit = Math.floor(
    (availableListHeight + rowGap) / (defaultRowHeight + rowGap),
  );
  const rowCount = Math.max(1, Math.min(preferredRows, rowsThatFit));
  const rowHeight =
    (availableListHeight - rowGap * (rowCount - 1)) / rowCount;

  return {
    rowCount,
    rowHeight,
    rowGap,
  };
};

const formatDate = (published?: string) => {
  if (!published) return "";
  const date = new Date(published);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

function NewsRow({
  article,
  isDark,
  compact,
  rowHeight,
}: {
  article: NewsArticle;
  isDark: boolean;
  compact: boolean;
  rowHeight: number;
}) {
  const router = useRouter();
  const styles = newsWidgetStyles(isDark, compact, rowHeight);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.newsRow}
      onPress={() =>
        router.push({
          pathname: "/news/[id]",
          params: { id: String(article.id) },
        })
      }
    >
      {article.image ? (
        <Image source={{ uri: article.image }} style={styles.thumbnail} />
      ) : (
        <View style={styles.thumbnailFallback}>
          <Ionicons
            name="newspaper-outline"
            size={18}
            color={isDark ? Colors.white : Colors.black}
          />
        </View>
      )}
      <View style={styles.newsBody}>
        <Text style={styles.headline} numberOfLines={2}>
          {article.headline}
        </Text>
        <View style={styles.metaRow}>
          {article.byline && (
            <Text style={styles.metaText} numberOfLines={1}>
              {article.byline}
            </Text>
          )}
          <Text style={styles.metaText}>{formatDate(article.published)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function NewsWidget({
  isDark,
  size = "medium",
  containerWidth,
  containerHeight,
  controls,
  onRemove,
}: NewsWidgetProps) {
  const compact =
    size === "small" || (containerWidth != null && containerWidth < 240);
  const { rowCount, rowHeight, rowGap } = getNewsLayout({
    size,
    compact,
    containerHeight,
  });
  const styles = newsWidgetStyles(isDark, compact, rowHeight, rowGap);
  const { articles, loading, error, refresh } = useAllNews(6);

  return (
    <View
      style={[styles.card, containerHeight ? { height: containerHeight } : null]}
    >
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            Trending News
          </Text>
          {!compact && (
            <Text style={styles.subtitle}>Latest stories across sports</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity activeOpacity={0.85} onPress={refresh}>
            <Ionicons
              name="refresh"
              size={17}
              color={isDark ? Colors.lightGray : Colors.darkGray}
            />
          </TouchableOpacity>
          {controls}
          {onRemove && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onRemove}
              style={styles.removeButton}
            >
              <Ionicons
                name="close"
                size={16}
                color={isDark ? Colors.white : Colors.black}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>Loading news...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.errorText}>Failed to load news</Text>
        </View>
      ) : articles.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>No stories available.</Text>
        </View>
      ) : (
        <View style={styles.newsList}>
          {articles.slice(0, rowCount).map((article) => (
            <NewsRow
              key={article.keyId ?? String(article.id)}
              article={article}
              isDark={isDark}
              compact={compact}
              rowHeight={rowHeight}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const newsWidgetStyles = (
  isDark: boolean,
  compact: boolean,
  rowHeight?: number,
  rowGap?: number,
) =>
  StyleSheet.create({
    card: {
      borderRadius: 8,
      padding: compact ? 10 : 14,
      gap: compact ? 9 : 12,
      overflow: "hidden",
      borderColor: Colors.midTone,
      borderWidth: 1,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    titleWrap: {
      flex: 1,
      minWidth: 0,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: compact ? 8 : 12,
    },
    title: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: compact ? 15 : 18,
      color: isDark ? Colors.white : Colors.black,
    },
    subtitle: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    removeButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.darkGray : Colors.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    newsList: {
      flex: 1,
      minHeight: 0,
      gap: rowGap ?? (compact ? 8 : 10),
    },
    newsRow: {
      height: rowHeight,
      flexDirection: "row",
      gap: compact ? 7 : 10,
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    thumbnail: {
      width: compact ? 44 : 68,
      height: compact ? 44 : 52,
      borderRadius: 6,
      resizeMode: "cover",
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    thumbnailFallback: {
      width: compact ? 44 : 68,
      height: compact ? 44 : 52,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    newsBody: {
      flex: 1,
      gap: 5,
    },
    headline: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: compact ? 12 : 14,
      lineHeight: compact ? 16 : 18,
      color: isDark ? Colors.white : Colors.black,
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 6,
    },
    metaText: {
      flexShrink: 1,
      fontFamily: Fonts.OSREGULAR,
      fontSize: compact ? 10 : 11,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    stateCard: {
      minHeight: 76,
      justifyContent: "center",
      alignItems: "center",
    },
    stateText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 13,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    errorText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 13,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });

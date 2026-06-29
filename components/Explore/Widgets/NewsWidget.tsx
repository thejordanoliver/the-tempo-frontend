import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, activeOpacity } from "constants/styles";
import { useRouter } from "expo-router";
import { NewsArticle, useAllNews } from "hooks/NewsHooks/useAllNews";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ExploreWidgetSize } from "types/widgets";
import { WidgetEditControls } from "./WidgetSlider";

type NewsWidgetProps = {
  isDark: boolean;
  size?: ExploreWidgetSize;
  containerWidth?: number;
  containerHeight?: number;
  widgetId?: string;
  widgetSize?: ExploreWidgetSize;
  isEditing?: boolean;
  availableSizeOptions?: ExploreWidgetSize[];
  onResizeWidget?: (widgetId: string, size: ExploreWidgetSize) => void;
  onRemoveWidget?: (widgetId: string) => void;
  onMoveWidget?: (widgetId: string, direction: -1 | 1) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
};

const rowsBySize: Record<ExploreWidgetSize, number> = {
  small: 2,
  medium: 4,
  large: 6,
};

const articlesBySize: Record<ExploreWidgetSize, number> = {
  small: 8,
  medium: 12,
  large: 18,
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
  const availableListHeight = containerHeight - verticalPadding;
  const rowsThatFit = Math.floor(
    (availableListHeight + rowGap) / (defaultRowHeight + rowGap),
  );
  const rowCount = Math.max(1, Math.min(preferredRows, rowsThatFit));
  const rowHeight = Math.max(
    compact ? 48 : 56,
    (availableListHeight - rowGap * (rowCount - 1)) / rowCount,
  );

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
      activeOpacity={activeOpacity}
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
          {article.byline ? (
            <Text style={styles.metaText} numberOfLines={1}>
              {article.byline}
            </Text>
          ) : (
            <View style={styles.metaSpacer} />
          )}

          <Text style={styles.metaText} numberOfLines={1}>
            {formatDate(article.published)}
          </Text>
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
  widgetId,
  widgetSize = size,
  isEditing = false,
  availableSizeOptions,
  onResizeWidget,
  onRemoveWidget,
  onMoveWidget,
  canMoveUp,
  canMoveDown,
}: NewsWidgetProps) {
  const compact =
    size === "small" || (containerWidth != null && containerWidth < 240);

  const { rowHeight, rowGap } = getNewsLayout({
    size,
    compact,
    containerHeight,
  });

  const styles = newsWidgetStyles(isDark, compact, rowHeight, rowGap);
  const { articles, loading, error, refresh } = useAllNews(
    articlesBySize[size],
  );
  const showActions = isEditing && widgetId != null;

  return (
    <View
      style={[
        styles.card,
        containerHeight ? { height: containerHeight } : null,
      ]}
    >
      <Text style={styles.heading} numberOfLines={1}>
        Latest News
      </Text>

      {loading ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>Loading news...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.errorText}>Failed to load news</Text>

          <TouchableOpacity activeOpacity={activeOpacity} onPress={refresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : articles.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>No stories available.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.newsScroll}
          contentContainerStyle={[
            styles.newsScrollContent,
            showActions && styles.newsScrollContentEditing,
          ]}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          bounces
        >
          {articles.map((article) => (
            <NewsRow
              key={article.keyId ?? String(article.id)}
              article={article}
              isDark={isDark}
              compact={compact}
              rowHeight={rowHeight}
            />
          ))}
        </ScrollView>
      )}

      {showActions && widgetId && (
        <WidgetEditControls
          isDark={isDark}
          widgetId={widgetId}
          widgetSize={widgetSize}
          availableSizeOptions={availableSizeOptions}
          onResizeWidget={onResizeWidget}
          onRemoveWidget={onRemoveWidget}
          onMoveWidget={onMoveWidget}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          compact={compact}
        />
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
      overflow: "hidden",
      borderColor: Colors.midTone,
      borderWidth: 1,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      position: "relative",
    },
    heading: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: compact ? 14 : 18,
      color: isDark ? Colors.white : Colors.black,
      marginBottom: compact ? 8 : 10,
    },
    newsScroll: {
      flex: 1,
      minHeight: 0,
    },
    newsScrollContent: {
      paddingBottom: compact ? 2 : 4,
    },
    newsScrollContentEditing: {
      paddingBottom: compact ? 48 : 56,
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
      minWidth: 0,
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
      alignItems: "center",
      gap: 6,
    },
    metaText: {
      flexShrink: 1,
      fontFamily: Fonts.OSREGULAR,
      fontSize: compact ? 10 : 11,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    metaSpacer: {
      flex: 1,
    },
    stateCard: {
      flex: 1,
      minHeight: 76,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
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
    retryText: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 13,
      color: isDark ? Colors.white : Colors.black,
    },
  });

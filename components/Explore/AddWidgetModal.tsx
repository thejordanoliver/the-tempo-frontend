import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Colors, Fonts } from "constants/styles";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ExploreWidgetConfig,
  ExploreWidgetSize,
  ExploreWidgetType,
} from "types/widgets";

type WidgetOption = {
  type: ExploreWidgetType;
  title: string;
  description: string;
  badge?: string;
  icon: keyof typeof Ionicons.glyphMap;
  sizes?: ExploreWidgetSize[];
};

type AddWidgetModalProps = {
  visible: boolean;
  isDark: boolean;
  selectedWidgets: ExploreWidgetConfig[];
  onClose: () => void;
  onAddWidget: (
    type: ExploreWidgetType,
    title: string,
    size: ExploreWidgetSize,
  ) => void;
};

const DEFAULT_SIZE: ExploreWidgetSize = "medium";
const RESIZABLE_WIDGET_SIZES: ExploreWidgetSize[] = [
  "small",
  "medium",
  "large",
];

export const WIDGET_OPTIONS: WidgetOption[] = [
  {
    type: "nba_games",
    title: "NBA Games",
    description: "Track recent and upcoming games for favorite NBA teams.",
    badge: "NBA",
    icon: "basketball-outline",
  },
  {
    type: "nfl_games",
    title: "NFL Games",
    description: "Follow football matchups for your NFL favorites.",
    badge: "NFL",
    icon: "american-football-outline",
  },
  {
    type: "mlb_games",
    title: "MLB Games",
    description: "Keep baseball scores close on Explore.",
    badge: "MLB",
    icon: "baseball-outline",
  },
  {
    type: "nhl_games",
    title: "NHL Games",
    description: "Track hockey game cards from your NHL favorites.",
    badge: "NHL",
    icon: "ice-cream-outline",
  },
  {
    type: "wnba_games",
    title: "WNBA Games",
    description: "Follow WNBA games for selected teams.",
    badge: "WNBA",
    icon: "basketball-outline",
  },
  {
    type: "cbb_games",
    title: "CBB Games",
    description: "Track men's college basketball team games.",
    badge: "CBB",
    icon: "school-outline",
  },
  {
    type: "wcbb_games",
    title: "WCBB Games",
    description: "Track women's college basketball team games.",
    badge: "WCBB",
    icon: "school-outline",
  },
  {
    type: "cfb_games",
    title: "CFB Games",
    description: "Follow college football games from favorite teams.",
    badge: "CFB",
    icon: "american-football-outline",
  },
  {
    type: "favorite_games",
    title: "Favorites Games",
    description: "Combine all favorite-team games into one slider.",
    badge: "Games",
    icon: "albums-outline",
  },
  {
    type: "favorite_teams",
    title: "Favorite Teams",
    description: "Quick access to your saved teams and leagues.",
    badge: "Teams",
    icon: "star-outline",
  },
  {
    type: "trending_news",
    title: "Trending News",
    description: "Surface the latest stories across your sports.",
    badge: "News",
    icon: "newspaper-outline",
    sizes: RESIZABLE_WIDGET_SIZES,
  },
  {
    type: "player_leaders",
    title: "Player Leaders",
    description: "Monitor leaders and standout player performances.",
    badge: "Players",
    icon: "podium-outline",
  },
  {
    type: "standings",
    title: "Standings",
    description: "Add standings snapshots for leagues you follow.",
    badge: "Tables",
    icon: "stats-chart-outline",
    sizes: RESIZABLE_WIDGET_SIZES,
  },
];

export default function AddWidgetModal({
  visible,
  isDark,
  selectedWidgets,
  onClose,
  onAddWidget,
}: AddWidgetModalProps) {
  const styles = addWidgetModalStyles(isDark);
  const selectedSet = new Set(selectedWidgets.map((widget) => widget.type));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView
        intensity={36}
        tint={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Add Widget</Text>
              <Text style={styles.subtitle}>
                Choose what you want to track on Explore.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={22}
                color={isDark ? Colors.white : Colors.black}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            contentContainerStyle={styles.options}
          >
            {WIDGET_OPTIONS.map((option) => {
              const isSelected = selectedSet.has(option.type);
              const sizes = option.sizes ?? [DEFAULT_SIZE];

              return (
                <View
                  key={option.type}
                  style={[styles.card, isSelected && styles.cardSelected]}
                >
                  <View style={styles.iconWrap}>
                    <Ionicons
                      name={option.icon}
                      size={22}
                      color={isDark ? Colors.white : Colors.black}
                    />
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.titleRow}>
                      <Text style={styles.cardTitle}>{option.title}</Text>

                      {option.badge && (
                        <Text style={styles.badge}>{option.badge}</Text>
                      )}
                    </View>

                    <Text style={styles.description}>
                      {option.description}
                    </Text>

                    {sizes.length > 1 && !isSelected && (
                      <View style={styles.sizeRow}>
                        {sizes.map((size) => (
                          <TouchableOpacity
                            key={size}
                            activeOpacity={0.85}
                            onPress={() =>
                              onAddWidget(option.type, option.title, size)
                            }
                            style={styles.sizeButton}
                          >
                            <Text style={styles.sizeButtonText}>
                              {size[0].toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={styles.action}>
                    {isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={
                          isDark ? Colors.dark.leafGreen : Colors.light.green
                        }
                      />
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() =>
                          onAddWidget(option.type, option.title, DEFAULT_SIZE)
                        }
                        style={styles.addButton}
                      >
                        <Text style={styles.addText}>Add</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const addWidgetModalStyles = (isDark: boolean) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: isDark ? "rgba(0,0,0,0.38)" : "rgba(0,0,0,0.22)",
    },
    sheet: {
      maxHeight: "86%",
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: 18,
      paddingHorizontal: 16,
      paddingBottom: 28,
      backgroundColor: isDark ? Colors.black : Colors.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      marginBottom: 14,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 24,
      color: isDark ? Colors.white : Colors.black,
    },
    subtitle: {
      marginTop: 2,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    scroll: {
      flexGrow: 0,
      flexShrink: 1,
      minHeight: 0,
    },
    options: {
      gap: 10,
      paddingBottom: 40,
    },
    card: {
      minHeight: 88,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    cardSelected: {
      borderColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.darkGray : Colors.white,
    },
    cardBody: {
      flex: 1,
      gap: 3,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    cardTitle: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 17,
      color: isDark ? Colors.white : Colors.black,
    },
    badge: {
      overflow: "hidden",
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 10,
      color: isDark ? Colors.white : Colors.black,
      backgroundColor: isDark ? Colors.darkGray : Colors.white,
    },
    description: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      lineHeight: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    action: {
      minWidth: 46,
      alignItems: "flex-end",
    },
    addButton: {
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 5,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    addText: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 13,
      color: isDark ? Colors.black : Colors.white,
    },
    sizeRow: {
      flexDirection: "row",
      gap: 6,
      marginTop: 8,
    },
    sizeButton: {
      width: 30,
      height: 26,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.black : Colors.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    sizeButtonText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
    },
  });
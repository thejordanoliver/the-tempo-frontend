import { SelectionCardStyles } from "@/styles/TeamStyles/SelectionCardStyles";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useCallback } from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  Text,
  View,
} from "react-native";

export type SelectionCardItem = {
  id: string | number;
  league: string;
  name?: string | null;
  fullName?: string | null;
  shortName?: string | null;
  code?: string | null;
  color?: string | null;
};

type Props = {
  item: SelectionCardItem;
  logo?: ImageSourcePropType;
  isSelected: boolean;
  isGridView: boolean;
  onPress: (league: string, id: string) => void;
  itemWidth: number;
  onImageLoad?: () => void;
  showSportTag?: boolean;
};

function SelectionCard({
  item,
  logo,
  isSelected,
  isGridView,
  onPress,
  itemWidth,
  onImageLoad,
  showSportTag = false,
}: Props) {
  const { resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";
  const styles = SelectionCardStyles;

  const selectedColor =
    typeof item.color === "string" && item.color.startsWith("#")
      ? item.color
      : Colors.midTone;

  const handlePress = useCallback(() => {
    onPress(item.league, String(item.id));
  }, [item.id, item.league, onPress]);

  const logoSize = isGridView ? 50 : 40;

  const displayName =
    item.name ??
    item.fullName ??
    item.shortName ??
    item.code ??
    String(item.id);

  const backgroundColor = isSelected
    ? selectedColor
    : isDark
      ? Colors.dark.itemBackground
      : Colors.light.itemBackground;

  const textColor = isSelected
    ? Colors.dark.text
    : isDark
      ? Colors.dark.text
      : Colors.light.text;

  const sportTagColor =
    item.league === "cfb"
      ? "#228B22"
      : item.league === "wcbb"
        ? "#C2185B"
        : item.league === "cb"
          ? "#0F766E"
          : item.league === "sb"
            ? "#B45309"
            : "#1E90FF";

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        width: isGridView ? itemWidth : "100%",
        marginBottom: isGridView ? 0 : 12,
      })}
    >
      <View
        style={[
          styles.selectionCard,
          {
            width: isGridView ? itemWidth : "100%",
            backgroundColor,
            flexDirection: isGridView ? "column" : "row",
            justifyContent: isGridView ? "center" : "flex-start",
            alignItems: "center",
            paddingHorizontal: isGridView ? 8 : 12,
            paddingVertical: 12,
            minHeight: isGridView ? 130 : 64,
          },
        ]}
      >
        {showSportTag && (
          <View
            style={[
              styles.sportTag,
              {
                backgroundColor: sportTagColor,
              },
            ]}
          >
            <Text style={styles.sportTagText}>{item.league}</Text>
          </View>
        )}

        <View
          style={[
            styles.logoWrapper,
            !isGridView && {
              marginRight: 12,
              marginBottom: 0,
              width: logoSize,
              height: logoSize,
            },
          ]}
        >
          {logo ? (
            <Image
              source={logo}
              style={[
                styles.logo,
                {
                  width: logoSize,
                  height: logoSize,
                },
              ]}
              onLoad={onImageLoad}
            />
          ) : null}
        </View>

        <View
          style={{
            alignItems: isGridView ? "center" : "flex-start",
            flexDirection: isGridView ? "column" : "row",
            flex: isGridView ? 0 : 1,
          }}
        >
          <Text style={[styles.teamName, { color: textColor }]}>
            {isGridView ? displayName : (item.fullName ?? displayName)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default React.memo(
  SelectionCard,
  (prevProps, nextProps) =>
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.league === nextProps.item.league &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.fullName === nextProps.item.fullName &&
    prevProps.item.color === nextProps.item.color &&
    prevProps.logo === nextProps.logo &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isGridView === nextProps.isGridView &&
    prevProps.itemWidth === nextProps.itemWidth &&
    prevProps.showSportTag === nextProps.showSportTag,
);

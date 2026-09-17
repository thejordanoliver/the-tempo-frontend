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
  onPress: (league: string, id: string) => void;
  itemWidth: number;
  onImageLoad?: () => void;
  showSportTag?: boolean;
};

function SelectionCard({
  item,
  logo,
  isSelected,
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

  const logoSize = 50;

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
        width: itemWidth,
        marginBottom: 0,
      })}
    >
      <View
        style={[
          styles.selectionCard,
          {
            width: itemWidth,
            backgroundColor,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 8,
            paddingVertical: 12,
            minHeight: 130,
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

        <View style={[styles.logoWrapper]}>
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
            alignItems: "center",
            flexDirection: "column",
            flex: 0,
          }}
        >
          <Text style={[styles.teamName, { color: textColor }]}>
            {displayName}
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
    prevProps.itemWidth === nextProps.itemWidth &&
    prevProps.showSportTag === nextProps.showSportTag,
);

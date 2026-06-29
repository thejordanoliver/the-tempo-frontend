import { Colors } from "constants/styles";
import { getTeamLogo } from "constants/teams";
import { getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { getWNBATeamLogo } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useCallback, useMemo } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { teamCardStyles } from "styles/TeamStyles/TeamCardStyles";
import type { LeagueType, Team } from "types/types";

type TeamWithLeague = Omit<Team, "id"> & { id: number; league: LeagueType };

type Props = {
  item: TeamWithLeague;
  isSelected: boolean;
  isGridView: boolean;
  onPress: (league: LeagueType, id: string) => void;
  itemWidth: number;
  onImageLoad?: () => void;
};

function TeamCard({
  item,
  isSelected,
  isGridView,
  onPress,
  itemWidth,
  onImageLoad,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamCardStyles;

  const selectedColor =
    typeof item.color === "string" && item.color.startsWith("#")
      ? item.color
      : Colors.midTone;

  const useAltLogo = isDark || isSelected;

  const logo = useMemo(() => {
    if (item.league === "CFB") return getCFBTeamLogo(item.id, useAltLogo);
    if (item.league === "CBB")
      return getCBBTeamLogo(item.id, useAltLogo, false);
    if (item.league === "WCBB")
      return getCBBTeamLogo(item.id, useAltLogo, true);
    if (item.league === "MLB") return getMLBTeamLogo(item.id, useAltLogo);
    if (item.league === "NBA") return getTeamLogo(item.id, useAltLogo);
    if (item.league === "WNBA") return getWNBATeamLogo(item.id, useAltLogo);
    if (item.league === "NFL") return getNFLTeamLogo(item.id, useAltLogo);
    return getNHLTeamLogo(item.id, useAltLogo);
  }, [item.id, item.league, useAltLogo]);

  const handlePress = useCallback(() => {
    onPress(item.league, item.id.toString());
  }, [item.id, item.league, onPress]);

  const logoSize = isGridView ? 50 : 40;
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
          styles.teamCard,
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
        {(item.league === "CFB" ||
          item.league === "CBB" ||
          item.league === "WCBB") && (
          <View
            style={[
              styles.sportTag,
              {
                backgroundColor:
                  item.league === "CFB"
                    ? "#228B22"
                    : item.league === "WCBB"
                      ? "#C2185B"
                      : "#1E90FF",
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
          <Image
            source={logo}
            style={[styles.logo, { width: logoSize, height: logoSize }]}
            onLoad={onImageLoad}
          />
        </View>

        <View
          style={{
            alignItems: isGridView ? "center" : "flex-start",
            flexDirection: isGridView ? "column" : "row",
            flex: isGridView ? 0 : 1,
          }}
        >
          <Text style={[styles.teamName, { color: textColor }]}>
            {isGridView ? item.name : item.fullName}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default React.memo(
  TeamCard,
  (prevProps, nextProps) =>
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.league === nextProps.item.league &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.fullName === nextProps.item.fullName &&
    prevProps.item.color === nextProps.item.color &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isGridView === nextProps.isGridView &&
    prevProps.itemWidth === nextProps.itemWidth,
);

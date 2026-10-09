import { getSOCCTeam, getSOCCTeamLogo } from "@/constants/teamsSOCC";
import { Ionicons } from "@expo/vector-icons";
import { Colors, activeOpacity } from "constants/styles";
import { getNBATeam, getNBATeamLogo } from "constants/teams";
import { getCBTeam, getCBTeamLogo } from "constants/teamsCB";
import { getSBTeam, getSBTeamLogo } from "constants/teamsSB";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { getGLeagueTeam, getGLeagueTeamLogo } from "constants/teamsGLeague";
import { getMCBBTeam, getMCBBTeamLogo } from "constants/teamsMCBB";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeam, getNHLTeamLogo } from "constants/teamsNHL";
import { getWCBBTeam, getWCBBTeamLogo } from "constants/teamsWCBB";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import { Image, type ImageProps } from "expo-image";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { exploreStyles } from "styles/ExploreStyles/ExploreStyles";
import type {
  PlayerResult,
  SearchAffiliation,
  ResultItem,
  TeamResult,
  UserResult,
} from "types/explore";

type Props = {
  item: ResultItem;
  onSelect: (item: ResultItem) => void;
  onDelete?: (item: ResultItem) => void;
  query?: string;
};

const playerPlaceholderImage = require("../../assets/Placeholders/playerPlaceholder.png");
const userPlaceholderImage = require("../../assets/Placeholders/ProfilePlaceholder.png");
const teamPlaceholderImage = require("../../assets/Placeholders/teamPlaceholder.png");

const teamLookups = {
  nba: getNBATeam, gleague: getGLeagueTeam, wnba: getWNBATeam,
  mlb: getMLBTeam, nhl: getNHLTeam, nfl: getNFLTeam,
  cfb: getCFBTeam, mcbb: getMCBBTeam, wcbb: getWCBBTeam,
  soccer: getSOCCTeam, cb: getCBTeam, sb: getSBTeam,
};
const logoLookups = {
  nba: getNBATeamLogo, gleague: getGLeagueTeamLogo, wnba: getWNBATeamLogo,
  mlb: getMLBTeamLogo, nhl: getNHLTeamLogo, nfl: getNFLTeamLogo,
  cfb: getCFBTeamLogo, mcbb: getMCBBTeamLogo, wcbb: getWCBBTeamLogo,
  soccer: getSOCCTeamLogo, cb: getCBTeamLogo, sb: getSBTeamLogo,
};

function getTeam(affiliation: SearchAffiliation, id: string | number | null) {
  return id == null || affiliation === "mma" ? null : teamLookups[affiliation]?.(id);
}

// Remount on source changes so a failed image cannot poison a reused row.
function ResultImage({ fallback, ...props }: ImageProps & { fallback: ImageProps["source"] }) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      {...props}
      source={failed ? fallback : props.source}
      onError={() => setFailed(true)}
    />
  );
}

export default function ResultItemRow({
  item,
  onSelect,
  onDelete,
  query = "",
}: Props) {
  const [cacheDay, setCacheDay] = useState(() => Math.floor(Date.now() / 86_400_000));
  useFocusEffect(useCallback(() => {
    setCacheDay(Math.floor(Date.now() / 86_400_000));
  }, []));
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = exploreStyles(isDark);
  const isRecentSearch = query.trim().length === 0;

  // -------------------------
  // TEAM
  // -------------------------
  const renderTeam = (team: TeamResult) => {
    if (team.is_active === false) return null;
    const backendLogo = (isDark ? team.logoLight || team.logo : team.logo)?.trim();
    const teamLogo: ImageProps["source"] = backendLogo ||
      (team.affiliation === "mma" ? null : logoLookups[team.affiliation]?.(team.id, isDark)) ||
      teamPlaceholderImage;

    return (
      <View style={styles.itemRow}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={() => onSelect(team)}
          style={styles.itemContainer}
          accessibilityRole="button"
          accessibilityLabel={`Open ${team.full_name || team.name}`}
        >
          <View style={styles.userRow}>
            <ResultImage key={`${team.affiliation}:${team.id}:${isDark}:${backendLogo}`} source={teamLogo} fallback={teamPlaceholderImage} style={styles.teamLogo} contentFit="contain" />
            <View style={styles.resultText}>
              <Text style={styles.name} numberOfLines={1}>{team.full_name || team.name}</Text>
              {team.affiliation === "wcbb" && (
                <Text style={styles.subtext} numberOfLines={1}>
                  {"Women's College Basketball"}
                </Text>
              )}
              {team.affiliation === "mcbb" && (
                <Text style={styles.subtext} numberOfLines={1}>{"Men's College Basketball"}</Text>
              )}
              {team.affiliation === "cb" && (
                <Text style={styles.subtext} numberOfLines={1}>College Baseball</Text>
              )}
              {team.affiliation === "sb" && (
                <Text style={styles.subtext} numberOfLines={1}>College Softball</Text>
              )}
              {team.affiliation === "cfb" && (
                <Text style={styles.subtext} numberOfLines={1}>College Football</Text>
              )}
              {team.affiliation === "soccer" && team.league === "msoc" && (
                <Text style={styles.subtext} numberOfLines={1}>{"Men's College Soccer"}</Text>
              )}
              {team.affiliation === "soccer" && team.league === "wsoc" && (
                <Text style={styles.subtext} numberOfLines={1}>{"Women's College Soccer"}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
        {isRecentSearch && onDelete && (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            style={styles.deleteButton}
            onPress={() => onDelete(team)}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${team.full_name || team.name} from recent searches`}
          >
            <Ionicons
              name="close"
              size={20}
              color={isDark ? Colors.white : Colors.black}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // -------------------------
  // PLAYER
  // -------------------------
  const renderPlayer = (player: PlayerResult) => {
    const headshot = player.headshot_url?.trim();
    const playerName = player.full_name?.trim() || "Unknown player";
    const team = getTeam(player.affiliation, player.team_id);
    const association = team?.fullName || player.association_name?.trim() ||
      (player.affiliation === "mma" ? null : "Free Agent");
    // A new daily key bypasses stale native cache entries at an unchanged URL.
    const cacheKey = headshot ? `${headshot}:${cacheDay}` : undefined;

    return (
      <View style={styles.itemRow}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={() => onSelect(player)}
          style={styles.itemContainer}
          accessibilityRole="button"
          accessibilityLabel={`Open ${playerName}`}
        >
          <View style={styles.playerRow}>
            <View style={styles.playerAvatarContainer}>
              <ResultImage
                key={`${player.affiliation}:${player.id}:${cacheKey}`}
                source={headshot ? { uri: headshot, cacheKey } : playerPlaceholderImage}
                fallback={playerPlaceholderImage}
                style={styles.avatar}
                contentFit="contain"
                cachePolicy="disk"
                recyclingKey={`${player.affiliation}:${player.id}:${cacheKey}`}
              />
            </View>
            <View style={styles.resultText}>
              <Text style={styles.name} numberOfLines={1}>{playerName}</Text>
              {association && (
                <Text style={styles.subtext} numberOfLines={1}>
                  {association}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
        {isRecentSearch && onDelete && (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            style={styles.deleteButton}
            onPress={() => onDelete(player)}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${playerName} from recent searches`}
          >
            <Ionicons
              name="close"
              size={20}
              color={isDark ? Colors.white : Colors.black}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // -------------------------
  // USER
  // -------------------------
  const renderUser = (user: UserResult) => {
    const profileImageUrl = user.profileImageUrl?.trim();

    return (
      <View style={styles.itemRow}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={() => onSelect(user)}
          style={styles.itemContainer}
          accessibilityRole="button"
          accessibilityLabel={`Open ${user.username}`}
        >
          <View style={styles.userRow}>
            <View style={styles.avatarContainer}>
              <ResultImage
                key={`user:${user.id}:${profileImageUrl}`}
                fallback={userPlaceholderImage}
                source={profileImageUrl ? { uri: profileImageUrl } : userPlaceholderImage}
                style={styles.avatar}
                contentFit="cover"
              />
            </View>
            <View style={styles.resultText}>
              <Text style={styles.name} numberOfLines={1}>{user.username}</Text>
              <Text style={styles.subtext} numberOfLines={1}>{user.full_name}</Text>
            </View>
          </View>
        </TouchableOpacity>
        {isRecentSearch && onDelete && (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            style={styles.deleteButton}
            onPress={() => onDelete(user)}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${user.username} from recent searches`}
          >
            <Ionicons
              name="close"
              size={20}
              color={isDark ? Colors.white : Colors.black}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // -------------------------
  // SWITCH
  // -------------------------
  switch (item.type) {
    case "team":
      return renderTeam(item);
    case "player":
      return renderPlayer(item);
    case "user":
      return renderUser(item);
    default:
      return null;
  }
}

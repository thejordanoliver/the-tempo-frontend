import { Ionicons } from "@expo/vector-icons";
import { Colors, activeOpacity } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  Image,
  type ImageProps,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { exploreStyles } from "styles/ExploreStyles/ExploreStyles";
import type {
  PlayerResult,
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

const TEAM_LEAGUE_LABELS: Record<string, string> = {
  mcvb: "Men’s College Volleyball",
  wcvb: "Women’s College Volleyball",
  wcbb: "Women's College Basketball",
  mcbb: "Men's College Basketball",
  cb: "College Baseball",
  sb: "College Softball",
  cfb: "College Football",
  msoc: "Men's College Soccer",
  wsoc: "Women's College Soccer",
};

// Remount on source changes so a failed image cannot poison a reused row.
function ResultImage({
  fallback,
  ...props
}: ImageProps & { fallback: ImageProps["source"] }) {
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
  const [cacheDay, setCacheDay] = useState(() =>
    Math.floor(Date.now() / 86_400_000),
  );
  useFocusEffect(
    useCallback(() => {
      setCacheDay(Math.floor(Date.now() / 86_400_000));
    }, []),
  );
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = exploreStyles(isDark);
  const isRecentSearch = query.trim().length === 0;

  // -------------------------
  // TEAM
  // -------------------------
  const renderTeam = (team: TeamResult) => {
    const teamName = team.fullName?.trim() || team.name;
    const backendLogo =
      (isDark ? team.logoDark?.trim() : undefined) || team.logo?.trim();
    const teamLogo: ImageProps["source"] = backendLogo
      ? { uri: backendLogo }
      : teamPlaceholderImage;

    return (
      <View style={styles.itemRow}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={() => onSelect(team)}
          style={styles.itemContainer}
          accessibilityRole="button"
          accessibilityLabel={`Open ${teamName}`}
        >
          <View style={styles.userRow}>
            <ResultImage
              key={`${team.league}:${team.id}:${isDark}:${backendLogo}`}
              source={teamLogo}
              fallback={teamPlaceholderImage}
              style={styles.teamLogo}
              resizeMode="contain"
            />
            <View style={styles.resultText}>
              <Text style={styles.name} numberOfLines={1}>
                {teamName}
              </Text>
              {TEAM_LEAGUE_LABELS[team.league] && (
                <Text style={styles.subtext} numberOfLines={1}>
                  {TEAM_LEAGUE_LABELS[team.league]}
                </Text>
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
            accessibilityLabel={`Delete ${teamName} from recent searches`}
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
    const team = player.team;
    const association =
      team?.fullName?.trim() ||
      team?.name?.trim() ||
      player.association_name?.trim() ||
      (player.sport !== "mma" && player.team_id == null ? "Free Agent" : null);
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
                key={`${player.league}:${player.id}:${cacheKey}`}
                source={headshot ? { uri: headshot } : playerPlaceholderImage}
                fallback={playerPlaceholderImage}
                style={styles.avatar}
                resizeMode="contain"
              />
            </View>
            <View style={styles.resultText}>
              <Text style={styles.name} numberOfLines={1}>
                {playerName}
              </Text>
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
                source={
                  profileImageUrl
                    ? { uri: profileImageUrl }
                    : userPlaceholderImage
                }
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
            <View style={styles.resultText}>
              <Text style={styles.name} numberOfLines={1}>
                {user.username}
              </Text>
              <Text style={styles.subtext} numberOfLines={1}>
                {user.full_name}
              </Text>
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

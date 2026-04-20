import { Ionicons } from "@expo/vector-icons";
import playerPlaceholderImage from "assets/Placeholders/playerPlaceholder.png";
import { Colors } from "constants/styles";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { getCBBTeam, getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";
import { exploreStyles } from "styles/ExploreStyles/ExploreStyles";
import type {
  PlayerResult,
  ResultItem,
  TeamResult,
  UserResult,
} from "types/types";

type Props = {
  item: ResultItem;
  onSelect: (item: ResultItem) => void;
  onDelete?: (item: ResultItem) => void;
  query?: string;
};

export default function ResultItemRow({
  item,
  onSelect,
  onDelete,
  query = "",
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = exploreStyles(isDark);

  // -------------------------
  // TEAM
  // -------------------------
  const renderTeam = (team: TeamResult) => {
    if (team.is_active === false) return null; // 👈 add this
    let localTeamLogo: string | undefined;

    if (team.isNFL && team.id != null)
      localTeamLogo = getNFLTeamLogo(team.id, isDark);
    else if (team.isWNBA && team.id != null)
      localTeamLogo = getWNBATeamLogo(team.id, isDark);
    else if (team.isMLB && team.id != null)
      localTeamLogo = getMLBTeamLogo(team.id, isDark);
    else if (team.isNHL && team.id != null)
      localTeamLogo = getNHLTeamLogo(team.id, isDark);
    else if (team.isCFB && team.id != null)
      localTeamLogo = getCFBTeamLogo(team.id, isDark);
    else if (team.isCBB && team.id != null)
      localTeamLogo = getCBBTeamLogo(team.id, isDark);
    else if (team.isWCBB && team.wid != null)
      localTeamLogo = getCBBTeamLogo(team.wid, isDark, true); // WCBB uses wid
    else if (team.id != null) localTeamLogo = getTeamLogo(team.id, isDark);

    return (
      <View style={styles.itemRow}>
        <TouchableOpacity
          onPress={() => onSelect(team)}
          style={styles.itemContainer}
        >
          <View style={styles.userRow}>
            {localTeamLogo && (
              <Image source={localTeamLogo} style={styles.teamLogo} />
            )}
            <View>
              <Text style={styles.name}>{team.full_name || team.name}</Text>
              {team.isWCBB && <Text style={styles.tag}>WCBB</Text>}
              {team.isCBB && <Text style={styles.tag}>CBB</Text>}
              {team.isCFB && <Text style={styles.tag}>CFB</Text>}
            </View>
          </View>
        </TouchableOpacity>
        {query.length === 0 && onDelete && (
          <TouchableOpacity onPress={() => onDelete(team)}>
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
    const avatarUrl =
      player.avatarUrl ?? player.headshot_url ?? playerPlaceholderImage;
    const teamId = player.team_id ?? null;

    const localTeam =
      teamId && player.isNFL
        ? getNFLTeam(teamId)
        : teamId && player.isMLB
          ? getMLBTeam(teamId)
          : teamId && player.isCFB
            ? getCFBTeam(teamId)
            : teamId && player.isCBB
              ? getCBBTeam(teamId)
              : teamId && player.isWCBB
                ? getCBBTeam(teamId, true)
                : teamId && player.isNBA
                  ? getNBATeam(teamId)
                : teamId && player.isWNBA
                  ? getWNBATeam(teamId)
                  : null;

    return (
      <View style={styles.itemRow}>
        <TouchableOpacity
          onPress={() => onSelect(player)}
          style={styles.itemContainer}
        >
          <View style={styles.playerRow}>
            <View style={styles.playerAvatarContainer}>
              <Image source={{ uri: avatarUrl }} style={styles.playerAvatar} />
            </View>
            <View>
              <Text style={styles.name}>{player.name}</Text>
              {localTeam?.fullName && (
                <Text style={styles.playerTeam}>
                  {localTeam?.fullName || "Free Agent"}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
        {query.length === 0 && onDelete && (
          <TouchableOpacity onPress={() => onDelete(player)}>
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
          onPress={() => onSelect(user)}
          style={styles.itemContainer}
        >
          <View style={styles.userRow}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: profileImageUrl }}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
            <View>
              <Text style={styles.name}>{user.username}</Text>
              <Text style={styles.subtext}>{user.full_name}</Text>
            </View>
          </View>
        </TouchableOpacity>
        {query.length === 0 && onDelete && (
          <TouchableOpacity onPress={() => onDelete(user)}>
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
      return renderTeam(item as TeamResult);
    case "player":
      return renderPlayer(item as PlayerResult);
    case "user":
      return renderUser(item as UserResult);
    default:
      return null;
  }
}

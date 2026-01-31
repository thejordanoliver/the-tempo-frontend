import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/Styles";
import { teamsById } from "constants/teams";
import { teamsCBBById, teamsWCBBById } from "constants/teamsCBB";
import { teamsCFBById } from "constants/teamsCFB";
import { teamsMLBById } from "constants/teamsMLB";
import { teamsNFLById } from "constants/teamsNFL";
import { Image } from "expo-image";
import playerPlaceholderImage from "assets/Placeholders/playerPlaceholder.png"
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
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
  apiUrl?: string;
  query?: string;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ResultItemRow({
  item,
  onSelect,
  onDelete,
  apiUrl = "",
  query = "",
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = exploreStyles(isDark);
  // -------------------------
  // TEAM
  // -------------------------
  const renderTeam = (team: TeamResult) => {
    const localTeam =
      team.isNFL && team.id != null
        ? teamsNFLById[String(team.id)]
        : team.isMLB && team.id != null
        ? teamsMLBById[String(team.id)]
        : team.isCFB && team.id != null
        ? teamsCFBById[String(team.id)]
        : team.isCBB && team.id != null
        ? teamsCBBById[String(team.id)]
        : team.isWCBB && team.wid != null
        ? teamsWCBBById[String(team.wid)]
        : team.id != null
        ? teamsById[String(team.id)]
        : null;

    const logoSource = isDark
      ? localTeam?.logoLight || localTeam?.logo
      : localTeam?.logo;

    return (
      <View style={styles.itemRow}>
        <TouchableOpacity
          onPress={() => onSelect(team)}
          style={styles.itemContainer}
        >
          <View style={styles.userRow}>
            {logoSource && (
              <Image
                source={logoSource}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            )}
            <View>
              <Text style={styles.name}>
                {localTeam?.fullName || team.name}
              </Text>
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
    // console.log(JSON.stringify(player, null, 2));
    const avatarUrl = player.avatarUrl ?? player.headshot_url ?? playerPlaceholderImage;
    const teamId = player.team_id != null ? String(player.team_id) : null;

    const localTeam =
      teamId && player.isNFL
        ? teamsNFLById[teamId]
        : teamId && player.isMLB
        ? teamsMLBById[teamId]
        : teamId && player.isCFB
        ? teamsCFBById[teamId]
        : teamId && player.isCBB
        ? teamsCBBById[teamId]
        : teamId && player.isWCBB
        ? teamsWCBBById[teamId]
        : teamId && player.isNBA
        ? teamsById[teamId]
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
              <Text style={styles.playerTeam}>
                {localTeam?.fullName || "Free Agent"}
              </Text>
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
    let profileImageUrl = user.profileImageUrl?.trim();

    if (!profileImageUrl) {
      profileImageUrl = "https://via.placeholder.com/150";
    } else if (!profileImageUrl.startsWith("http")) {
      profileImageUrl = `${BASE_URL}${profileImageUrl}`;
    }

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

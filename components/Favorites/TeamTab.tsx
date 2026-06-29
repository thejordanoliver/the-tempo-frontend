import { Colors } from "constants/styles";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { getWNBATeamLogo } from "constants/teamsWNBA";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { RenderItemParams } from "react-native-draggable-flatlist";
import { favoritesScrollStyles } from "styles/HomeStyles/FavoritesScrollStyles";
import { LeagueType } from "types/types";
import { getTeamLogo } from "../../constants/teams";
import { getCBBTeamLogo } from "../../constants/teamsCBB";
import { getCFBTeamLogo } from "../../constants/teamsCFB";
import { getNFLTeamLogo } from "../../constants/teamsNFL";

type TeamWithLeague = {
  id: string | number;
  name: string;
  code: string;
  logo?: any;
  color?: string;
  league: LeagueType;
  key: string;
  wid?: number;
  isDark: boolean;
};

const getFavoriteTeamLogo = (item: TeamWithLeague) => {
  const teamId = Number(item.id);

  switch (item.league) {
    case "NFL":
      return getNFLTeamLogo(teamId, true);
    case "NBA":
      return getTeamLogo(teamId, true);
    case "WNBA":
      return getWNBATeamLogo(teamId, true);
    case "CFB":
      return getCFBTeamLogo(teamId, true);
    case "CBB":
      return getCBBTeamLogo(teamId, true, false);
    case "WCBB":
      return getCBBTeamLogo(teamId, true, true);
    case "NHL":
      return getNHLTeamLogo(teamId, true);
    case "MLB":
    case "CB":
    case "SB":
      return getMLBTeamLogo(teamId, true);
    default:
      return item.logo ?? null;
  }
};

const isCollegeLeague = (league: LeagueType) => {
  return league === "CFB" || league === "CBB" || league === "WCBB";
};

export const TeamTab = ({
  item,
  drag,
  isActive,
}: RenderItemParams<TeamWithLeague>) => {
  const router = useRouter();
  const styles = favoritesScrollStyles(item.isDark);

  const logo = getFavoriteTeamLogo(item);
  const isCollege = isCollegeLeague(item.league);
  const teamId = String(item.id);

  const handlePress = async () => {
    await Haptics.selectionAsync();

    switch (item.league) {
      case "NBA":
        router.push({
          pathname: "/team/[teamId]",
          params: { teamId },
        });
        break;

      case "WNBA":
        router.push({
          pathname: "/team/wnba/[teamId]",
          params: { teamId },
        });
        break;

      case "NFL":
        router.push({
          pathname: "/team/nfl/[teamId]",
          params: { teamId },
        });
        break;

      case "CFB":
        router.push({
          pathname: "/team/cfb/[teamId]",
          params: { teamId },
        });
        break;

      case "CBB":
        router.push({
          pathname: "/team/cbb/[teamId]",
          params: { teamId },
        });
        break;

      case "WCBB":
        router.push({
          pathname: "/team/wcbb/[teamId]",
          params: { teamId },
        });
        break;

      case "MLB":
      case "CB":
      case "SB":
        router.push({
          pathname: "/team/mlb/[teamId]",
          params: { teamId },
        });
        break;

      case "NHL":
        router.push({
          pathname: "/team/nhl/[teamId]",
          params: { teamId },
        });
        break;

      default:
        break;
    }
  };

  const handleLongPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    drag();
  };

  return (
    <Pressable
      key={item.key}
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        styles.teamIcon,
        pressed && { opacity: 0.6 },
        isActive && { opacity: 0.8, transform: [{ scale: 1.05 }] },
      ]}
    >
      <View
        style={[
          styles.logoWrapper,
          {
            backgroundColor: item.isDark
              ? item.color || Colors.dark.itemBackground
              : item.color || Colors.light.itemBackground,
          },
        ]}
      >
        <Image source={logo} style={styles.logo} contentFit="contain" />
      </View>

      <View style={styles.teamLabelContainer}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.teamLabel}>
          {item.name}
        </Text>

        {isCollege && (
          <>
            <View style={styles.divider} />
            <Text style={styles.teamLabel}>{item.league}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
};
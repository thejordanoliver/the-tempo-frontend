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

type TeamRoute =
  | "/team/[teamId]"
  | "/team/wnba/[teamId]"
  | "/team/nfl/[teamId]"
  | "/team/cfb/[teamId]"
  | "/team/cbb/[teamId]"
  | "/team/wcbb/[teamId]"
  | "/team/mlb/[teamId]"
  | "/team/nhl/[teamId]"
  | "/player/mma/[id]";

// -------------------------
// Render item
// -------------------------
export const TeamTab = ({
  item,
  drag,
  isActive,
}: RenderItemParams<TeamWithLeague>) => {
  let logo;

  switch (item.league) {
    case "NFL":
      logo = getNFLTeamLogo(Number(item.id), true);
      break;
    case "NBA":
      logo = getTeamLogo(Number(item.id), true);
      break;
    case "WNBA":
      logo = getWNBATeamLogo(Number(item.id), true);
      break;
    case "CFB":
      logo = getCFBTeamLogo(Number(item.id), true);
      break;
    case "CBB":
      logo = getCBBTeamLogo(Number(item.id), true, false);
      break;
    case "WCBB":
      logo = getCBBTeamLogo(Number(item.id), true, true);
      break;
    case "NHL":
      logo = getNHLTeamLogo(Number(item.id), true);
      break;
    case "MLB":
      logo = getMLBTeamLogo(Number(item.id), true);
      break;
    default:
      logo = null;
  }

  const router = useRouter();
  const styles = favoritesScrollStyles(item.isDark); // ✅ use item.isDark
  const isCollege =
    item.league === "CFB" || item.league === "CBB" || item.league === "WCBB";
  return (
    <Pressable
      onLongPress={async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        drag();
      }}
      key={item.key}
      style={({ pressed }) => [
        styles.teamIcon,
        pressed && { opacity: 0.6 },
        isActive && { opacity: 0.8, transform: [{ scale: 1.05 }] },
      ]}
      onPress={async () => {
        await Haptics.selectionAsync();

        const routeMap: Partial<Record<LeagueType, TeamRoute>> = {
          NBA: "/team/[teamId]",
          WNBA: "/team/wnba/[teamId]",
          NFL: "/team/nfl/[teamId]",
          CFB: "/team/cfb/[teamId]",
          CBB: "/team/cbb/[teamId]",
          WCBB: "/team/wcbb/[teamId]",
          CB: "/team/mlb/[teamId]",
          SB: "/team/mlb/[teamId]",
          MLB: "/team/mlb/[teamId]",
          NHL: "/team/nhl/[teamId]",
          MMA: "/player/mma/[id]",
        };

        const pathname = routeMap[item.league];

        if (!pathname) return;

        if (pathname === "/player/mma/[id]") {
          router.push({ pathname, params: { id: String(item.id) } });
          return;
        }

        router.push({ pathname, params: { teamId: String(item.id) } });
      }}
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
        <Image source={logo} style={styles.logo} />
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

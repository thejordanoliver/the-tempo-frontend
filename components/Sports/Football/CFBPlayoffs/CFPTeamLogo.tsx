import { getCFBTeamLogo } from "@/constants/teamsCFB";
import { Image, type ImageStyle, type StyleProp } from "react-native";
import type { FootballTeam } from "../../../../types/football/cfpBracketTypes";

/*
|--------------------------------------------------------------------------
| Team Logo
|--------------------------------------------------------------------------
*/

export function CFPTeamLogo({
  team,
  isDark,
  style,
}: {
  team: FootballTeam;

  isDark: boolean;

  style: StyleProp<ImageStyle>;
}) {
  const localLogo = getCFBTeamLogo(team.id, isDark);

  if (localLogo) {
    return <Image source={localLogo} resizeMode="contain" style={style} />;
  }

  if (team.logo) {
    return (
      <Image
        source={{
          uri: team.logo,
        }}
        resizeMode="contain"
        style={style}
      />
    );
  }

  return null;
}

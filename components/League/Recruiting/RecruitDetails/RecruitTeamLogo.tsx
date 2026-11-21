import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { getMCBBTeam, getMCBBTeamLogo } from "constants/teamsMCBB";
import { Image } from "react-native";
import { RecruitDetailsStyles } from "styles/PlayerStyles/RecruitDetailsStyles";

export default function RecruitTeamLogo({
  teamId,
  remoteUrl,
  league,
  isDark,
}: {
  teamId: number | null;
  remoteUrl?: string | null;
  league: "cfb" | "mcbb";
  isDark: boolean;
}) {
  const id = teamId ?? undefined;
  const team = league === "cfb" ? getCFBTeam(id ?? "") : getMCBBTeam(id);
  const source = team
    ? league === "cfb"
      ? getCFBTeamLogo(id, isDark)
      : getMCBBTeamLogo(id, isDark)
    : remoteUrl
      ? { uri: remoteUrl }
      : PlaceholderLogo;
  return (
    <Image
      source={source}
      style={RecruitDetailsStyles(isDark).teamLogo}
      resizeMode="contain"
      accessible={false}
    />
  );
}

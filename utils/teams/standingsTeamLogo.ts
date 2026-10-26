import type { ImageSourcePropType } from "react-native";

const PLACEHOLDER =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1781619331/placeholder/team.png";

export function getStandingsTeamLogo(
  team: { logo?: string | null; logoDark?: string | null } | null | undefined,
  isDark: boolean,
): ImageSourcePropType {
  return {
    uri: (isDark ? team?.logoDark || team?.logo : team?.logo) || PLACEHOLDER,
  };
}

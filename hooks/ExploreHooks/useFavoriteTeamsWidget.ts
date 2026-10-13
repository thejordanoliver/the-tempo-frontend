import type { FavoriteTeamSlide } from "components/Explore/Widgets/FavoriteTeamsSlider";
import { Colors } from "constants/styles";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { useMemo } from "react";
import { isFavoriteLeague } from "types/favorites";

export function useFavoriteTeamsWidget(isDark: boolean) {
  const { favorites, isLoading, ready, allTeams } = useFavoriteTeamsContext();

  const teamByFavoriteKey = useMemo(
    () =>
      new Map(
        allTeams.map((team) => [
          `${team.league.toLowerCase()}:${team.id}`,
          team,
        ]),
      ),
    [allTeams],
  );

  const slides = useMemo<FavoriteTeamSlide[]>(
    () =>
      favorites.flatMap((key) => {
        const separatorIndex = key.indexOf(":");

        if (separatorIndex === -1) {
          return [];
        }

        const league = key.slice(0, separatorIndex);
        const id = key.slice(separatorIndex + 1);

        if (!isFavoriteLeague(league)) {
          return [];
        }

        const favorite = {
          key,
          league,
          id,
        };

        const team = teamByFavoriteKey.get(key);

        return [
          {
            favorite,
            name: team?.name ?? team?.shortName ?? favorite.id,
            code: team?.code,
            primaryColor: team?.primaryColor ?? Colors.midTone,
            secondaryColor: team?.secondaryColor ?? Colors.midTone,
            fullName:
              team?.fullName ?? team?.name ?? team?.shortName ?? favorite.id,
            logo: team
              ? isDark
                ? (team.logoLight ?? team.logo)
                : team.logo
              : undefined,
          },
        ];
      }),
    [favorites, isDark, teamByFavoriteKey],
  );

  return { slides, isLoading: isLoading || !ready };
}

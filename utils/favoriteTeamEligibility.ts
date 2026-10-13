type FavoriteTeamEligibility = {
  isActive?: boolean;
  isNational?: boolean;
  isAllStar?: boolean;
};

export function isEligibleFavoriteTeam(team: FavoriteTeamEligibility): boolean {
  return (
    team.isActive === true &&
    team.isNational === false &&
    team.isAllStar === false
  );
}

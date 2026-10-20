import SharedGameHeader from "components/Sports/Basketball/GameDetails/GameHeader";
import type { VolleyballScore } from "types/volleyball/volleyball";
import { getVolleyballTeam, getVolleyballTeamLogo } from "utils/teams/volleyballTeams";
import { formatDate, formatTime, getHolidayLabel, safeDate } from "utils/common/dateUtils";

export default function GameHeader({ score, isDark }: { score: VolleyballScore; isDark: boolean }) {
  const league = score.league.code;
  const home = getVolleyballTeam(score.home.id, league);
  const away = getVolleyballTeam(score.away.id, league);
  const date = safeDate(score.date);
  return <SharedGameHeader
    homeId={Number(score.home.id) || null} awayId={Number(score.away.id) || null}
    homeName={home?.code || score.home.code || score.home.name || "Home"}
    awayName={away?.code || score.away.code || score.away.name || "Away"}
    homeLogo={getVolleyballTeamLogo(score.home.id, league, isDark)} awayLogo={getVolleyballTeamLogo(score.away.id, league, isDark)}
    homeRank={score.home.rank ?? null} awayRank={score.away.rank ?? null}
    homeScore={score.home.score ?? undefined} awayScore={score.away.score ?? undefined}
    homeRecord={score.home.record ?? "–"} awayRecord={score.away.record ?? "–"}
    homeWins={score.home.winner === true} awayWins={score.away.winner === true}
    isHomeActive={home?.isActive ?? false} isAwayActive={away?.isActive ?? false}
    date={formatDate(date)} time={formatTime(date)}
    period={`Set ${score.status.period || 1}`} clock={`Best of ${score.bestOf}`}
    headline={score.headline ?? getHolidayLabel(date) ?? ""}
    broadcast={score.broadcasts.join(" / ") || null}
    gameStatusDescription={score.status.gameStatusDescription ?? undefined}
    gameStatusDetail={score.status.shortDetail ?? score.status.gameStatusDetail ?? ""}
    state={score.status.state} league={league} isDark={isDark}
  />;
}

import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import LastFiveGamesSwitcher from "components/Sports/NBA/GameDetails/LastFiveGames";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import GameLeaders from "components/Sports/NFL/GameDetails/GameLeaders";
import GameTeamStats from "components/Sports/NFL/GameDetails/GameTeamStats";
import TeamDrives from "components/Sports/NFL/GameDetails/TeamDrives";
import TeamScoringSummary from "components/Sports/NFL/GameDetails/TeamScoringSummary";
import React from "react";
import { Game } from "types/football";
import NFLInjuries from "../GameDetails/Injuries";

type GamePreviewContentProps = {
  game: Game;
  home: any;
  away: any;
  officials: any;
  lineScore: any;
  homeLastGames: any;
  awayLastGames: any;
  stats: any;
  venueImage: any;
  venueName: any;
  venueCity: any;
  venueAddress: any;
  venueCapacity: any;
  venueAttendance: any;
  weather: any;
  isDark?: boolean;
  highlights: any;
  gameStatusDescription: string | undefined;
  previousDrives: any;
  currentDrives: any;
  scoringPlays: any;
  venue: any;
  injuries: any;
};

export default function GamePreviewContent({
  game,
  home,
  away,
  officials,
  lineScore,
  previousDrives,
  currentDrives,
  scoringPlays,
  homeLastGames,
  awayLastGames,
  stats,
  venueImage,
  venueName,
  venueCity,
  venueAddress,
  venueCapacity,
  venueAttendance,
  weather,
  highlights,
  gameStatusDescription,
  venue,
  injuries,
}: GamePreviewContentProps) {
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
    >
      {lineScore && (
        <LineScore
          linescore={lineScore}
          homeCode={home.code}
          awayCode={away.code}
          isDark
        />
      )}

      {gameStatusDescription === "In Progress" && (
        <GameLeaders
          gameId={String(game.game.id)}
          homeTeamId={String(home.id)}
          awayTeamId={String(away.id)}
          league="NFL"
          isDark
        />
      )}

      <GameTeamStats stats={stats ?? null} isDark league="NFL" />

      <TeamDrives
        previousDrives={previousDrives}
        currentDrives={currentDrives}
        homeTeamId={Number(home.espnID)}
        awayTeamId={Number(away.espnID)}
        isDark
      />

      <TeamScoringSummary
        scoringPlays={scoringPlays ?? []}
        homeTeamId={Number(home.espnID)}
        awayTeamId={Number(away.espnID)}
        league="NFL"
        isDark
      />

      <LastFiveGamesSwitcher
        home={{
          teamId: home.id,
          teamCode: home.code,
          games: homeLastGames.games,
        }}
        away={{
          teamId: away.id,
          teamCode: away.code,
          games: awayLastGames.games,
        }}
        isDark
        league="NFL"
      />

      {highlights.length > 0 && (
        <HighlightVideoList highlights={highlights} isDark />
      )}

      {/* {matchup && (
      <NFLSeriesHistory
        team2Code={getNFLTeam(matchup?.teams.team2.id)?.code ?? "UNK"}
        team1Code={getNFLTeam(matchup?.teams.team1.id)?.code ?? "UNK"}
        team1Full={matchup?.teams.team1.fullName ?? ""}
        team2Full={matchup?.teams.team2.fullName ?? ""}
        team1Wins={matchup?.series.winsA ?? 0}
        team2Wins={matchup?.series.winsB ?? 0}
        ties={matchup?.series.ties ?? 0}
        games={seriesGames}
        team1Logo={getNFLTeam(matchup?.teams.team1.id)?.logo}
        team2Logo={getNFLTeam(matchup?.teams.team2.id)?.logo}
        team1LogoLight={getNFLTeam(matchup?.teams.team1.id)?.logoLight}
        team2LogoLight={getNFLTeam(matchup?.teams.team2.id)?.logoLight}
      />
    )} */}

      {!injuries && (
        <NFLInjuries
          injuries={injuries}
          loading={false}
          error={null}
          homeTeamId={home.espnID}
          awayTeamId={away.espnID}
          awayTeamAbbr={away.code}
          homeTeamAbbr={away.code}
          isDark
        />
      )}

      <Officials officials={officials} loading={false} error={null} isDark />

      <GameLocation
        venueImage={venueImage}
        venueName={venueName}
        location={venueCity}
        address={venueAddress}
        venueCapacity={venueCapacity}
        venueAttendance={venueAttendance}
        loading={false}
        error={null}
        isDark
        surface="football"
        grass={venue?.grass ?? undefined}
        weather={weather}
      />
    </BottomSheetScrollView>
  );
}

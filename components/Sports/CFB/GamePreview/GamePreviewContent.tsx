import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import LastFiveGames from "components/Sports/NBA/GameDetails/LastFiveGames";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import GameLeaders from "components/Sports/NFL/GameDetails/GameLeaders";
import GameTeamStats from "components/Sports/NFL/GameDetails/GameTeamStats";
import TeamDrives from "components/Sports/NFL/GameDetails/InjuryReport/TeamDrives";
import TeamScoringSummary from "components/Sports/NFL/GameDetails/TeamScoringSummary";
import React from "react";
import { FootballGame } from "types/football";

type GamePreviewContentProps = {
  game: FootballGame;
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
  gameStatusDescription: string;
  previousDrives: any;
  currentDrives: any;
  scoringPlays: any;
  venue: any;
};

const LEAGUE = "CFB";

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
}: GamePreviewContentProps) {
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
    >
      <LineScore
        linescore={lineScore}
        homeCode={home.code}
        awayCode={away.code}
        isDark
        gameStatusDescription={gameStatusDescription}
      />

      <GameLeaders
        gameId={String(game.game.id)}
        homeTeamId={String(home.id)}
        awayTeamId={String(away.id)}
        league={LEAGUE}
        isDark
        gameStatusDescription={gameStatusDescription}
      />

      <GameTeamStats stats={stats} isDark league={LEAGUE} />

      <TeamDrives
        previousDrives={previousDrives ?? []}
        currentDrives={currentDrives ?? []}
        homeTeamId={home?.espnID}
        awayTeamId={away?.espnID}
        league={LEAGUE}
        isDark
        gameStatusDescription={gameStatusDescription}
      />

      <TeamScoringSummary
        scoringPlays={scoringPlays ?? []}
        homeTeamId={home?.espnID}
        awayTeamId={away?.espnID}
        league={LEAGUE}
        isDark
        gameStatusDescription={gameStatusDescription}
      />

      <LastFiveGames
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
        league={LEAGUE}
        gameStatusDescription={gameStatusDescription}
        isDark
      />

      <HighlightVideoList highlights={highlights} isDark />

      <Officials
        officials={officials}
        gameStatusDescription={gameStatusDescription}
        isDark
      />

      <GameLocation
        venueImage={venueImage}
        venueName={venueName}
        location={venueCity}
        address={venueAddress}
        venueCapacity={venueCapacity}
        venueAttendance={venueAttendance}
        surface="football"
        grass={venue?.grass}
        weather={weather}
        isDark
      />
    </BottomSheetScrollView>
  );
}

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
import { Game } from "types/nfl";

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

      {(gameStatusDescription === "Final" ||
        gameStatusDescription === "In Progress") && (
        <GameLeaders
          gameId={String(game.game.id)}
          homeTeamId={String(home.id)}
          awayTeamId={String(away.id)}
          league="CFB"
          isDark
        />
      )}
      {stats && <GameTeamStats stats={stats} isDark league="CFB" />}

      <TeamDrives
        previousDrives={previousDrives ?? []}
        currentDrives={currentDrives ?? []}
        homeTeamId={home?.espnID}
        awayTeamId={away?.espnID}
        isDark
        league="CFB"
      />
      <TeamScoringSummary
        scoringPlays={scoringPlays ?? []}
        homeTeamId={home?.espnID}
        awayTeamId={away?.espnID}
        league="CFB"
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
        league="CFB"
      />

      {highlights.length > 0 && (
        <HighlightVideoList highlights={highlights} isDark />
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
        grass={venue?.grass}
        weather={weather}
      />
    </BottomSheetScrollView>
  );
}

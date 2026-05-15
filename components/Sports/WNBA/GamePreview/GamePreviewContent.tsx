import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import BoxScore from "components/Sports/CBB/GameDetails/BoxScore";
import GameLeaders from "components/Sports/CBB/GameDetails/GameLeaders";
import GameTeamStats from "components/Sports/CBB/GameDetails/GameTeamStats";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import LastFiveGames from "components/Sports/NBA/GameDetails/LastFiveGames";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import React from "react";
import { BasketballGame, BasketballTeam } from "types/basketball";

type GamePreviewContentProps = {
  game: BasketballGame;
  home: BasketballTeam | undefined;
  away: BasketballTeam | undefined;
  officials: any;
  lineScore: any;
  leaders: any;
  teamStats: any;
  homeLastGames: any;
  awayLastGames: any;
  playerStats: any;
  data?: any;
  venueImage: any;
  venueName: any;
  venueAddress?: string;
  venueLocation?: string;
  venueCapacity: any;
  venueAttendance?: number | null;
  weather: any;
  highlights: any;
  gameStatusDescription: string;
};

export default function GamePreviewContent({
  game,
  home,
  away,
  officials,
  lineScore,
  leaders,
  homeLastGames,
  awayLastGames,
  playerStats,
  teamStats,
  venueImage,
  venueName,
  venueAddress,
  venueCapacity,
  venueLocation,
  venueAttendance,
  weather,
  highlights,
  gameStatusDescription,
}: GamePreviewContentProps) {
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
    >
      <LineScore
        linescore={lineScore}
        homeCode={home?.code ?? ""}
        awayCode={away?.code ?? ""}
        league={"WNBA"}
        gameStatusDescription={gameStatusDescription}
        isDark
      />

      <GameLeaders
        leaders={leaders}
        awayTeamId={Number(away?.espnID)}
        homeTeamId={Number(home?.espnID)}
        league={"wnba"}
        gameStatusDescription={gameStatusDescription}
        isDark
      />

      <GameTeamStats
        stats={teamStats}
        league={"WNBA"}
        gameStatusDescription={gameStatusDescription}
        isDark
      />

      <LastFiveGames
        home={{
          teamId: home?.id,
          teamCode: home?.code ?? "",
          games: homeLastGames?.games ?? [],
        }}
        away={{
          teamId: away?.id,
          teamCode: away?.code ?? "",
          games: awayLastGames?.games ?? [],
        }}
        league={"WNBA"}
        gameStatusDescription={gameStatusDescription}
        isDark={true}
      />

      <BoxScore
        playerStats={playerStats}
        awayTeamId={Number(away?.espnID)}
        homeTeamId={Number(home?.espnID)}
        league={"WNBA"}
        gameStatusDescription={gameStatusDescription}
        isDark
      />

      <HighlightVideoList highlights={highlights} isDark />

      <Officials
        officials={officials ?? []}
        gameStatusDescription={gameStatusDescription}
        isDark
      />

      <GameLocation
        venueImage={venueImage}
        venueName={venueName}
        location={venueLocation}
        address={venueAddress}
        venueCapacity={venueCapacity}
        venueAttendance={venueAttendance}
        weather={weather}
        isDark
      />
    </BottomSheetScrollView>
  );
}

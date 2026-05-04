import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import BoxScore from "components/Sports/CBB/GameDetails/BoxScore";
import GameLeaders from "components/Sports/CBB/GameDetails/GameLeaders";
import GameTeamStats from "components/Sports/CBB/GameDetails/GameTeamStats";
import {
  GameLocation,
  LastFiveGames,
  LineScore,
} from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import React from "react";
import { BasketballGame } from "types/basketball";

type GamePreviewContentProps = {
  game: BasketballGame;
  home: any;
  away: any;
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
  venueCity: any;
  venueAddress?: string;
  venueCapacity: any;
  weather: any;
  isDark?: boolean;
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
  venueCity,
  venueAddress,
  venueCapacity,
  weather,
  highlights,
  gameStatusDescription,
}: GamePreviewContentProps) {
  const isWomen = game.league.id === 423;

  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
    >
      {lineScore && (
        <LineScore
          linescore={lineScore}
          homeCode={home?.code ?? ""}
          awayCode={away?.code ?? ""}
          league={isWomen ? "WCBB" : "CBB"}
          isDark
        />
      )}

      <GameLeaders
        leaders={leaders}
        awayTeamId={Number(away.espnID)}
        homeTeamId={Number(home.espnID)}
        league={isWomen ? "wcbb" : "cbb"}
        gameStatusDescription={gameStatusDescription}
        isDark
      />

      <GameTeamStats
        stats={teamStats}
        gameStatusDescription={gameStatusDescription}
        league={isWomen ? "WCBB" : "CBB"}
        isDark
      />

      <LastFiveGames
        home={{
          teamId: home?.id,
          teamCode: home?.code ?? "",
          games: homeLastGames?.games,
        }}
        away={{
          teamId: away?.id,
          teamCode: away?.code ?? "",
          games: awayLastGames?.games,
        }}
        league={isWomen ? "WCBB" : "CBB"}
        isDark
      />

      {playerStats && (
        <BoxScore
          playerStats={playerStats}
          awayTeamId={Number(away.espnId)}
          homeTeamId={Number(home.espnId)}
          league={isWomen ? "WCBB" : "CBB"}
          gameStatusDescription={gameStatusDescription}
          isDark
        />
      )}

      <HighlightVideoList highlights={highlights} isDark />

      <Officials
        officials={officials ?? []}
        gameStatusDescription={gameStatusDescription}
        isDark
      />

      <GameLocation
        venueImage={venueImage}
        venueName={venueName}
        address={venueAddress}
        venueCapacity={venueCapacity}
        weather={weather}
        isDark
      />
    </BottomSheetScrollView>
  );
}

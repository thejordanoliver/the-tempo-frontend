import type { useNFLBracketModel } from "hooks/FootballHooks/useNFLBracketModel";
import { Text } from "react-native";
import { NFLPlayoffBracketStyles } from "styles/PlayoffStyles/NFLPlayoffBracketStyles";
import type { Conference } from "../../../../../types/football/nflBracketTypes";
import { gameContainsTeam } from "../../../../../utils/nflBracketUtils";
import { BracketConnectors } from "./BracketConnectors";
import { ByeTeamCard } from "./ByeTeamCard";
import { MatchupCard } from "./MatchupCard";

export function ConferenceBracket({
  model,
  conference,
  isDark,
}: {
  model: ReturnType<typeof useNFLBracketModel>;
  conference: Conference;
  isDark: boolean;
}) {
  const styles = NFLPlayoffBracketStyles(isDark);
  const isAfc = conference === "AFC";
  const wildCard = isAfc ? model.afcWildCard : model.nfcWildCard;
  const divisional = isAfc ? model.afcDivisional : model.nfcDivisional;
  const championship = isAfc ? model.afcConference : model.nfcConference;
  const byeTeam = isAfc ? model.afcByeTeam : model.nfcByeTeam;
  const byeLayout = isAfc ? model.AFC_BYE : model.NFC_BYE;
  const wildCardLayouts = isAfc ? model.AFC_R1 : model.NFC_R1;
  const divisionalLayouts = isAfc ? model.AFC_R2 : model.NFC_R2;
  const championshipLayout = isAfc ? model.AFC_R3 : model.NFC_R3;
  const connections = isAfc ? model.afcConnections : model.nfcConnections;
  const byeTargetIndex = Math.max(
    0,
    divisional.findIndex(
      (game) => byeTeam && gameContainsTeam(game, Number(byeTeam.id)),
    ),
  );

  return (
    <>
      <BracketConnectors
        isDark={isDark}
        connections={[
          ...connections,
          { source: byeLayout, target: divisionalLayouts[byeTargetIndex] },
        ]}
      />
      <ByeTeamCard team={byeTeam} layout={byeLayout} isDark={isDark} />
      <Text
        style={[styles.sideLabel, isAfc ? styles.afcLabel : styles.nfcLabel]}
      >
        {conference}
      </Text>
      {wildCard.map((game, index) =>
        wildCardLayouts[index] ? (
          <MatchupCard
            key={`${conference}-wild-card-${game.id}`}
            game={game}
            layout={wildCardLayouts[index]}
            isDark={isDark}
          />
        ) : null,
      )}
      {divisional.map((game, index) =>
        divisionalLayouts[index] ? (
          <MatchupCard
            key={`${conference}-divisional-${game.id}`}
            game={game}
            layout={divisionalLayouts[index]}
            isDark={isDark}
          />
        ) : null,
      )}
      {championship ? (
        <MatchupCard
          key={`${conference}-conference-${championship.id}`}
          game={championship}
          layout={championshipLayout}
          isDark={isDark}
        />
      ) : null}
    </>
  );
}

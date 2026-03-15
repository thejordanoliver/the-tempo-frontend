import { Text, View } from "react-native";
import { gameHeaderStyles } from "styles/GameDetailStyles/GameHeaderStyles";
import { MMAFighter } from "types/mma";
import { FighterRow } from "./FighterRow";
import { GameInfo } from "./GameInfo";
type Props = {
  headlineText: string | null;
  seasonState?: string | null;
  firstFighter: MMAFighter;
  secondFighter: MMAFighter;
  firstFighterIsWinner: boolean;
  secondFighterIsWinner: boolean;
  period?: number;
  displayClock: string;
  isDark: boolean;
  formattedDate?: string;
  time?: string;
  networkString?: string;
  refreshTick?: number;
  firstFighterRecord?: string;
  secondFighterRecord?: string;
  gameStatusDescription: string | undefined;
  gameStatusDetail: string | undefined;
};

export default function GameHeader({
  headlineText,
  firstFighter,
  secondFighter,
  firstFighterRecord,
  secondFighterRecord,
  gameStatusDetail,
  gameStatusDescription,
  period,
  displayClock,
  isDark,
  formattedDate = "",
  time = "",
  networkString = "",
  refreshTick = 0,
  firstFighterIsWinner,
  secondFighterIsWinner,
}: Props) {
  const styles = gameHeaderStyles(isDark);

  return (
    <View style={styles.container}>
      <Text style={styles.headlineText}>{headlineText}</Text>

      <View style={styles.teamsContainer}>
        {/* Away Team Row */}
        <FighterRow
          key={`secondFighter-${refreshTick}`}
          fighter={{
            id: secondFighter?.id,
            name: secondFighter?.short_name ?? "",
            record: secondFighterRecord,
            headshot: secondFighter?.images[0]?.href,
          }}
          isDark={isDark}
          isWinner={secondFighterIsWinner}
          gameStatusDescription={gameStatusDescription}
          isFirstFighter={false}
        />

        <View>
          {/* Game Info */}
          <GameInfo
            key={`gameinfo-${refreshTick}`}
            gameStatusDescription={gameStatusDescription}
            gameStatusDetail={gameStatusDetail}
            date={formattedDate || new Date().toISOString()}
            time={time}
            period={period}
            clock={displayClock}
            isDark={isDark}
            broadcastNetworks={networkString}
          />
        </View>

        {/* Home Team Row */}
        <FighterRow
          key={`firstFighter-${refreshTick}`}
          fighter={{
            id: firstFighter?.id,
            name: firstFighter?.short_name ?? "",
            record: firstFighterRecord,
            headshot: firstFighter?.images[0]?.href,
          }}
          isDark={isDark}
          isWinner={firstFighterIsWinner}
          gameStatusDescription={gameStatusDescription}
          isFirstFighter={true}
        />
      </View>
    </View>
  );
}

import { Colors } from "@/constants/styles";
import { winnerStyle } from "@/utils/games";
import { Image, Text, View } from "react-native";
import { CFPBracketStyles } from "styles/PlayoffStyles/CFPBracketStyles";

type TeamRowType = {
  id?: number;
  logo: any;
  name: string;
  score: string | number;
  record: string;
  possession: boolean;
  rank: string | number | null;
  state: string;
  winner: boolean;
  isDark: boolean;
};

export function TeamRow({
  id,
  logo,
  name,
  score,
  record,
  possession,
  rank,
  winner,
  isDark,
  state,
}: TeamRowType) {
  const styles = CFPBracketStyles(isDark);
  const isScheduled = state === "pre";
  const showRecord = isScheduled;

  return (
    <View style={styles.teamRow}>
      <Text style={[styles.seedText, winner && styles.winnerText]}>
        {rank ?? "-"}
      </Text>

      <Image source={logo} style={styles.teamLogo} resizeMode="contain" />

      <Text
        numberOfLines={1}
        style={[styles.teamCode, winner && styles.winnerText]}
      >
        {name}
      </Text>

      <View
        style={[
          styles.winsBadge,
          winner && { backgroundColor: Colors.light.gold },
        ]}
      >
        <Text
          style={
            showRecord
              ? styles.record
              : [
                  styles.score,
                  winnerStyle({
                    isWinner: winner,
                    isDark,
                  }),
                ]
          }
        >
          {showRecord ? record : score}
        </Text>
      </View>
    </View>
  );
}

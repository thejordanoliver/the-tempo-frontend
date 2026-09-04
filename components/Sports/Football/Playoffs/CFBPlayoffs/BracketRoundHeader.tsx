import { Text, View } from "react-native";
import {
  CARD_WIDTH,
  CFPBracketStyles,
} from "styles/PlayoffStyles/CFPBracketStyles";

/*
|--------------------------------------------------------------------------
| Round Header
|--------------------------------------------------------------------------
*/

export function BracketRoundHeader({
  title,
  date,
  x,
  width = CARD_WIDTH,
  championship = false,
  isDark,
}: {
  title: string;
  date: string;
  x: number;
  width?: number;
  championship?: boolean;
  isDark: boolean;
}) {
  const styles = CFPBracketStyles(isDark);

  return (
    <View
      style={[
        styles.roundHeader,

        {
          left: x,
          width,
        },
      ]}
    >
      <Text
        style={[
          styles.roundTitle,

          championship && styles.championshipRoundTitle,
        ]}
      >
        {title}
      </Text>

      <Text style={styles.roundDate}>{date}</Text>
    </View>
  );
}

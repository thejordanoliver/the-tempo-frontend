import { Text, View } from "react-native";
import {
  CARD_WIDTH,
  CFPBracketStyles,
  LABEL_TOP,
  LABEL_WIDTH,
} from "styles/PlayoffStyles/CFPBracketStyles";

/*
|--------------------------------------------------------------------------
| Round Header
|--------------------------------------------------------------------------
*/

export function RoundLabel({
  title,
  x,
  width = CARD_WIDTH,
  championship = false,
  isDark,
}: {
  title: string;
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
          {
            top: LABEL_TOP,
      
            width: LABEL_WIDTH,
            textAlign: "center",
          },
          championship && styles.championshipRoundTitle,
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

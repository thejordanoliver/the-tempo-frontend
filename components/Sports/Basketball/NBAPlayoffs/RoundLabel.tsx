import {
  LABEL_TOP,
  LABEL_WIDTH,
  NBAPlayoffBracketStyles,
} from "@/styles/PlayoffStyles/NBAPlayoffBraketStyles";
import { Text, View } from "react-native";

export const RoundLabel = ({
  title,
  x,
  isDark,
}: {
  title: string;
  x: number;
  isDark: boolean;
}) => {
  const styles = NBAPlayoffBracketStyles(isDark);

  return (
    <View style={styles.roundHeader}>
      <Text
        style={[
          styles.roundTitle,
          {
            top: LABEL_TOP,
            left: x - LABEL_WIDTH / 2,
            width: LABEL_WIDTH,
            textAlign: "center",
          },
        ]}
      >
        {title}
      </Text>
    </View>
  );
};

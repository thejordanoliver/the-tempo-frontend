import {
  LABEL_TOP,
  LABEL_WIDTH,
  nbaPlayoffBracketStyles,
} from "@/styles/PlayoffStyles/NBAPlayoffBraketStyles";
import { Text } from "react-native";

export const RoundLabel = ({
  title,
  x,
  isDark,
}: {
  title: string;
  x: number;
  isDark: boolean;
}) => {
  const styles = nbaPlayoffBracketStyles(isDark);

  return (
    <Text
      style={[
        styles.roundLabel,
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
  );
};

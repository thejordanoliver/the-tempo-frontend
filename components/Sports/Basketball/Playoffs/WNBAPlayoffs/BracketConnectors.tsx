import { View } from "react-native";
import {
  WNBA_BRACKET_CONNECTORS,
  WNBAPlayoffBracketStyles,
} from "styles/PlayoffStyles/WNBAPlayoffBracketStyles";

type Props = { color: string; isDark: boolean };

export default function BracketConnectors({ color, isDark }: Props) {
  const styles = WNBAPlayoffBracketStyles(isDark);
  return WNBA_BRACKET_CONNECTORS.map(({ id, fork, stem }) => (
    <View key={id} pointerEvents="none">
      <View style={[styles.connectorFork, fork]} />
      <View style={[styles.connectorStem, stem]} />
    </View>
  ));
}

import { Text } from "react-native";
import { gameWidgetStyles } from "styles/ExploreStyles/GameWidgetStyles";

export default function displayeValue(
  isHome = true,
  status = true,
  isFinal = true,
  winner = true,
  record = "",
  score = 0,
  isDark = true,
  height = 150,
  width = 150,
) {
  const styles = gameWidgetStyles(isDark, height, width);

  if (isHome === true && status === true) {
    return (
      <Text
        style={styles.homeRecord}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {record}
      </Text>
    );
  }
  if (isHome === false && status === true) {
    return (
      <Text
        style={styles.awayRecord}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {record}
      </Text>
    );
  }
  if (isHome === true && status === false) {
    return (
      <Text
        style={[styles.homeScore, isFinal && { opacity: winner ? 1 : 0.5 }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {score}
      </Text>
    );
  } else if (isHome === false && status === false) {
    return (
      <Text
        style={[styles.awayScore, isFinal && { opacity: winner ? 1 : 0.5 }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {score}
      </Text>
    );
  } else {
    return "-";
  }
}

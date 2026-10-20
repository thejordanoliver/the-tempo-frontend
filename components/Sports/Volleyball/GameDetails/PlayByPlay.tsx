import { Text, View } from "react-native";
import HeadingTwo from "components/Headings/HeadingTwo";
import { globalStyles } from "constants/styles";
import { lastPlayStyles } from "styles/GameDetailStyles/LastPlay.styles";
import type { VolleyballPlay } from "types/volleyball/volleyball";

export default function PlayByPlay({ plays, isDark }: { plays: VolleyballPlay[]; isDark: boolean }) {
  const styles = lastPlayStyles(isDark);
  const global = globalStyles(isDark);
  if (!plays.length) return null;
  return <View>
    <HeadingTwo isDark={isDark}>Recent Plays</HeadingTwo>
    <View style={styles.wrapper}>{plays.slice(-20).reverse().map((play) => <View key={play.id} style={styles.row}>
      <View>
        <Text style={global.caption}>{play.period ? `Set ${play.period}` : "Play"}{play.homeScore !== null && play.awayScore !== null ? ` · ${play.awayScore} – ${play.homeScore}` : ""}</Text>
        <Text style={global.text}>{play.text ?? "Point recorded"}</Text>
      </View>
    </View>)}</View>
  </View>;
}

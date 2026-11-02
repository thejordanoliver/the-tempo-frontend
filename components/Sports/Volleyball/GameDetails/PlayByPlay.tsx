import { Text, View } from "react-native";
import HeadingTwo from "components/Headings/HeadingTwo";
import { PlayByPlayStyles } from "styles/GameDetailStyles/PlayByPlayStyles";
import { lastPlayStyles } from "styles/GameDetailStyles/LastPlay.styles";
import type { VolleyballPlay } from "types/volleyball/volleyball";

export default function PlayByPlay({
  plays,
  isDark,
}: {
  plays: VolleyballPlay[];
  isDark: boolean;
}) {
  const styles = lastPlayStyles(isDark);
  const playStyles = PlayByPlayStyles(isDark);
  if (!plays.length) return null;
  const recentPlays = plays.slice(-20).reverse();
  return (
    <View>
      <HeadingTwo isDark={isDark}>Recent Plays</HeadingTwo>
      <View style={styles.wrapper}>
        {recentPlays.map((play, index) => (
          <View
            key={play.id}
            style={[
              playStyles.recentPlay,
              index < recentPlays.length - 1 && playStyles.recentPlayDivider,
            ]}
          >
            <View style={playStyles.recentPlayMeta}>
              <Text style={playStyles.eyebrow}>
                {play.period ? `Set ${play.period}` : "Play"}
              </Text>
              {play.homeScore !== null && play.awayScore !== null ? (
                <Text
                  style={playStyles.situationValue}
                  accessibilityLabel={`Away ${play.awayScore}, home ${play.homeScore}`}
                >
                  {play.awayScore} – {play.homeScore}
                </Text>
              ) : null}
            </View>
            <Text style={playStyles.recentPlayText}>
              {play.text ?? "Point recorded"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

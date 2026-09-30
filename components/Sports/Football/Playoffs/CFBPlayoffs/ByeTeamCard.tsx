import { Image, Text, View } from "react-native";
import { CFPBracketStyles } from "styles/PlayoffStyles/CFPBracketStyles";

/*
|--------------------------------------------------------------------------
| Bye Team Card
|--------------------------------------------------------------------------
*/

export function ByeTeamCard({
  x,
  y,
  name,
  logo,
  rank,
  isDark,
}: {
  x: number;
  y: number;
  name: string;
  logo: any;
  rank: number | null | undefined;
  isDark: boolean;
}) {
  const styles = CFPBracketStyles(isDark);

  return (
    <View
      style={[
        styles.byeCard,

        {
          left: x,
          top: y,
        },
      ]}
    >
      <View style={styles.byeTeamContent}>
        <View style={styles.byeSeedContainer}>
          <Text style={styles.byeSeed}>{rank}</Text>
        </View>

        <Image source={logo} resizeMode="contain" style={styles.byeLogo} />

        <Text numberOfLines={1} style={styles.byeTeamName}>
          {name}
        </Text>

        <Text style={styles.byeLabel}>BYE</Text>
      </View>
    </View>
  );
}

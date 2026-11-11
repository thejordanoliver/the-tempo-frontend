import type { ReactNode } from "react";
import { Image, type ImageSourcePropType, Text, View } from "react-native";
import { PlayByPlayStyles } from "styles/GameDetailStyles/PlayByPlayStyles";

type Props = {
  isDark: boolean;
  title: string;
  logo?: ImageSourcePropType | null;
  period?: string | null;
  clock?: string | null;
  isLive?: boolean;
  badge?: ReactNode;
};

export default function PlayByPlayHeader({
  isDark,
  title,
  logo,
  period,
  clock,
  isLive = false,
  badge,
}: Props) {
  const styles = PlayByPlayStyles(isDark);
  const displayTitle = title
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerMeta}>
        <View style={styles.liveRow}>
          {isLive ? <View style={styles.liveDot} /> : null}
          <Text style={styles.eyebrow}>
            {isLive ? "Live play" : "Play details"}
          </Text>
        </View>
        {period || clock ? (
          <View style={styles.liveRow}>
            {period ? <Text style={styles.periodText}>{period}</Text> : null}
            {period && clock ? <View style={styles.divider} /> : null}
            {clock ? <Text style={styles.gameTime}>{clock}</Text> : null}
          </View>
        ) : null}
        {badge}
      </View>
      <View style={styles.headerRow}>
        <View style={styles.headerIdentity}>
          {logo ? (
            <View style={styles.headerLogoFrame}>
              <Image
                source={logo}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
          ) : null}
          <Text style={styles.titleText} numberOfLines={2}>
            {displayTitle}
          </Text>
        </View>
      </View>
    </View>
  );
}

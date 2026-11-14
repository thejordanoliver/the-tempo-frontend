import HeadingTwo from "components/Headings/HeadingTwo";
import { useMemo } from "react";
import { Image, type ImageSourcePropType, Text, View } from "react-native";
import { OddsStyles } from "styles/GameDetailStyles/OddsStyles";
import type { GameOdds, ScoreboardOdds } from "types/odds";
import { getOddsDisplay, type OddsCell } from "utils/games/odds";

export type { TeamOdds } from "types/odds";

interface Props {
  homeId: number | string;
  homeCode: string;
  homeLogo: ImageSourcePropType | null;
  awayId: number | string;
  awayCode: string;
  awayLogo: ImageSourcePropType | null;
  odds?: GameOdds | ScoreboardOdds | null;
  isDark: boolean;
  state?: string | null;
  homeLabel?: string;
  awayLabel?: string;
}

function Price({
  cell,
  styles,
}: {
  cell: OddsCell | null;
  styles: ReturnType<typeof OddsStyles>;
}) {
  return (
    <View style={styles.priceCell}>
      <Text
        style={[styles.value, !cell && styles.unavailable]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {cell?.value ?? "—"}
      </Text>
      {cell?.price && <Text style={styles.price}>{cell.price}</Text>}
      {cell?.isOpening && <Text style={styles.opening}>Opening</Text>}
      {cell?.opening && <Text style={styles.opening}>{cell.opening}</Text>}
    </View>
  );
}

function describe(cell: OddsCell | null) {
  return cell
    ? [
        cell.value,
        cell.price,
        cell.isOpening ? "opening line" : null,
        cell.opening,
      ]
        .filter(Boolean)
        .join(", ")
    : "unavailable";
}

export default function Odds({
  homeCode,
  homeLogo,
  awayCode,
  awayLogo,
  odds,
  isDark,
  state,
  homeLabel = "Home",
  awayLabel = "Away",
}: Props) {
  const styles = useMemo(() => OddsStyles(isDark), [isDark]);
  const display = useMemo(() => (odds ? getOddsDisplay(odds) : null), [odds]);

  if (
    state !== "pre" ||
    !odds ||
    !display ||
    (!display.rows.length && !display.draw)
  )
    return null;

  const provider =
    typeof odds.provider === "string"
      ? odds.provider
      : (odds.provider?.displayName ?? odds.provider?.name);

  return (
    <View style={styles.outerContainer}>
      <HeadingTwo isDark={isDark}>Odds</HeadingTwo>
      <View style={styles.wrapper}>
        <View style={styles.headerRow}>
          <View
            style={styles.teamHeader}
            accessible
            accessibilityLabel={`${awayCode}, ${awayLabel}`}
          >
            {awayLogo && (
              <Image source={awayLogo} style={styles.logo} accessible={false} />
            )}
            <Text style={styles.teamCode} numberOfLines={3}>
              {awayCode}
            </Text>
          </View>

          <View
            style={[styles.teamHeader, styles.homeHeader]}
            accessible
            accessibilityLabel={`${homeCode}, ${homeLabel}`}
          >
            <Text style={[styles.teamCode, styles.homeCode]} numberOfLines={3}>
              {homeCode}
            </Text>
            {homeLogo && (
              <Image source={homeLogo} style={styles.logo} accessible={false} />
            )}
          </View>
        </View>

        <View style={styles.markets}>
          {display.rows.map((row, index) => (
            <View
              key={row.key}
              style={[styles.marketRow, index > 0 && styles.marketDivider]}
              accessible
              accessibilityLabel={
                row.key === "total"
                  ? `Game total. ${describe(row.away)}. ${describe(row.home)}.`
                  : `${row.label}. ${awayCode}, ${describe(row.away)}. ${homeCode}, ${describe(row.home)}.`
              }
            >
              <Text style={styles.marketLabel}>{row.label}</Text>
              <View style={styles.valuesRow}>
                <Price cell={row.away} styles={styles} />
                <Price cell={row.home} styles={styles} />
              </View>
            </View>
          ))}

          {display.draw && (
            <View
              style={[
                styles.marketRow,
                display.rows.length > 0 && styles.marketDivider,
              ]}
              accessible
              accessibilityLabel={`Draw moneyline. ${describe(display.draw)}.`}
            >
              <Text style={styles.marketLabel}>Draw</Text>
              <View style={styles.valuesRow}>
                <Price cell={display.draw} styles={styles} />
              </View>
            </View>
          )}
        </View>

        {(provider || odds.details) && (
          <View style={styles.footer}>
            {provider && (
              <Text style={styles.provider}>Odds by {provider}</Text>
            )}
            {odds.details && <Text style={styles.details}>{odds.details}</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

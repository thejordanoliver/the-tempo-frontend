import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerStatTableSkeleton from "components/Skeletons/PlayerStatsTableSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { PlayerSeason } from "hooks/NBAHooks/usePlayerSeasons";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { statsTableStyles } from "styles/PlayerStyles/StatsTableStyles";

interface Props {
  seasons: PlayerSeason[];
  loading: boolean;
  error: string | null;
}

type StatView = "totals" | "pergame" | "per36";

type CareerTotals = {
  g: number;
  pts: number;
  mp: number;
  fg: number;
  fga: number;
  three_p: number;
  three_pa: number;
  ft: number;
  fta: number;
  trb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number;
};

const STAT_OPTIONS = [
  { label: "Totals", value: "totals" },
  { label: "Per Game", value: "pergame" },
  { label: "Per 36 Minutes", value: "per36" },
];

const TABLE_HEADERS = [
  "AGE",
  "GP",
  "MIN",
  "PTS",
  "FG",
  "FGA",
  "FG%",
  "3P",
  "3PA",
  "3P%",
  "FT",
  "FTA",
  "FT%",
  "REB",
  "AST",
  "STL",
  "BLK",
  "TO",
  "PF",
];

const NBA_STAT_GLOSSARY = [
  { abbr: "GP", label: "Games Played" },
  { abbr: "PTS", label: "Points" },
  { abbr: "MIN", label: "Minutes Played" },
  { abbr: "FG", label: "Field Goals Made" },
  { abbr: "FGA", label: "Field Goals Attempted" },
  { abbr: "FG%", label: "Field Goal Percentage" },
  { abbr: "3P", label: "3-Point Field Goals Made" },
  { abbr: "3PA", label: "3-Point Field Goals Attempted" },
  { abbr: "3P%", label: "3-Point Percentage" },
  { abbr: "FT", label: "Free Throws Made" },
  { abbr: "FTA", label: "Free Throws Attempted" },
  { abbr: "FT%", label: "Free Throw Percentage" },
  { abbr: "REB", label: "Total Rebounds" },
  { abbr: "AST", label: "Assists" },
  { abbr: "STL", label: "Steals" },
  { abbr: "BLK", label: "Blocks" },
  { abbr: "TO", label: "Turnovers" },
  { abbr: "PF", label: "Personal Fouls" },
];

const EMPTY_CAREER_TOTALS: CareerTotals = {
  g: 0,
  pts: 0,
  mp: 0,
  fg: 0,
  fga: 0,
  three_p: 0,
  three_pa: 0,
  ft: 0,
  fta: 0,
  trb: 0,
  ast: 0,
  stl: 0,
  blk: 0,
  tov: 0,
  pf: 0,
};

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }

  return out;
};

const toNumber = (value?: number | string | null) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatNumber = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

const perGame = (stat?: number | null, games?: number | null) => {
  const g = toNumber(games);
  if (g <= 0) return "0.0";

  return (toNumber(stat) / g).toFixed(1);
};

const per36 = (stat?: number | null, minutes?: number | null) => {
  const mp = toNumber(minutes);
  if (mp <= 0) return "0.0";

  return ((toNumber(stat) / mp) * 36).toFixed(1);
};

const pct = (value?: number | string | null) => {
  const num = Number(value);

  if (!Number.isFinite(num)) {
    return "—";
  }

  return `${(num * 100).toFixed(1)}%`;
};

const getStatValue = (
  statView: StatView,
  stat?: number | null,
  games?: number | null,
  minutes?: number | null,
) => {
  if (statView === "pergame") {
    return perGame(stat, games);
  }

  if (statView === "per36") {
    return per36(stat, minutes);
  }

  return formatNumber(stat);
};

export default function PlayerStatTable({ seasons, loading, error }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = statsTableStyles(isDark);
  const global = globalStyles(isDark);

  const [statView, setStatView] = useState<StatView>("totals");

  const bestSeason = useMemo(() => {
    let best: string | null = null;
    let maxPpg = -1;

    seasons.forEach((season) => {
      const games = toNumber(season.g);
      const points = toNumber(season.pts);
      const ppg = games > 0 ? points / games : 0;

      if (ppg > maxPpg) {
        maxPpg = ppg;
        best = season.season;
      }
    });

    return best;
  }, [seasons]);

  const career = useMemo(() => {
    return seasons.reduce<CareerTotals>(
      (acc, season) => {
        acc.g += toNumber(season.g);
        acc.pts += toNumber(season.pts);
        acc.mp += toNumber(season.mp);
        acc.fg += toNumber(season.fg);
        acc.fga += toNumber(season.fga);
        acc.three_p += toNumber(season.three_p);
        acc.three_pa += toNumber(season.three_pa);
        acc.ft += toNumber(season.ft);
        acc.fta += toNumber(season.fta);
        acc.trb += toNumber(season.trb);
        acc.ast += toNumber(season.ast);
        acc.stl += toNumber(season.stl);
        acc.blk += toNumber(season.blk);
        acc.tov += toNumber(season.tov);
        acc.pf += toNumber(season.pf);

        return acc;
      },
      { ...EMPTY_CAREER_TOTALS },
    );
  }, [seasons]);

  const getRowStyle = (index: number, season?: string | null) => {
    const isAlt = index % 2 === 1;

    const zebra = isAlt
      ? isDark
        ? styles.rowAltDark
        : styles.rowAltLight
      : null;

    const highlight = season === bestSeason ? styles.best : null;

    return [styles.row, zebra, highlight];
  };

  const getCareerStatValue = (
    stat?: number | null,
    games?: number | null,
    minutes?: number | null,
  ) => {
    return getStatValue(statView, stat, games, minutes);
  };

  if (loading) {
    return (
      <View>
        <PlayerStatTableSkeleton />
      </View>
    );
  }

  if (error) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Failed to load stats</Text>
      </View>
    );
  }

  if (!seasons.length) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>No stats available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Career Stats</HeadingTwo>

      <Dropdown
        isDark={isDark}
        options={STAT_OPTIONS}
        selectedValue={statView}
        onSelect={(value) => setStatView(value as StatView)}
        style={styles.dropdown}
      />

      <View style={styles.tableWrapper}>
        <View style={styles.seasonColumn}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.fixedCell, styles.fixedHeaderCell]}>
              SEASON
            </Text>
          </View>

          {seasons.map((season, index) => (
            <View
              key={`${season.season}-${season.team ?? index}`}
              style={getRowStyle(index, season.season)}
            >
              <Text style={styles.fixedCell}>
                {formatNumber(season.season)}
              </Text>
            </View>
          ))}

          <View style={[styles.row, styles.careerRow]}>
            <Text
              style={[
                styles.fixedCell,
                styles.fixedHeaderCell,
                { color: Colors.white },
              ]}
            >
              CAREER
            </Text>
          </View>
        </View>

        <View style={styles.teamColumn}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.fixedTeamCell, styles.fixedHeaderCell]}>
              TEAM
            </Text>
          </View>

          {seasons.map((season, index) => (
            <View
              key={`${season.season}-${season.team ?? index}-team`}
              style={getRowStyle(index, season.season)}
            >
              <Text style={styles.fixedTeamCell}>
                {formatNumber(season.team)}
              </Text>
            </View>
          ))}

          <View style={[styles.row, styles.careerRow]}>
            <Text style={styles.fixedCareerCell}></Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statScrollContent}>
            <View style={[styles.row, styles.headerRow]}>
              {TABLE_HEADERS.map((header) => (
                <Text key={header} style={[styles.cell, styles.headerCell]}>
                  {header}
                </Text>
              ))}
            </View>

            {seasons.map((season, index) => {
              const games = season.g;
              const minutes = season.mp;

              return (
                <View
                  key={`${season.season}-${season.team ?? index}-stats`}
                  style={getRowStyle(index, season.season)}
                >
                  <Text style={styles.cell}>{formatNumber(season.age)}</Text>
                  <Text style={styles.cell}>{formatNumber(season.g)}</Text>

                  <Text style={styles.cell}>
                    {statView === "totals"
                      ? formatNumber(season.mp)
                      : statView === "pergame"
                        ? perGame(season.mp, games)
                        : "36.0"}
                  </Text>

                  <Text style={styles.cell}>
                    {getStatValue(statView, season.pts, games, minutes)}
                  </Text>
                  <Text style={styles.cell}>
                    {getStatValue(statView, season.fg, games, minutes)}
                  </Text>
                  <Text style={styles.cell}>
                    {getStatValue(statView, season.fga, games, minutes)}
                  </Text>
                  <Text style={styles.cell}>{pct(season.fg_pct)}</Text>

                  <Text style={styles.cell}>
                    {getStatValue(statView, season.three_p, games, minutes)}
                  </Text>
                  <Text style={styles.cell}>
                    {getStatValue(statView, season.three_pa, games, minutes)}
                  </Text>
                  <Text style={styles.cell}>{pct(season.three_pct)}</Text>

                  <Text style={styles.cell}>
                    {getStatValue(statView, season.ft, games, minutes)}
                  </Text>
                  <Text style={styles.cell}>
                    {getStatValue(statView, season.fta, games, minutes)}
                  </Text>
                  <Text style={styles.cell}>{pct(season.ft_pct)}</Text>

                  <Text style={styles.cell}>
                    {getStatValue(statView, season.trb, games, minutes)}
                  </Text>
                  <Text style={styles.cell}>
                    {getStatValue(statView, season.ast, games, minutes)}
                  </Text>
                  <Text style={styles.cell}>
                    {getStatValue(statView, season.stl, games, minutes)}
                  </Text>
                  <Text style={styles.cell}>
                    {getStatValue(statView, season.blk, games, minutes)}
                  </Text>
                  <Text style={styles.cell}>
                    {getStatValue(statView, season.tov, games, minutes)}
                  </Text>
                  <Text style={styles.cell}>
                    {getStatValue(statView, season.pf, games, minutes)}
                  </Text>
                </View>
              );
            })}

            <View style={[styles.row, styles.careerRow]}>
              <Text style={styles.careerCell}>{""}</Text>

              <Text style={styles.careerCell}>{formatNumber(career.g)}</Text>

              <Text style={styles.careerCell}>
                {statView === "totals"
                  ? formatNumber(career.mp)
                  : statView === "pergame"
                    ? perGame(career.mp, career.g)
                    : "36.0"}
              </Text>

              <Text style={styles.careerCell}>
                {getCareerStatValue(career.pts, career.g, career.mp)}
              </Text>
              <Text style={styles.careerCell}>
                {getCareerStatValue(career.fg, career.g, career.mp)}
              </Text>
              <Text style={styles.careerCell}>
                {getCareerStatValue(career.fga, career.g, career.mp)}
              </Text>
              <Text style={styles.careerCell}>
                {pct(career.fg / career.fga)}
              </Text>

              <Text style={styles.careerCell}>
                {getCareerStatValue(career.three_p, career.g, career.mp)}
              </Text>
              <Text style={styles.careerCell}>
                {getCareerStatValue(career.three_pa, career.g, career.mp)}
              </Text>
              <Text style={styles.careerCell}>
                {pct(career.three_p / career.three_pa)}
              </Text>

              <Text style={styles.careerCell}>
                {getCareerStatValue(career.ft, career.g, career.mp)}
              </Text>
              <Text style={styles.careerCell}>
                {getCareerStatValue(career.fta, career.g, career.mp)}
              </Text>
              <Text style={styles.careerCell}>
                {pct(career.ft / career.fta)}
              </Text>

              <Text style={styles.careerCell}>
                {getCareerStatValue(career.trb, career.g, career.mp)}
              </Text>
              <Text style={styles.careerCell}>
                {getCareerStatValue(career.ast, career.g, career.mp)}
              </Text>
              <Text style={styles.careerCell}>
                {getCareerStatValue(career.stl, career.g, career.mp)}
              </Text>
              <Text style={styles.careerCell}>
                {getCareerStatValue(career.blk, career.g, career.mp)}
              </Text>
              <Text style={styles.careerCell}>
                {getCareerStatValue(career.tov, career.g, career.mp)}
              </Text>
              <Text style={styles.careerCell}>
                {getCareerStatValue(career.pf, career.g, career.mp)}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.glossaryContainer}>
        <Text style={styles.headerName}>Stat Glossary</Text>

        {chunk(NBA_STAT_GLOSSARY, 2).map((row, rowIndex) => {
          const isAlt = rowIndex % 2 === 1;

          return (
            <View key={`glossary-row-${rowIndex}`} style={styles.glossaryRow}>
              {row.map((item, colIndex) => (
                <View
                  key={item.abbr}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: isAlt
                      ? isDark
                        ? styles.rowAltDark.backgroundColor
                        : styles.rowAltLight.backgroundColor
                      : "transparent",
                    borderRightWidth: colIndex === 0 ? 1 : 0,
                    borderRightColor: isDark
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.1)",
                  }}
                >
                  <Text style={styles.glossaryAbbr}>{item.abbr}</Text>
                  <Text style={styles.glossaryDisplayName}>{item.label}</Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </View>
  );
}

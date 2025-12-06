import GameLeadersSkeleton from "components/GameDetails/GameLeadersSkeleton";
import HeadingTwo from "components/Headings/HeadingTwo";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamLogo, teams } from "constants/teamsCBB";
import { useMemo, useState } from "react";
import { Dimensions, Image, Text, useColorScheme, View } from "react-native";
import { getStyles } from "styles/GameDetailStyles/GameLeaders.styles";
const SCREEN_WIDTH = Dimensions.get("window").width;

const STAT_CATEGORIES = ["points", "rebounds", "assists"] as const;
type Category = (typeof STAT_CATEGORIES)[number];

type Headshot = string | { href: string; alt?: string } | null;

type StatItem = {
  name: string;
  value: number | null;
  displayValue?: string;
};

type LeaderEntry = {
  athlete: {
    id: string | number;
    fullName: string;
    headshot?: Headshot;
    jersey?: string | number | null;
    jerseyNumber?: string | number | null;
  };
  value: number | null;
  statistics?: StatItem[];
};

type StatGroup = {
  name: string;
  leaders: LeaderEntry[];
};

export type LeaderGroup = {
  team: { id: string | number };
  leaders: StatGroup[];
};

type Props = {
  leaders: LeaderGroup[];
  awayTeamId: number;
  homeTeamId: number;
  lighter?: boolean;
  loading?: boolean;
};

type StatProps = {
  label: string;
  value: string | number;
  color: string;
  sub: string;
  lighter?: boolean;
};

const safe = (v: any) => (v === null || v === undefined || v === "" ? "–" : v);

function Stat({ label, value, color, sub, lighter = false }: StatProps) {
  const isDark = useColorScheme() === "dark";

  const styles = getStyles(isDark, lighter);
  return (
    <View style={{ marginRight: 12 }}>
      <Text
        style={{
          color: lighter
            ? Colors.lightGray
            : isDark
            ? Colors.midTone
            : Colors.midTone,
          fontFamily: Fonts.OSMEDIUM,
          fontSize: 11,
        }}
      >
        {label}
      </Text>
      <Text style={styles.statText}>{value}</Text>
    </View>
  );
}

export default function GameLeaders({
  leaders,
  awayTeamId,
  homeTeamId,
  lighter = false,
  loading = false,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const [selectedCategory, setSelectedCategory] = useState<Category>("points");
  const tabWidth = SCREEN_WIDTH / STAT_CATEGORIES.length;
  const styles = getStyles(isDark, lighter);

  const textColor = lighter
    ? Colors.white
    : isDark
    ? Colors.white
    : Colors.black;
  const subTextColor = lighter
    ? Colors.lightGray
    : isDark
    ? Colors.midTone
    : Colors.midTone;
  const borderColor = lighter
    ? Colors.lightGray
    : isDark
    ? Colors.midTone
    : Colors.midTone;

  const topPlayers = useMemo(() => {
    if (!leaders || leaders.length === 0) return [];

    const flat: any[] = [];

    leaders.forEach((group) => {
      const teamId = Number(group.team.id);

      (group.leaders ?? []).forEach((statGroup) => {
        (statGroup.leaders ?? []).forEach((entry) => {
          const athlete = entry.athlete;
          const stats = entry.statistics ?? [];

          const getStat = (name: string): string | number => {
            const found = stats.find((s: StatItem) => s.name === name);
            return safe(found?.value);
          };

          const getStatDisplay = (name: string): string => {
            const found = stats.find((s: StatItem) => s.name === name);
            return safe(found?.displayValue);
          };

          const points = getStat("points");
          const rebounds =
            safe(getStat("rebounds")) !== "–"
              ? getStat("rebounds")
              : getStat("totReb");
          const assists = getStat("assists");

          const fieldGoals = getStatDisplay("fieldGoals");
          const freeThrows = getStatDisplay("freeThrows");
          const turnovers = getStatDisplay("turnovers");
          const minutes = getStatDisplay("minutes");
          const assistTurnoverRatio = getStatDisplay("assistTurnoverRatio");
          const defensiveRebounds = getStatDisplay("defensiveRebounds");
          const offensiveRebounds = getStatDisplay("offensiveRebounds");

          flat.push({
            category: statGroup.name.toLowerCase(),

            value: safe(entry.value ?? points),

            team: { id: teamId },

            localPlayer: {
              id: athlete.id,
              first_name: athlete.fullName?.split(" ")[0] ?? "",
              last_name: athlete.fullName?.split(" ")[1] ?? "",
              headshot_url:
                typeof athlete.headshot === "string"
                  ? athlete.headshot
                  : athlete.headshot?.href ?? "",
              jersey_number: athlete.jersey ?? athlete.jerseyNumber ?? "(NA)",
            },

            // ⭐ normalized stats
            points: safe(points),
            totReb: safe(rebounds),
            assists: safe(assists),

            fieldGoals: safe(fieldGoals),
            freeThrows: safe(freeThrows),
            turnovers: safe(turnovers),
            minutes: safe(minutes),
            assistTurnoverRatio: safe(assistTurnoverRatio),
            defensiveRebounds: safe(defensiveRebounds),
            offensiveRebounds: safe(offensiveRebounds),

            fgm: "-",
            fga: "-",
            tpm: "-",
            tpa: "-",
            min: "-",
            pfouls: "-",
          });
        });
      });
    });

    // ⭐ detect NO STATS at all → return placeholders
    const allEmpty = flat.every(
      (p) => p.points === "–" && p.totReb === "–" && p.assists === "–"
    );

    if (allEmpty) {
      return [
        {
          category: selectedCategory,
          localPlayer: {
            first_name: "Unknown",
            last_name: "Player",
            jersey_number: "–",
            headshot_url: "",
          },
          team: { id: homeTeamId },
          points: "–",
          totReb: "–",
          assists: "–",
          fieldGoals: "–",
          freeThrows: "–",
          turnovers: "–",
          defensiveRebounds: "–",
          offensiveRebounds: "–",
          assistTurnoverRatio: "–",
        },
        {
          category: selectedCategory,
          localPlayer: {
            first_name: "Unknown",
            last_name: "Player",
            jersey_number: "–",
            headshot_url: "",
          },
          team: { id: awayTeamId },
          points: "–",
          totReb: "–",
          assists: "–",
          fieldGoals: "–",
          freeThrows: "–",
          turnovers: "–",
          defensiveRebounds: "–",
          offensiveRebounds: "–",
          assistTurnoverRatio: "–",
        },
      ];
    }

    return flat.filter((p) => p.category === selectedCategory);
  }, [leaders, selectedCategory]);

  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Game Leaders</HeadingTwo>

      {loading ? (
        <GameLeadersSkeleton />
      ) : (
        <>
          {/* Tabs */}
          <View style={{ paddingHorizontal: 12 }}>
            <MainScrollTabBar
              tabs={STAT_CATEGORIES}
              selected={selectedCategory}
              onTabPress={setSelectedCategory}
              lighter={lighter}
              renderLabel={(tab) => {
                const isSelected = tab === selectedCategory;
                return (
                  <Text
                    style={{
                      fontFamily: Fonts.OSMEDIUM,
                      fontSize: 14,
                      color: isSelected ? textColor : subTextColor,
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                );
              }}
            />
          </View>

          {topPlayers.map((player, idx) => {
            const p = player.localPlayer;

            const teamObj =
              teams.find((t) => String(t.espnID) === String(player.team?.id)) ??
              teams.find((t) => t.espnID === homeTeamId) ??
              teams.find((t) => t.espnID === awayTeamId);

            const teamLogo = teamObj ? getTeamLogo(teamObj.id, isDark) : null;

            const hasNoStats =
              player.points === "–" &&
              player.totReb === "–" &&
              player.assists === "–";

            const dimStyle = hasNoStats ? { opacity: 1 } : {};

            return (
              <View
                key={idx}
                style={[
                  styles.card,
                  dimStyle,
                  { borderBottomColor: borderColor },
                ]}
              >
                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{
                      uri: p.headshot_url ?? "",
                    }}
                    style={styles.avatar}
                  />
                </View>

                {/* Info */}
                <View style={styles.infoSection}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.playerName, { color: textColor }]}>
                      {p.first_name} {p.last_name}
                    </Text>

                    <Text style={[styles.jersey, { color: subTextColor }]}>
                      #{p.jersey_number}
                    </Text>
                  </View>

                  {/* Stats */}
                  <View style={styles.statRow}>
                    {selectedCategory === "points" && (
                      <>
                        <Stat
                          label="PTS"
                          value={player.points}
                          color={textColor}
                          sub={subTextColor}
                        />
                        <Stat
                          label="FG"
                          value={player.fieldGoals}
                          color={textColor}
                          sub={subTextColor}
                        />
                        <Stat
                          label="FT"
                          value={player.freeThrows}
                          color={textColor}
                          sub={subTextColor}
                        />
                      </>
                    )}

                    {selectedCategory === "rebounds" && (
                      <>
                        <Stat
                          label="REB"
                          value={player.totReb}
                          color={textColor}
                          sub={subTextColor}
                        />
                        <Stat
                          label="DREB"
                          value={player.defensiveRebounds}
                          color={textColor}
                          sub={subTextColor}
                        />
                        <Stat
                          label="OREB"
                          value={player.offensiveRebounds}
                          color={textColor}
                          sub={subTextColor}
                        />
                      </>
                    )}

                    {selectedCategory === "assists" && (
                      <>
                        <Stat
                          label="AST"
                          value={player.assists}
                          color={textColor}
                          sub={subTextColor}
                        />
                        <Stat
                          label="TO"
                          value={player.turnovers}
                          color={textColor}
                          sub={subTextColor}
                        />
                        <Stat
                          label="AST/TO"
                          value={player.assistTurnoverRatio}
                          color={textColor}
                          sub={subTextColor}
                        />
                      </>
                    )}
                  </View>
                </View>

                {/* Team Logo */}
                <Image
                  source={teamLogo}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

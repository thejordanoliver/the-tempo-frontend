import Placeholder from "assets/Placeholders/playerPlaceholder.png";
import GameLeadersSkeleton from "components/GameDetails/GameLeadersSkeleton";
import HeadingTwo from "components/Headings/HeadingTwo";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { teams } from "constants/teamsCBB";
import { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Text,
  TextStyle,
  useColorScheme,
  View,
} from "react-native";
import { gameLeadersStyles } from "styles/GameDetailStyles/GameLeadersStyles";

const SCREEN_WIDTH = Dimensions.get("window").width;

const STAT_CATEGORIES = ["points", "rebounds", "assists"] as const;
type Category = (typeof STAT_CATEGORIES)[number];

type Props = {
  leaders: any[];
  awayTeamId: number;
  homeTeamId: number;
  lighter?: boolean;
  loading?: boolean;
  league?: string;
};

type StatProps = {
  label: string;
  value: string | number;
  sub: TextStyle;
  lighter?: boolean;
};

function Stat({ label, value, lighter = false }: StatProps) {
  const isDark = useColorScheme() === "dark";
  const styles = gameLeadersStyles(isDark, lighter);

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
  league,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const [selectedCategory, setSelectedCategory] = useState<Category>("points");
  const styles = gameLeadersStyles(isDark, lighter);

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

  const topPlayers = useMemo(() => {
    if (!leaders?.length) return [];

    const flat: any[] = [];

    leaders.forEach((group) => {
      const teamId = Number(group.team?.id);

      (group.leaders ?? []).forEach((statGroup: any) => {
        const category = statGroup?.name?.toLowerCase();
        if (!STAT_CATEGORIES.includes(category)) return;

        (statGroup.leaders ?? []).forEach((entry: any) => {
          const athlete = entry?.athlete;

          // ✅ SAFE ATHLETE FALLBACK
          const athleteSafe =
            athlete && athlete.id && athlete.fullName
              ? athlete
              : {
                  id: `unknown-${teamId}-${category}`,
                  fullName: "Unknown Player",
                  shortName: "Unknown",
                  headshot: Placeholder,
                  jersey: "–",
                };

          const stats = entry.statistics ?? [];

          const getStat = (name: string) =>
            stats.find((s: any) => s.name === name)?.value ?? "–";

          const getStatDisplay = (name: string) =>
            stats.find((s: any) => s.name === name)?.displayValue ?? "–";

          flat.push({
            category,
            team: { id: teamId },

            localPlayer: {
              id: athleteSafe.id,
              first_name: athleteSafe.fullName.split(" ")[0] ?? "Unknown",
              last_name:
                athleteSafe.fullName.split(" ").slice(1).join(" ") ?? "Player",
              headshot_url:
                typeof athleteSafe.headshot === "string"
                  ? athleteSafe.headshot
                  : athleteSafe.headshot?.href ?? Placeholder,
              jersey_number: athleteSafe.jersey ?? "–",
            },

            points: getStat("points"),
            totReb: getStat("rebounds"),
            assists: getStat("assists"),
            fieldGoals: getStatDisplay("fieldGoals"),
            freeThrows: getStatDisplay("freeThrows"),
            turnovers: getStatDisplay("turnovers"),
            minutes: getStatDisplay("minutes"),
            assistTurnoverRatio: getStatDisplay("assistTurnoverRatio"),
            defensiveRebounds: getStatDisplay("defensiveRebounds"),
            offensiveRebounds: getStatDisplay("offensiveRebounds"),
          });
        });
      });
    });

    return flat.filter((p) => p.category === selectedCategory);
  }, [leaders, selectedCategory]);
  const isWomen = league === "wcbb";
  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Game Leaders</HeadingTwo>

      <View style={styles.wrapper}>
        {loading ? (
          <GameLeadersSkeleton />
        ) : (
          <>
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

            {topPlayers.map((player, idx) => {
              const p = player.localPlayer;

              const teamObj =
                teams.find(
                  (t) => String(t.espnID) === String(player.team?.id)
                ) ??
                teams.find((t) => t.espnID === homeTeamId) ??
                teams.find((t) => t.espnID === awayTeamId);

              const teamLogo = (() => {
                if (!teamObj) return null;

                if (isWomen) {
                  if (lighter) return teamObj.wLogo || teamObj.logo;
                  return isDark
                    ? teamObj.wLogo || teamObj.logoLight || teamObj.logo
                    : teamObj.wLogo || teamObj.logo;
                }

                // MEN'S LOGIC (never touch wLogo)
                if (lighter) return teamObj.logoLight || teamObj.logo;
                return isDark
                  ? teamObj.logoLight || teamObj.logo
                  : teamObj.logo;
              })();

              return (
                <View key={idx} style={styles.card}>
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={{ uri: p.headshot_url }}
                      style={styles.avatar}
                    />
                  </View>

                  <View style={styles.infoSection}>
                    <View style={styles.nameRow}>
                      <Text style={styles.playerName}>
                        {p.first_name} {p.last_name}
                      </Text>
                      <Text style={styles.jersey}>#{p.jersey_number}</Text>
                    </View>

                    <View style={styles.statRow}>
                      {selectedCategory === "points" && (
                        <>
                          <Stat
                            label="PTS"
                            value={player.points}
                            sub={styles.statText}
                            lighter={lighter}
                          />
                          <Stat
                            label="FG"
                            value={player.fieldGoals}
                            sub={styles.statText}
                            lighter={lighter}
                          />
                          <Stat
                            label="FT"
                            value={player.freeThrows}
                            sub={styles.statText}
                            lighter={lighter}
                          />
                        </>
                      )}

                      {selectedCategory === "rebounds" && (
                        <>
                          <Stat
                            label="REB"
                            value={player.totReb}
                            sub={styles.statText}
                            lighter={lighter}
                          />
                          <Stat
                            label="DREB"
                            value={player.defensiveRebounds}
                            sub={styles.statText}
                            lighter={lighter}
                          />
                          <Stat
                            label="OREB"
                            value={player.offensiveRebounds}
                            sub={styles.statText}
                            lighter={lighter}
                          />
                        </>
                      )}

                      {selectedCategory === "assists" && (
                        <>
                          <Stat
                            label="AST"
                            value={player.assists}
                            sub={styles.statText}
                            lighter={lighter}
                          />
                          <Stat
                            label="TO"
                            value={player.turnovers}
                            sub={styles.statText}
                            lighter={lighter}
                          />
                          <Stat
                            label="AST/TO"
                            value={player.assistTurnoverRatio}
                            sub={styles.statText}
                            lighter={lighter}
                          />
                        </>
                      )}
                    </View>
                  </View>

                  {teamLogo && (
                    <Image
                      source={teamLogo}
                      style={styles.teamLogo}
                      resizeMode="contain"
                    />
                  )}
                </View>
              );
            })}
          </>
        )}
      </View>
    </View>
  );
}

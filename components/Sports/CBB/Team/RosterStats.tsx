import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, globalStyles } from "constants/Styles";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { rosterStatsStyles } from "styles/TeamStyles/RosterStatStyles";

/* ================= TYPES ================= */

interface PlayerAverages {
  avgPoints?: number;
  avgRebounds?: number;
  avgAssists?: number;
  avgSteals?: number;
  avgFouls?: number;
  avgMinutes?: number;
  gamesPlayed?: number;
  gamesStarted?: number;
  fieldGoalPct?: number;
  freeThrowPct?: number;
  threePointFieldGoalPct?: number;
}

interface Player {
  id: number;
  first_name: string;
  last_name: string;
  jersey_number: string | number;
  headshot_url?: string;
  currentSeason?: {
    averages?: PlayerAverages;
  };
}

interface Props {
  rosterStats: Player[];
  espnId: number;
  teamId: number;
  league: "cbb" | "wcbb";
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  onRefresh: () => void;
}

/* ================= COMPONENT ================= */

const CBBRosterStats: React.FC<Props> = ({
  rosterStats,
  espnId,
  teamId,
  league,
  loading,
  error,
  refreshing,
  onRefresh,
}) => {
  const [viewMode, setViewMode] = useState<"Player Stats" | "Team Stats">(
    "Player Stats",
  );

  const isDark = useColorScheme() === "dark";
  const styles = rosterStatsStyles(isDark);
  const global = globalStyles(isDark);
  const router = useRouter();

  const roster = rosterStats ?? [];

  /* ================= LOADING / ERROR ================= */

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );
  }

  /* ================= HELPERS ================= */

  const getStatValue = (stat?: number) =>
    stat != null && !isNaN(Number(stat)) ? Number(stat).toFixed(1) : "0.0";

  /* ================= LEADERS ================= */

  const leaders = useMemo(() => {
    const categories = [
      { label: "Points", key: "avgPoints" },
      { label: "Rebounds", key: "avgRebounds" },
      { label: "Assist", key: "avgAssists" },
      { label: "Steals", key: "avgSteals" },
    ] as const;

    return categories
      .map((category) => {
        const sorted = [...roster].sort(
          (a, b) =>
            Number(b.currentSeason?.averages?.[category.key] ?? 0) -
            Number(a.currentSeason?.averages?.[category.key] ?? 0),
        );

        return {
          ...category,
          player: sorted[0],
        };
      })
      .filter((item) => item.player);
  }, [roster]);

  /* ================= NAVIGATION ================= */

  const navigateToPlayer = (playerId: number) => {
    router.push({
      pathname: "/player/cbb/[id]",
      params: {
        id: playerId.toString(),
        teamId: teamId.toString(),
        espnId: espnId.toString(),
        league,
      },
    });
  };

  const formatDisplayName = (
    first: string,
    last: string,
    jersey: string | number,
  ) => (
    <Text style={styles.playerName}>
      {first?.[0]}. {last} <Text style={styles.number}>#{jersey}</Text>
    </Text>
  );

  const formatCardName = (
    first: string,
    last: string,
    jersey: string | number,
  ) => (
    <Text style={styles.cardName}>
      {first?.[0]}. {last} <Text style={styles.number}>#{jersey}</Text>
    </Text>
  );

  /* ================= LEADER CARD ================= */

  const LeaderCard = ({
    item,
    index,
    total,
  }: {
    item: any;
    index: number;
    total: number;
  }) => (
    <View style={styles.cardWrapper}>
      <View style={styles.cardContainer}>
        <Text style={styles.cardLabel}>{item.label}</Text>

        <TouchableOpacity onPress={() => navigateToPlayer(item.player.id)}>
          <View style={styles.statCard}>
            <Image
              source={{ uri: item.player.headshot_url }}
              style={styles.avatar}
            />
            <View style={styles.nameValue}>
              {formatCardName(
                item.player.first_name,
                item.player.last_name,
                item.player.jersey_number,
              )}
              <Text style={styles.cardValue}>
                {getStatValue(item.player.currentSeason?.averages?.[item.key])}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {index < total - 1 && <View style={styles.divider} />}
    </View>
  );

  /* ================= TABLE HEADERS ================= */

  const STAT_HEADERS: { key: keyof PlayerAverages; label: string }[] = [
    { label: "GP", key: "gamesPlayed" },
    { label: "GS", key: "gamesStarted" },
    { label: "MIN", key: "avgMinutes" },
    { label: "PTS", key: "avgPoints" },
    { label: "REB", key: "avgRebounds" },
    { label: "AST", key: "avgAssists" },
    { label: "STL", key: "avgSteals" },
    { label: "FOULS", key: "avgFouls" },
    { label: "FG%", key: "fieldGoalPct" },
    { label: "FT%", key: "freeThrowPct" },
    { label: "3P%", key: "threePointFieldGoalPct" },
  ];

  /* ================= RENDER ================= */

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { flexGrow: 1 }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      keyboardShouldPersistTaps="handled"
    >
      <HeadingTwo>{viewMode}</HeadingTwo>

      <Dropdown
        options={[
          { label: "Player Stats", value: "Player Stats" },
          { label: "Team Stats", value: "Team Stats" },
        ]}
        selectedValue={viewMode}
        onSelect={(val: string) =>
          setViewMode(val as "Player Stats" | "Team Stats")
        }
        isDark={isDark}
        absolute
      />

      {viewMode === "Player Stats" && (
        <>
          {/* Leaders */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
            snapToInterval={276}
            decelerationRate="fast"
          >
            {leaders.map((item, i) => (
              <LeaderCard
                key={item.key}
                item={item}
                index={i}
                total={leaders.length}
              />
            ))}
          </ScrollView>

          {/* Table */}
          <View style={styles.tableWrapper}>
            <View style={styles.fixedColumnContainer}>
              <View
                style={[
                  styles.tableRow,
                  {
                    backgroundColor: isDark
                      ? Colors.dark.itemBackground
                      : Colors.light.itemBackground,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tableCell,
                    styles.nameHeaderText,
                    { width: 140 },
                  ]}
                >
                  Player
                </Text>
              </View>

              {roster.map((p, idx) => (
                <View
                  key={p.id}
                  style={[
                    styles.tableRow,
                    idx === roster.length - 1 && { borderBottomWidth: 0 },
                    idx % 2 === 1 && {
                      backgroundColor: isDark
                        ? Colors.dark.itemBackground
                        : Colors.light.itemBackground,
                    },
                  ]}
                >
                  <TouchableOpacity onPress={() => navigateToPlayer(p.id)}>
                    <Text
                      numberOfLines={1}
                      style={[styles.tableCell, { width: 140 }]}
                    >
                      {formatDisplayName(
                        p.first_name,
                        p.last_name,
                        p.jersey_number,
                      )}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View
                  style={[
                    styles.tableRow,
                    {
                      backgroundColor: isDark
                        ? Colors.dark.itemBackground
                        : Colors.light.itemBackground,
                    },
                  ]}
                >
                  {STAT_HEADERS.map((h) => (
                    <Text
                      key={h.key}
                      style={[
                        styles.tableCell,
                        styles.headerText,
                        { width: 80 },
                      ]}
                    >
                      {h.label}
                    </Text>
                  ))}
                </View>

                {roster.map((p, idx) => (
                  <View
                    key={p.id}
                    style={[
                      styles.tableRow,
                      idx === roster.length - 1 && { borderBottomWidth: 0 },
                      idx % 2 === 1 && {
                        backgroundColor: isDark
                          ? Colors.dark.itemBackground
                          : Colors.light.itemBackground,
                      },
                    ]}
                  >
                    {STAT_HEADERS.map((h) => (
                      <Text
                        key={h.key}
                        style={[
                          styles.tableCell,
                          styles.statValue,
                          { width: 80 },
                        ]}
                      >
                        {p.currentSeason?.averages?.[h.key] ?? "-"}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default CBBRosterStats;

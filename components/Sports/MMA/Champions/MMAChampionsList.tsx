import type {
  MMAChampionship,
  MMAChampionsResponse,
  MMADivision,
} from "@/types/mma/mma";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { activeOpacity, Colors, Fonts, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import useMMAChampions from "hooks/MMAHooks/useMMAChampions";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DIVISION_ORDER: MMADivision[] = [
  "Heavyweight",
  "Light Heavyweight",
  "Middleweight",
  "Welterweight",
  "Lightweight",
  "Featherweight",
  "Bantamweight",
  "Flyweight",
  "Women's Bantamweight",
  "Women's Flyweight",
  "Women's Strawweight",
];

type ChampionEntry = {
  division: string;
  champion: MMAChampionship | null;
};

type StatItemProps = {
  label: string;
  value: string;
  isDark: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function formatDivisionLabel(division: string): string {
  return division.replace("Women's ", "W ");
}

function isInterimChampion(champion: MMAChampionship): boolean {
  return champion.accolade_name.toLowerCase().includes("interim");
}

function getCurrentChampion(
  champions: MMAChampionship[] = [],
): MMAChampionship | null {
  return (
    champions.find((champion) => champion.is_current === true) ??
    champions.find((champion) => !isInterimChampion(champion)) ??
    champions[0] ??
    null
  );
}

function getChampionEntries(data: MMAChampionsResponse): ChampionEntry[] {
  const orderedEntries: ChampionEntry[] = DIVISION_ORDER.map((division) => ({
    division,
    champion: getCurrentChampion(data[division] ?? []),
  }));

  const orderedDivisionSet = new Set<string>(DIVISION_ORDER);

  const extraEntries: ChampionEntry[] = Object.entries(data)
    .filter(([division]) => !orderedDivisionSet.has(division))
    .map(([division, champions]) => ({
      division,
      champion: getCurrentChampion(champions ?? []),
    }));

  return [...orderedEntries, ...extraEntries];
}

/* -------------------------------------------------------------------------- */
/*                                  Stat Item                                 */
/* -------------------------------------------------------------------------- */

function StatItem({ label, value, isDark }: StatItemProps) {
  const styles = MMAChampionListStyles(isDark);

  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>

      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                            MMA Champions List                              */
/* -------------------------------------------------------------------------- */

export default function MMAChampionsList() {
  const router = useRouter();

  const { resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";

  const global = globalStyles(isDark);
  const styles = MMAChampionListStyles(isDark);

  const { data, loading, refreshing, error, refreshChampions } =
    useMMAChampions();

  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>No champions available.</Text>
      </View>
    );
  }

  const champions = getChampionEntries(data);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshChampions}
          tintColor={isDark ? Colors.white : Colors.black}
        />
      }
    >
      {champions.map(({ division, champion }) => {
        if (!champion) {
          return null;
        }

        const fighter = champion.fighter;

        const fighterId = fighter.id;

        const headshot = fighter.headshot_url;
        const flag = fighter.flag_url;

        const nickname = fighter.nickname ? `"${fighter.nickname}"` : null;

        const country =
          fighter.citizenship_country_code ?? fighter.citizenship ?? "—";

        const weight = fighter.weight != null ? `${fighter.weight} lbs` : "—";

        const stance = fighter.stance_text ?? "—";
        const camp = fighter.association_name ?? "—";

        const divisionLabel = formatDivisionLabel(division);

        const fighterInitial =
          fighter.first_name?.charAt(0) ?? fighter.full_name?.charAt(0) ?? "?";

        return (
          <TouchableOpacity
            key={`${division}-${champion.accolade_id}-${fighterId}`}
            activeOpacity={activeOpacity}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/player/mma/[id]",
                params: {
                  id: fighterId,
                  league: "mma",
                },
              })
            }
          >
            <LinearGradient
              colors={
                isDark
                  ? ([Colors.dark.itemBackground, Colors.black] as const)
                  : ([Colors.light.itemBackground, Colors.white] as const)
              }
              locations={[0, 1]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 1,
              }}
              style={styles.cardGradient}
            >
              {/* Accent */}
              <View style={styles.accentBar} />

              {/* Division */}
              <View style={styles.divisionRow}>
                <View>
                  <Text style={styles.divisionEyebrow}>UFC</Text>

                  <Text style={styles.divisionLabel}>{divisionLabel}</Text>
                </View>

                <Text style={styles.titleType}>
                  {isInterimChampion(champion)
                    ? "INTERIM TITLE"
                    : "TITLE HOLDER"}
                </Text>
              </View>

              {/* Fighter */}
              <View style={styles.fighterSection}>
                <View style={styles.headshotContainer}>
                  {headshot ? (
                    <Image
                      source={{ uri: headshot }}
                      style={styles.headshot}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.headshotFallback}>
                      <Text style={styles.headshotInitial}>
                        {fighterInitial}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.fighterInfo}>
                  <View style={styles.identityRow}>
                    <View style={styles.nameContainer}>
                      <Text style={styles.fighterName} numberOfLines={2}>
                        {fighter.full_name || "Unknown Fighter"}
                      </Text>

                      {nickname ? (
                        <Text style={styles.nickname} numberOfLines={1}>
                          {nickname}
                        </Text>
                      ) : null}
                    </View>

                    {flag ? (
                      <View style={styles.flagContainer}>
                        <Image
                          source={{ uri: flag }}
                          style={styles.flag}
                          contentFit="cover"
                          accessibilityLabel={`${country} flag`}
                        />
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.countryRow}>
                    <Text style={styles.countryText}>
                      {fighter.citizenship ?? country}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <StatItem label="Weight" value={weight} isDark={isDark} />

                <View style={styles.statDivider} />

                <StatItem label="Stance" value={stance} isDark={isDark} />

                <View style={styles.statDivider} />

                <StatItem label="Camp" value={camp} isDark={isDark} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Screen Styles                                 */
/* -------------------------------------------------------------------------- */

export const MMAChampionListStyles = (isDark: boolean) =>
  StyleSheet.create({
    contentContainer: {
      gap: 14,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 120,
    },

    stateContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },

    card: {
      borderRadius: 14,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
    },

    cardGradient: {
      position: "relative",
      gap: 18,
      padding: 18,
    },

    accentBar: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      width: 4,
      backgroundColor: isDark ? Colors.dark.gold : Colors.light.gold,
    },

    /* ---------------------------------------------------------------------- */
    /*                               Division                                 */
    /* ---------------------------------------------------------------------- */

    divisionRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      paddingLeft: 4,
    },

    divisionEyebrow: {
      marginBottom: 2,
      fontFamily: Fonts.BOLD,
      fontSize: 9,
      letterSpacing: 2,
      color: isDark ? Colors.dark.gold : Colors.light.gold,
    },

    divisionLabel: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      letterSpacing: 0.4,
      color: isDark ? Colors.white : Colors.black,
      textTransform: "uppercase",
    },

    titleType: {
      marginTop: 2,
      fontFamily: Fonts.MEDIUM,
      fontSize: 9,
      letterSpacing: 1.1,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    /* ---------------------------------------------------------------------- */
    /*                                Fighter                                 */
    /* ---------------------------------------------------------------------- */

    fighterSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      paddingLeft: 4,
    },

    headshotContainer: {
      width: 86,
      height: 86,
      flexShrink: 0,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
    },

    headshot: {
      width: "100%",
      height: "100%",
    },

    headshotFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    headshotInitial: {
      fontFamily: Fonts.BOLD,
      fontSize: 34,
      color: isDark ? Colors.white : Colors.black,
    },

    fighterInfo: {
      flex: 1,
      minWidth: 0,
      gap: 8,
    },

    identityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    nameContainer: {
      flex: 1,
      minWidth: 0,
      gap: 3,
    },

    fighterName: {
      fontFamily: Fonts.BOLD,
      fontSize: 24,
      lineHeight: 28,
      letterSpacing: -0.4,
      color: isDark ? Colors.white : Colors.black,
    },

    nickname: {
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    flagContainer: {
      width: 42,
      height: 28,
      flexShrink: 0,
      borderRadius: 4,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.18)",
    },

    flag: {
      width: "100%",
      height: "100%",
    },

    countryRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    countryText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    /* ---------------------------------------------------------------------- */
    /*                                 Stats                                  */
    /* ---------------------------------------------------------------------- */

    statsContainer: {
      flexDirection: "row",
      alignItems: "stretch",
      marginLeft: 4,
      paddingVertical: 11,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: isDark ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.045)",
    },

    statItem: {
      flex: 1,
      minWidth: 0,
      gap: 3,
      paddingHorizontal: 8,
    },

    statLabel: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 9,
      letterSpacing: 0.9,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textTransform: "uppercase",
    },

    statValue: {
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
    },

    statDivider: {
      width: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)",
    },
  });

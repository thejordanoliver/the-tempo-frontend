import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
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
import { MMAChampion, MMADivision } from "types/mma";

const DIVISION_ORDER: MMADivision[] = [
  "Heavyweight",
  "Light Heavyweight",
  "Middleweight",
  "Welterweight",
  "Lightweight",
  "Featherweight",
  "Bantamweight",
  "Flyweight",
  "Women's Featherweight",
  "Women's Bantamweight",
  "Women's Flyweight",
  "Women's Strawweight",
];

const formatDivisionLabel = (division: MMADivision | string) =>
  division.replace("Women's ", "W ");

const isInterimChampion = (champion: MMAChampion) =>
  champion.accolade_name?.toLowerCase().includes("interim");

const getCurrentChampion = (champions: MMAChampion[] = []) =>
  champions.find((champion) => champion.is_current === true) ??
  champions.find((champion) => !isInterimChampion(champion)) ??
  champions[0] ??
  null;

const getChampionBadgeLabel = (champion: MMAChampion) =>
  isInterimChampion(champion) ? "INTERIM" : "CHAMPION";

const getChampionEntries = (
  data: Partial<Record<MMADivision, MMAChampion[]>>,
) => {
  const orderedEntries = DIVISION_ORDER.map((division) => ({
    division,
    champion: getCurrentChampion(data[division]),
  }));

  const orderedDivisionSet = new Set<string>(DIVISION_ORDER);

  const extraEntries = Object.entries(data)
    .filter(([division]) => !orderedDivisionSet.has(division))
    .map(([division, champions]) => ({
      division,
      champion: getCurrentChampion(champions),
    }));

  return [...orderedEntries, ...extraEntries];
};

type MetaPillProps = {
  label: string;
  value: string;
  isDark: boolean;
};

function MetaPill({ label, value, isDark }: MetaPillProps) {
  const styles = getPillStyles(isDark);
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const getPillStyles = (isDark: boolean) =>
  StyleSheet.create({
    pill: {
      flex: 1,
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      gap: 1,
    },
    pillLabel: {
      fontSize: 10,
      fontFamily: Fonts.OSMEDIUM,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    pillValue: {
      fontSize: 13,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
  });

export default function MMAChampionsList() {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);
  const styles = getStyles(isDark);

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
      <View style={styles.stateContainer}>
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
      {/* Cards */}
      {champions.map(({ division, champion }) => {
        if (!champion) return null;

        const fighter = champion.fighter;
        const avatarUrl =
          fighter.headshot_url ?? fighter.images?.[0]?.href ?? null;

        const fighterId = String(fighter.id ?? champion.fighter_id);
        const nickname = fighter.nickname ? `"${fighter.nickname}"` : null;
        const country =
          fighter.citizenship_country_code ?? fighter.citizenship ?? "—";
        const weight = fighter.weight ? `${fighter.weight} lbs` : "—";
        const stance = fighter.stance_text ?? "—";
        const camp = fighter.association_name ?? "—";
        const isInterim = isInterimChampion(champion);
        const divisionLabel = formatDivisionLabel(division);

        return (
          <TouchableOpacity
            key={`${division}-${champion.accolade_id}-${fighterId}`}
            activeOpacity={0.82}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/player/mma/[id]",
                params: { id: fighterId },
              })
            }
          >
            {/* Top bar: division label + badge */}
            <View style={styles.cardHeader}>
              <Text style={styles.divisionLabel}>{divisionLabel}</Text>
              <View style={[styles.badge, isInterim && styles.interimBadge]}>
                <Text style={styles.badgeText}>
                  {getChampionBadgeLabel(champion)}
                </Text>
              </View>
            </View>

            {/* Body: avatar + name block */}
            <View style={styles.body}>
              <View style={styles.avatarWrap}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatar}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitial}>
                      {fighter.first_name?.[0] ?? fighter.full_name?.[0] ?? "?"}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.nameBlock}>
                <Text style={styles.fighterName} numberOfLines={2}>
                  {fighter.full_name ?? "Unknown Fighter"}
                </Text>
                {nickname ? (
                  <Text style={styles.nickname} numberOfLines={1}>
                    {nickname}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Meta pills */}
            <View style={styles.pillRow}>
              <MetaPill label="Country" value={country} isDark={isDark} />
              <MetaPill label="Weight" value={weight} isDark={isDark} />
            </View>
            <View style={styles.pillRow}>
              <MetaPill label="Stance" value={stance} isDark={isDark} />
              <MetaPill label="Camp" value={camp} isDark={isDark} />
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 120,
      gap: 10,
    },
    stateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },

    // ── Header ──────────────────────────────────────
    header: {
      marginBottom: 12,
    },
    eyebrow: {
      fontSize: 11,
      fontFamily: Fonts.OSBOLD,
      letterSpacing: 3,
      color: isDark ? Colors.dark.gold : Colors.light.gold,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    title: {
      fontSize: 40,
      lineHeight: 44,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    headerDivider: {
      marginTop: 14,
      height: 1,
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
    },

    // ── Card ────────────────────────────────────────
    card: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 18,
      padding: 16,
      overflow: "hidden",
      gap: 12,
    },

    // Ghost watermark behind content
    watermark: {
      position: "absolute",
      bottom: -8,
      right: -4,
      fontSize: 64,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.045)",
      letterSpacing: -1,
      // Prevent interaction / layout influence
      pointerEvents: "none",
    },

    // Top bar
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
    },
    divisionLabel: {
      flex: 1,
      fontSize: 13,
      fontFamily: Fonts.OSBOLD,
      letterSpacing: 0.4,
      textTransform: "uppercase",
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    badge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: isDark ? Colors.dark.gold : Colors.light.gold,
    },
    interimBadge: {
      opacity: 0.75,
    },
    badgeText: {
      fontSize: 11,
      fontFamily: Fonts.OSBOLD,
      letterSpacing: 0.6,
      color: isDark ? Colors.white : Colors.black,
    },

    // Body row
    body: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    avatarWrap: {
      width: 60,
      height: 60,
      borderRadius: 100,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    avatar: {
      width: "100%",
      height: "100%",
    },
    avatarFallback: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
      borderRadius: 14,
    },
    avatarInitial: {
      fontSize: 26,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    nameBlock: {
      flex: 1,
      gap: 2,
    },
    fighterName: {
      fontSize: 22,
      lineHeight: 26,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    nickname: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    // Meta pills
    pillRow: {
      flexDirection: "row",
      gap: 8,
    },
  });

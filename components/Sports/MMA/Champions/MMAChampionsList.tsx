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
  data: Partial<Record<MMADivision, MMAChampion[]>>
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
      <View style={styles.header}>
        <Text style={styles.title}>Current Champions</Text>
        <Text style={styles.subtitle}>
          All active UFC titleholders by division
        </Text>
      </View>

      {champions.map(({ division, champion }) => {
        if (!champion) return null;

        const fighter = champion.fighter;
        const avatarUrl =
          fighter.headshot_url ?? fighter.images?.[0]?.href ?? null;

        const fighterId = String(fighter.id ?? champion.fighter_id);
        const nickname = fighter.nickname ? `"${fighter.nickname}"` : null;
        const country =
          fighter.citizenship_country_code ?? fighter.citizenship ?? "Unknown";
        const weight = fighter.weight ? `${fighter.weight} lbs` : "Unknown";
        const stance = fighter.stance_text ?? "Unknown";
        const camp = fighter.association_name ?? "Unknown";

        return (
          <TouchableOpacity
            key={`${division}-${champion.accolade_id}-${fighterId}`}
            activeOpacity={0.85}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/player/mma/[id]",
                params: { id: fighterId },
              })
            }
          >
            <View style={styles.cardTopRow}>
              <Text style={styles.division}>
                {formatDivisionLabel(division)}
              </Text>

              <View
                style={[
                  styles.titleBadge,
                  isInterimChampion(champion) && styles.interimBadge,
                ]}
              >
                <Text style={styles.titleBadgeText}>
                  {getChampionBadgeLabel(champion)}
                </Text>
              </View>
            </View>

            <View style={styles.bodyRow}>
              <View style={styles.avatarContainer}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatar}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>
                      {fighter.first_name?.[0] ?? fighter.full_name?.[0] ?? "?"}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                  {fighter.full_name ?? "Unknown Fighter"}
                </Text>

                {nickname ? (
                  <Text style={styles.nickname} numberOfLines={1}>
                    {nickname}
                  </Text>
                ) : null}

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Title</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>
                    {champion.accolade_name}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Country</Text>
                  <Text style={styles.metaValue}>{country}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Weight</Text>
                  <Text style={styles.metaValue}>{weight}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Stance</Text>
                  <Text style={styles.metaValue}>{stance}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Camp</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>
                    {camp}
                  </Text>
                </View>
              </View>
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
      paddingTop: 16,
      paddingBottom: 120,
      gap: 12,
    },
    stateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    header: {
      marginBottom: 4,
    },
    title: {
      fontSize: 28,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    card: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 16,
      padding: 16,
    },
    cardTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
      gap: 12,
    },
    division: {
      flex: 1,
      fontSize: 18,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    titleBadge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: isDark ? Colors.dark.gold : Colors.light.gold,
    },
    interimBadge: {
      opacity: 0.85,
    },
    titleBadgeText: {
      fontSize: 12,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    bodyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    avatarContainer: {
      width: 84,
      height: 84,
      borderRadius: 42,
      overflow: "hidden",
      borderColor: isDark ? Colors.white : Colors.black,
      borderWidth: 1,
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.background,
    },
    avatar: {
      width: "100%",
      height: "100%",
    },
    avatarPlaceholder: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarInitial: {
      fontSize: 28,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    info: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontSize: 24,
      lineHeight: 28,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    nickname: {
      marginBottom: 6,
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 2,
      gap: 10,
    },
    metaLabel: {
      fontSize: 13,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textTransform: "uppercase",
    },
    metaValue: {
      flex: 1,
      textAlign: "right",
      fontSize: 15,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
  });
import { MMAChampionItemStyles } from "@/styles/MMAChampionsListStyles";
import type { MMAChampionship } from "@/types/mma/mma";
import { activeOpacity, Colors } from "constants/styles";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { memo, useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type MMAChampionItemProps = {
  division: string;
  champion: MMAChampionship;
  isDark: boolean;
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

/* -------------------------------------------------------------------------- */
/*                                  Stat Item                                 */
/* -------------------------------------------------------------------------- */

function StatItem({ label, value, isDark }: StatItemProps) {
  const styles = MMAChampionItemStyles(isDark);

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
/*                            MMA Champion Item                               */
/* -------------------------------------------------------------------------- */

function MMAChampionItem({ division, champion, isDark }: MMAChampionItemProps) {
  const router = useRouter();
  const styles = MMAChampionItemStyles(isDark);

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

  const handlePress = useCallback(() => {
    router.push({
      pathname: "/player/mma/[id]",
      params: {
        id: fighterId,
        league: "mma",
      },
    });
  }, [fighterId, router]);

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      style={styles.card}
      onPress={handlePress}
    >
      <LinearGradient
        colors={
          isDark
            ? ([
                Colors.dark.gold,
                Colors.light.transparentBlack,
                Colors.black,
              ] as const)
            : ([
                Colors.light.gold,
                Colors.dark.transparentWhite,
                Colors.white,
              ] as const)
        }
        locations={[0, 0.2, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardGradient}
      >
        <View style={styles.divisionRow}>
          <View>
            <Text style={styles.divisionEyebrow}>UFC</Text>
            <Text style={styles.divisionLabel}>{divisionLabel}</Text>
          </View>

          <Text style={styles.titleType}>
            {isInterimChampion(champion) ? "INTERIM TITLE" : "TITLE HOLDER"}
          </Text>
        </View>

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
                <Text style={styles.headshotInitial}>{fighterInitial}</Text>
              </View>
            )}
          </View>

          <View style={styles.fighterInfo}>
            <View style={styles.identityRow}>
              <View style={styles.nameContainer}>
                <Text style={styles.fighterName} numberOfLines={2}>
                  {fighter.full_name || "Unknown Fighter"}
                </Text>

                {nickname && (
                  <Text style={styles.nickname} numberOfLines={1}>
                    {nickname}
                  </Text>
                )}
              </View>

              {flag && (
                <View style={styles.flagContainer}>
                  <Image
                    source={{ uri: flag }}
                    style={styles.flag}
                    contentFit="cover"
                    accessibilityLabel={`${country} flag`}
                  />
                </View>
              )}
            </View>

            <View style={styles.countryRow}>
              <Text style={styles.countryText}>
                {fighter.citizenship ?? country}
              </Text>
            </View>
          </View>
        </View>

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
}

export default memo(MMAChampionItem);

/* -------------------------------------------------------------------------- */
/*                               Item Styles                                  */
/* -------------------------------------------------------------------------- */

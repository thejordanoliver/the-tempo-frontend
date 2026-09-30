import Button from "@/components/Buttons/Button";
import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import HeadingTwo from "@/components/Headings/HeadingTwo";
import Subheading from "@/components/Headings/Subheading";
import { globalStyles } from "@/constants/styles";
import { BadgePreviewSectionStyles } from "@/styles/ProfileStyles/BadgePreviewSectionStyles";
import { BadgeProgress } from "@/types/badges";
import { Text, View } from "react-native";
import BadgePreviewCard from "./BadgePreviewCard";

const BADGE_GRID_COLUMNS = 3;

const chunkBadges = (badges: BadgeProgress[]) => {
  const rows: BadgeProgress[][] = [];

  for (let index = 0; index < badges.length; index += BADGE_GRID_COLUMNS) {
    rows.push(badges.slice(index, index + BADGE_GRID_COLUMNS));
  }

  return rows;
};

type BadgePreviewSectionProps = {
  badges: BadgeProgress[];
  earnedCount: number;
  totalCount: number;
  isDark: boolean;
  itemWidth: number;
  onPressSeeAll?: () => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export default function BadgePreviewSection({
  badges,
  earnedCount,
  totalCount,
  isDark,
  itemWidth,
  onPressSeeAll,
  loading = false,
  error = null,
  onRetry,
}: BadgePreviewSectionProps) {
  const styles = BadgePreviewSectionStyles(isDark);
  const global = globalStyles(isDark);
  const earnedSummary = `${earnedCount} of ${totalCount} earned`;
  const badgeRows = chunkBadges(badges);

  if (loading)
    return (
      <>
        <HeadingTwo isDark={isDark}>Badges</HeadingTwo>
        <View style={global.emptyContainer}>
          <CustomActivityIndicator />
        </View>
      </>
    );

  if (error)
    return (
      <>
        <HeadingTwo isDark={isDark}>Badges</HeadingTwo>
        <View style={global.emptyContainer}>
          <Text selectable style={global.errorText}>
            {error}
          </Text>

          {!!onRetry && (
            <View style={styles.buttonContainer}>
              <Button
                onPress={onRetry}
                style={styles.retryButton}
                isDark={isDark}
              >
                <Text style={styles.retryText}>Retry</Text>
              </Button>
            </View>
          )}
        </View>
      </>
    );

  if (badges.length < 0)
    return (
      <View style={global.emptyContainer}>
        <Text selectable style={global.emptyTitle}>
          No badges earned yet
        </Text>
        <Text selectable style={global.emptyText}>
          Badges are earned through forum posts, comments, likes, and shares.
        </Text>
      </View>
    );

  return (
    <View>
      <HeadingTwo isDark={isDark}>Badges</HeadingTwo>
      <Subheading>{earnedSummary}</Subheading>
      {badgeRows.map((row) => (
        <View key={row.map((badge) => badge.id).join("|")} style={styles.grid}>
          {row.map((badge) => (
            <BadgePreviewCard
              key={badge.id}
              badge={badge}
              isDark={isDark}
              itemWidth={itemWidth}
            />
          ))}
        </View>
      ))}

      {onPressSeeAll && (
        <View style={styles.buttonContainer}>
          <Button onPress={onPressSeeAll} isDark={isDark}>
            See All Badges
          </Button>
        </View>
      )}
    </View>
  );
}

import { SkeletonBlock } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { View } from "react-native";
import { TransactionsStyles } from "styles/LeagueStyles/TransactionsStyles";

export default function TransactionItemSkeleton({
  isDark,
}: {
  isDark: boolean;
}) {
  const styles = TransactionsStyles(isDark);
  const placeholder = {
    backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
  };
  const descriptionLine = {
    ...placeholder,
    marginVertical: (styles.description.lineHeight - 12) / 2,
  };

  return (
    <View style={styles.itemContainer}>
      <View style={styles.teamRow}>
        <View style={styles.logoContainer}>
          <SkeletonBlock radius={999} style={[styles.logo, placeholder]} />
        </View>
        <SkeletonBlock width="42%" height={14} style={placeholder} />
      </View>
      <View>
        <SkeletonBlock width="94%" height={12} style={descriptionLine} />
        <SkeletonBlock width="62%" height={12} style={descriptionLine} />
      </View>
      <SkeletonBlock
        width={76}
        height={10}
        style={{
          ...placeholder,
          marginVertical: (styles.formattedDate.lineHeight - 10) / 2,
        }}
      />
    </View>
  );
}

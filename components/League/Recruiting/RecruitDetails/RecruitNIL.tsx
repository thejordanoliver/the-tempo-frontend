import { Text, View } from "react-native";
import { RecruitDetailsStyles } from "styles/PlayerStyles/RecruitDetailsStyles";
import type { RecruitSectionProps } from "./types";

export default function RecruitNIL({ recruit, isDark }: RecruitSectionProps) {
  const styles = RecruitDetailsStyles(isDark);
  return recruit.nil_valuation != null &&
    Number.isFinite(Number(recruit.nil_valuation)) ? (
    <View style={styles.section}>
      <Text style={styles.heading}>NIL valuation</Text>
      <Text style={styles.statValue}>
        {Number(recruit.nil_valuation).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        })}
      </Text>
    </View>
  ) : (
    <View style={styles.section}>
      <Text style={styles.heading}>NIL valuation</Text>
      <Text style={styles.secondaryText}>NIL valuation unavailable.</Text>
    </View>
  );
}

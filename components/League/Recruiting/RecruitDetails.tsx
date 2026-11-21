import { View } from "react-native";
import { RecruitDetailsStyles } from "styles/PlayerStyles/RecruitDetailsStyles";
import RecruitCommitment from "./RecruitDetails/RecruitCommitment";
import RecruitInterests from "./RecruitDetails/RecruitInterests";
import RecruitNIL from "./RecruitDetails/RecruitNIL";
import RecruitRankings from "./RecruitDetails/RecruitRankings";
import type { RecruitSchoolSectionProps } from "./RecruitDetails/types";

export { RecruitDetailsStyles } from "styles/PlayerStyles/RecruitDetailsStyles";

type Props = RecruitSchoolSectionProps & {
  section?: "ratings" | "nil" | "interests";
};

export default function RecruitDetails({
  section = "ratings",
  ...props
}: Props) {
  const styles = RecruitDetailsStyles(props.isDark);
  return (
    <View style={styles.container}>
      {section === "ratings" && (
        <>
          <RecruitRankings {...props} />
          <RecruitCommitment {...props} />
        </>
      )}
      {section === "interests" && <RecruitInterests {...props} />}
      {section === "nil" && <RecruitNIL {...props} />}
    </View>
  );
}

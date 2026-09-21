import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, activeOpacity } from "constants/styles";
import { HeaderTitle } from "expo-router/react-navigation";
import {
  Animated,
  type ImageSourcePropType,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { customHeaderStyles } from "../../styles/CustomHeaderStyles";

type LeagueHeaderProps = {
  selectedConference?: unknown | null;
  selectedConferenceName?: string;
  tabName?: string;
  onOpenLeagueModal?: () => void;
  rotate: Animated.AnimatedInterpolation<string | number>;
  isDark: boolean;
  logo?: ImageSourcePropType | null;
  hasLeagueColor?: boolean;
};

export function LeagueHeader({
  selectedConference,
  selectedConferenceName,
  tabName,
  onOpenLeagueModal,
  rotate,
  isDark,
  logo,
  hasLeagueColor = false,
}: LeagueHeaderProps) {
  const { width } = useWindowDimensions();
  const styles = customHeaderStyles(isDark, width);

  const textStyle = {
    flexShrink: 1,
    fontFamily: Fonts.REGULAR,
    fontSize: 20,
    color: isDark ? Colors.white : Colors.black,
    textAlign: "center" as const,
  };

  const brandedTextStyle = {
    flexShrink: 1,
    fontFamily: Fonts.REGULAR,
    fontSize: 20,
    color: Colors.white,
    textAlign: "center" as const,
  };

  return (
    <View style={styles.leagueHeaderContainer}>
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onOpenLeagueModal}
        style={styles.leagueHeaderButton}
        disabled={!onOpenLeagueModal}
      >
        <HeaderTitle
          style={
            selectedConference || hasLeagueColor ? brandedTextStyle : textStyle
          }
        >
          {selectedConferenceName || tabName}
        </HeaderTitle>

        {onOpenLeagueModal ? (
          <Animated.View
            style={{
              transform: [
                {
                  rotate,
                },
              ],
            }}
          >
            <Ionicons
              name="chevron-down"
              size={24}
              color={
                selectedConference
                  ? Colors.white
                  : isDark
                    ? Colors.white
                    : Colors.black
              }
            />
          </Animated.View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

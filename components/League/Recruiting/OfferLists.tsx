import { Recruit } from "@/types/recruiting/recruits";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { useState } from "react";
import {
  FlatList,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

type Props = {
  recruit: Recruit;
  isDark: boolean;
};

const COLLAPSED_ROWS = 5;

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function OfferList({ recruit, isDark }: Props) {
  const styles = offerListStyles(isDark);
  const global = globalStyles(isDark);
  const offers = recruit.offers ?? [];

  const [expanded, setExpanded] = useState(false);

  const visibleOffers = expanded ? offers : offers.slice(0, COLLAPSED_ROWS);

  function toggleExpanded() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((previous) => !previous);
  }

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Offers</HeadingTwo>
      <View style={styles.wrapper}>
        <View style={styles.itemContainer}>
          <Text style={[styles.headerText, styles.schoolColumn]}>School</Text>
          <Text style={styles.headerText}>Status</Text>
        </View>

        {offers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={global.emptyText}>No offers yet</Text>
          </View>
        ) : (
          <FlatList
            data={visibleOffers}
            keyExtractor={(item, index) => item.school + index}
            renderItem={({ item, index }) => {
              const isSigned =
                item.status === "Signed" || item.status === "Enrolled";

              return (
                <View
                  style={[
                    styles.itemContainer,
                    index % 2 === 1 && styles.rowAlt,
                  ]}
                >
                  <Text style={[styles.schoolText, styles.schoolColumn]}>
                    {item.school}
                  </Text>

                  {isSigned ? (
                    <Text
                      style={[
                        styles.schoolText,
                        {
                          color: isDark
                            ? Colors.dark.leafGreen
                            : Colors.light.green,
                        },
                      ]}
                    >
                      {item.status} on {item.signedDate ?? "?"}
                    </Text>
                  ) : (
                    <Text style={styles.schoolText}>
                      Offers: {item.hasOffer ? "Yes" : "No"}
                    </Text>
                  )}
                </View>
              );
            }}
            scrollEnabled={false}
          />
        )}

        {offers.length > COLLAPSED_ROWS && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            onPress={toggleExpanded}
            style={styles.showMoreButton}
          >
            <Text style={styles.showMoreText}>
              {expanded ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const offerListStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginVertical: 12,
    },
    wrapper: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      overflow: "hidden",
      borderRadius: 8,
    },
    itemContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    emptyContainer: {
      flexDirection: "row",
      justifyContent: "center",
      padding: 12,
    },
    headerText: {
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    schoolColumn: { flex: 1, minWidth: 0, paddingRight: 12 },
    schoolText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
    rowAlt: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    showMoreButton: {
      alignItems: "center",
      paddingVertical: 12,
    },
    showMoreText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });

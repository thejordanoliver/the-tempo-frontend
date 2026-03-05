import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts, globalStyles } from "constants/Styles";
import { FootballRecruit } from "hooks/CFBHooks/useFootballRecruits";
import { useEffect, useMemo, useState } from "react";
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
  recruit: FootballRecruit;
  isDark: boolean;
};

const COLLAPSED_ROWS = 5;

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function OfferList({ recruit, isDark }: Props) {
  const styles = offerListStyles(isDark);
  const global = globalStyles(isDark);
  const offer = recruit.offers ?? []; // default to empty array

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [expanded]);

  const visibleOffers = useMemo(() => {
    return expanded ? offer : offer.slice(0, COLLAPSED_ROWS);
  }, [expanded, offer]);

  return (
    <View style={styles.container}>
      <HeadingTwo>Offers</HeadingTwo>
      <View style={styles.wrapper}>
        <View style={styles.itemContainer}>
          <Text style={styles.headerText}>School</Text>
          <Text style={styles.headerText}>Status</Text>
        </View>

        {offer.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={global.emptyText}>No offers yet</Text>
          </View>
        ) : (
          <FlatList
            data={visibleOffers}
            keyExtractor={(item, index) => item.school + index}
            renderItem={({ item, index }) => {
              const isSigned = item.status === "Signed" || item.status === "Enrolled";
              const hasOffer = item.hasOffer;
              const isAlt = index % 2 === 1;
              const zebra = isAlt
                ? isDark
                  ? styles.rowAltDark
                  : styles.rowAltLight
                : null;

              return (
                <View style={[styles.itemContainer, zebra]}>
                  <Text style={styles.schoolText}>{item.school}</Text>

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
                      Offers: {hasOffer ? "Yes" : "No"}
                    </Text>
                  )}
                </View>
              );
            }}
            scrollEnabled={false}
          />
        )}

        {offer.length > COLLAPSED_ROWS && (
          <TouchableOpacity
            onPress={() => setExpanded((prev) => !prev)}
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
      paddingHorizontal: 12,
    },
    wrapper: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 8,
    },
    itemContainer: {
      padding: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.white : Colors.black,
    },
    emptyContainer: {
      padding: 12,
      flexDirection: "row",
      justifyContent: "center",
    },
    headerText: {
      fontSize: 16,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    schoolText: {
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
    },
    statusText: {
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    rowAltLight: {
      backgroundColor: Colors.light.itemBackground,
    },
    rowAltDark: {
      backgroundColor: Colors.dark.itemBackground,
    },
    showMoreButton: {
      paddingVertical: 12,
      alignItems: "center",
    },
    showMoreText: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
    },
  });

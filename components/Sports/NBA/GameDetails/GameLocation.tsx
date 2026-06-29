import ConfirmModal from "@/components/ConfirmModal";
import { Ionicons } from "@expo/vector-icons";
import HeadingTwo from "components/Headings/HeadingTwo";
import { activeOpacity, Colors, Fonts } from "constants/styles";
import { WeatherData } from "hooks/useWeather";
import React, { useState } from "react";
import {
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  weather?: WeatherData | null;
  venueImage?: any;
  venueName?: string;
  location?: string;
  address?: string;
  venueCapacity: number | null | undefined;
  venueAttendance?: number | string | null;
  isDark: boolean;
  surface?: "football" | "default";
  grass?: boolean;
};

type DetailRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  isDark: boolean;
  isLast?: boolean;
};

const DetailRow: React.FC<DetailRowProps> = ({
  icon,
  label,
  value,
  isDark,
  isLast = false,
}) => {
  const styles = gameLocationStyles(isDark);

  return (
    <View style={[styles.detailRow, isLast && styles.lastDetailRow]}>
      <View style={styles.detailIconCircle}>
        <Ionicons name={icon} size={18} color={styles.icon.color} />
      </View>

      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
};

const GameLocation: React.FC<Props> = ({
  weather,
  venueImage,
  venueName,
  location,
  address,
  venueCapacity,
  venueAttendance,
  isDark = false,
  grass,
}) => {
  const styles = gameLocationStyles(isDark);
  const [showMapsConfirmModal, setShowMapsConfirmModal] = useState(false);

  const desc = weather?.main?.toLowerCase();

  const temperature =
    typeof weather?.tempFahrenheit === "number"
      ? `${weather.tempFahrenheit.toFixed(0)}°F`
      : null;

  const formattedAttendance =
    venueAttendance !== null &&
    venueAttendance !== undefined &&
    venueAttendance !== "" &&
    !Number.isNaN(Number(venueAttendance))
      ? Intl.NumberFormat("en-US").format(Number(venueAttendance))
      : null;

  const formattedCapcity = Intl.NumberFormat("en-US").format(
    Number(venueCapacity),
  );

  const surfaceLabel =
    typeof grass === "boolean"
      ? grass
        ? "Natural Grass"
        : "Artificial Turf"
      : null;

  const getWeatherIcon = (
    desc?: string,
  ): React.ComponentProps<typeof Ionicons>["name"] => {
    if (!desc) return "cloud";

    if (desc.includes("clear")) return "sunny";
    if (desc.includes("cloud")) return "cloud";
    if (desc.includes("rain")) return "rainy";
    if (desc.includes("drizzle")) return "rainy";
    if (desc.includes("thunder")) return "thunderstorm";
    if (desc.includes("snow")) return "snow";
    if (
      desc.includes("fog") ||
      desc.includes("mist") ||
      desc.includes("haze")
    ) {
      return "cloudy";
    }
    if (desc.includes("wind")) return "leaf";

    return "cloud";
  };

  const getMapsUrl = () => {
    if (!address) return null;

    const encodedAddress = encodeURIComponent(address);

    return Platform.select({
      ios: `http://maps.apple.com/?q=${encodedAddress}`,
      android: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    });
  };

  const openInMaps = () => {
    const url = getMapsUrl();

    if (!url) return;

    setShowMapsConfirmModal(true);
  };

  const handleConfirmOpenMaps = async () => {
    const url = getMapsUrl();

    setShowMapsConfirmModal(false);

    if (!url) return;

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn("Maps app is not available.");
      }
    } catch (err) {
      console.error("Failed to open maps:", err);
    }
  };

  const handleCancelOpenMaps = () => {
    setShowMapsConfirmModal(false);
  };

  if (!venueName) {
    return null;
  }

  const details = [
    temperature
      ? {
          icon: getWeatherIcon(desc),
          label: "Temperature",
          value: temperature,
        }
      : null,
    {
      icon: "person" as const,
      label: "Capacity",
      value: formattedCapcity || "N/A",
    },
    formattedAttendance
      ? {
          icon: "people" as const,
          label: "Attendance",
          value: formattedAttendance,
        }
      : null,
    surfaceLabel
      ? {
          icon: "leaf" as const,
          label: "Surface",
          value: surfaceLabel,
        }
      : null,
  ].filter(Boolean) as {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    label: string;
    value: string;
  }[];

  return (
    <View>
      <HeadingTwo isDark={isDark}>Location</HeadingTwo>

      <View style={styles.wrapper}>
        {venueImage && (
          <Image
            source={
              typeof venueImage === "string" ? { uri: venueImage } : venueImage
            }
            style={styles.venueImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.content}>
          <View style={styles.venueHeader}>
            <View style={styles.venueIconCircle}>
              <Ionicons name="business" size={20} color={styles.icon.color} />
            </View>

            <View style={styles.venueTextWrap}>
              <Text style={styles.venueTitle}>{venueName}</Text>

              {!!location && (
                <Text style={styles.locationText}>{location}</Text>
              )}
            </View>
          </View>

          {address && (
            <TouchableOpacity
              onPress={openInMaps}
              activeOpacity={activeOpacity}
              style={styles.mapCard}
            >
              <View style={styles.mapIconWrap}>
                <Ionicons name="location" size={19} color={styles.icon.color} />
              </View>

              <View style={styles.mapCopy}>
                <Text style={styles.mapLabel}>Address</Text>
                <Text style={styles.addressText}>{address}</Text>
              </View>

              <View style={styles.mapAction}>
                <Text style={styles.mapActionText}>Open</Text>
                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={styles.icon.color}
                />
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.detailsCard}>
            {details.map((item, index) => (
              <DetailRow
                key={`${item.label}-${item.value}`}
                icon={item.icon}
                label={item.label}
                value={item.value}
                isDark={isDark}
                isLast={index === details.length - 1}
              />
            ))}
          </View>
        </View>
      </View>

      <ConfirmModal
        visible={showMapsConfirmModal}
        title="Open in Maps?"
        message="Do you want to open this location in your Maps app?"
        confirmText="Open"
        cancelText="Cancel"
        onConfirm={handleConfirmOpenMaps}
        onCancel={handleCancelOpenMaps}
      />
    </View>
  );
};

const gameLocationStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      overflow: "hidden",
    },
    venueImage: {
      width: "100%",
      height: 220,
    },
    content: {
      padding: 14,
    },
    venueHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 14,
    },
    venueIconCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      borderColor: Colors.midTone,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    venueTextWrap: {
      flex: 1,
    },
    eyebrow: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 13,
      opacity: 0.5,
      color: isDark ? Colors.white : Colors.black,
      marginBottom: 2,
    },
    venueTitle: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 24,
      lineHeight: 30,
      color: isDark ? Colors.white : Colors.black,
    },
    locationText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 15,
      opacity: 0.55,
      marginTop: 4,
      color: isDark ? Colors.white : Colors.black,
    },
    mapCard: {
      flexDirection: "row",
      alignItems: "center",
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 14,
      padding: 12,
      marginBottom: 12,
    },
    mapIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderColor: Colors.midTone,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    mapCopy: {
      flex: 1,
      paddingRight: 10,
    },
    mapLabel: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 13,
      opacity: 0.5,
      color: isDark ? Colors.white : Colors.black,
      marginBottom: 2,
    },
    addressText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 15,
      lineHeight: 20,
      color: isDark ? Colors.white : Colors.black,
    },
    mapAction: {
      flexDirection: "row",
      alignItems: "center",
    },
    mapActionText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 13,
      color: isDark ? Colors.white : Colors.black,
      marginRight: 2,
    },
    detailsCard: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 14,
      overflow: "hidden",
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 13,
      borderBottomColor: Colors.midTone,
      borderBottomWidth: 1,
    },
    lastDetailRow: {
      borderBottomWidth: 0,
    },
    detailIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderColor: Colors.midTone,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    detailCopy: {
      flex: 1,
    },
    detailLabel: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 13,
      opacity: 0.5,
      color: isDark ? Colors.white : Colors.black,
      marginBottom: 2,
    },
    detailValue: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    icon: {
      color: isDark ? Colors.white : Colors.black,
    },
  });

export default GameLocation;

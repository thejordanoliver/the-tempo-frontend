import ConfirmModal from "@/components/ConfirmModal";
import { VenueStyles } from "@/styles/GameDetailStyles/VenueStyles";
import { Ionicons } from "@expo/vector-icons";
import HeadingTwo from "components/Headings/HeadingTwo";
import { activeOpacity } from "constants/styles";
import { WeatherData } from "hooks/useWeather";
import React, { useState } from "react";
import {
  Image,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  weather: WeatherData | null | undefined;
  venueImage: string | null | undefined;
  venueName: string | null | undefined;
  location: string | null | undefined;
  address: string | null | undefined;
  venueCapacity: number | null | undefined;
  venueAttendance: number | null | undefined;
  isDark: boolean;
  circuitLength?: number | string | null;
  circuitLaps?: number | string | null;
  circuitEstablished?: number | string | null;
  surface?: "football" | "default";
  grass?: boolean | undefined;
};

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type DetailItem = {
  icon: IconName;
  label: string;
  value: string;
};

type DetailRowProps = DetailItem & {
  isDark: boolean;
  isLast?: boolean;
};

const formatCircuitValue = (
  value: number | string | null | undefined,
): string | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? String(value) : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (
      !trimmed ||
      ["n/a", "null", "undefined", "-", "0"].includes(trimmed.toLowerCase())
    ) {
      return null;
    }

    return trimmed;
  }

  return null;
};

const formatNumber = (value: number | null | undefined): string | null => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Intl.NumberFormat("en-US").format(value);
};

const getWeatherIcon = (desc?: string | null): IconName => {
  if (!desc) return "cloud";

  const description = desc.toLowerCase();

  if (description.includes("thunder")) return "thunderstorm";
  if (description.includes("clear")) return "sunny";
  if (description.includes("rain")) return "rainy";
  if (description.includes("drizzle")) return "rainy";
  if (description.includes("snow")) return "snow";

  if (
    description.includes("fog") ||
    description.includes("mist") ||
    description.includes("haze")
  ) {
    return "cloudy";
  }

  if (description.includes("wind")) return "leaf";
  if (description.includes("cloud")) return "cloud";

  return "cloud";
};

const DetailRow: React.FC<DetailRowProps> = ({
  icon,
  label,
  value,
  isDark,
  isLast = false,
}) => {
  const styles = VenueStyles(isDark);

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

export default function Venue({
  weather,
  venueImage,
  venueName,
  location,
  address,
  venueCapacity,
  venueAttendance,
  circuitLength,
  circuitLaps,
  circuitEstablished,
  isDark = false,
  grass,
}: Props) {
  const styles = VenueStyles(isDark);

  const [showMapsConfirmModal, setShowMapsConfirmModal] = useState(false);

  // Weather information
  const temperature =
    typeof weather?.tempFahrenheit === "number" &&
    Number.isFinite(weather.tempFahrenheit)
      ? `${weather.tempFahrenheit.toFixed(0)}°F`
      : null;

  // Venue information
  const formattedCapacity = formatNumber(venueCapacity);
  const formattedAttendance = formatNumber(venueAttendance);

  const surfaceLabel =
    typeof grass === "boolean"
      ? grass
        ? "Natural Grass"
        : "Artificial Turf"
      : null;

  // Circuit information
  const formattedCircuitLength = formatCircuitValue(circuitLength);

  const formattedCircuitLaps = formatCircuitValue(circuitLaps);

  const formattedCircuitEstablished = formatCircuitValue(circuitEstablished);

  const hasCircuitInfo = Boolean(
    formattedCircuitLength ||
      formattedCircuitLaps ||
      formattedCircuitEstablished,
  );

  // Maps
  const getMapsUrl = (): string | null => {
    if (!address?.trim()) return null;

    const encodedAddress = encodeURIComponent(address.trim());

    return (
      Platform.select({
        ios: `https://maps.apple.com/?q=${encodedAddress}`,
        android: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
        default: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      }) ?? null
    );
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
        console.warn("Maps app is not available");
      }
    } catch (err) {
      console.error("Failed to open maps:", err);
    }
  };

  const handleCancelOpenMaps = () => {
    setShowMapsConfirmModal(false);
  };

  // Do not render without a venue name
  if (!venueName?.trim()) {
    return null;
  }

  // Build venue and circuit details
  const details: DetailItem[] = (
    [
      temperature
        ? {
            icon: getWeatherIcon(weather?.main),
            label: "Temperature",
            value: temperature,
          }
        : null,

      formattedCapacity || !hasCircuitInfo
        ? {
            icon: "person",
            label: "Capacity",
            value: formattedCapacity ?? "N/A",
          }
        : null,

      formattedAttendance
        ? {
            icon: "people",
            label: "Attendance",
            value: formattedAttendance,
          }
        : null,

      surfaceLabel
        ? {
            icon: "leaf",
            label: "Surface",
            value: surfaceLabel,
          }
        : null,

      formattedCircuitLength
        ? {
            icon: "speedometer-outline",
            label: "Circuit Length",
            value: formattedCircuitLength,
          }
        : null,

      formattedCircuitLaps
        ? {
            icon: "flag-outline",
            label: "Laps",
            value: formattedCircuitLaps,
          }
        : null,

      formattedCircuitEstablished
        ? {
            icon: "calendar-outline",
            label: "Established",
            value: formattedCircuitEstablished,
          }
        : null,
    ] satisfies (DetailItem | null)[]
  ).filter((item): item is DetailItem => item !== null);

  return (
    <View>
      <HeadingTwo isDark={isDark}>Venue</HeadingTwo>

      <View style={styles.wrapper}>
        {/* Venue image */}
        {!!venueImage && (
          <Image
            source={{ uri: venueImage }}
            style={styles.venueImage}
            resizeMode="cover"
            accessibilityLabel={`${venueName} venue`}
          />
        )}

        <View style={styles.content}>
          {/* Venue header */}
          <View style={styles.venueHeader}>
            <View style={styles.venueIconCircle}>
              <Ionicons
                name={hasCircuitInfo ? "flag" : "business"}
                size={20}
                color={styles.icon.color}
              />
            </View>

            <View style={styles.venueTextWrap}>
              <Text style={styles.venueTitle}>{venueName}</Text>

              {!!location && (
                <Text style={styles.locationText}>{location}</Text>
              )}
            </View>
          </View>

          {/* Venue address */}
          {!!address && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Open ${venueName} in Maps`}
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

          {/* Venue and circuit details */}
          {details.length > 0 && (
            <View style={styles.detailsCard}>
              {details.map((item, index) => (
                <DetailRow
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  isDark={isDark}
                  isLast={index === details.length - 1}
                />
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Maps confirmation modal */}
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
}

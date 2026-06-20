import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";

export type WeatherData = {
  main?: string | null;
  description?: string | null;
  icon?: string | null;

  tempFahrenheit?: number | null;
  tempCelsius?: number | null;

  temp?: number | null;
  temperature?: number | null;
  tempFeelsLike?: number | null;
  humidity?: number | null;
  windSpeed?: number | null;

  [key: string]: unknown;
};

type UseWeatherOptions = {
  lat?: number | string | null;
  lon?: number | string | null;
  location?: string | null;
  date?: string | Date | number | null;
  enabled?: boolean;
};

type UseWeatherReturn = {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<WeatherData | null>;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateForWeatherRoute(date: string | Date | number | null | undefined) {
  if (!date) return null;

  if (date instanceof Date) {
    if (Number.isNaN(date.getTime())) return null;

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  if (typeof date === "number") {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return null;

    return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(
      parsedDate.getDate()
    )}T${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}`;
  }

  let normalized = String(date).trim();

  // Handles malformed value like 2026-06-1507:25
  normalized = normalized.replace(
    /^(\d{4}-\d{2}-\d{2})(\d{2}:\d{2})$/,
    "$1T$2"
  );

  // Handles ISO strings like 2026-06-15T07:25:00Z
  const match = normalized.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);

  return match ? match[1] : normalized;
}

function hasValidLatLon(lat?: number | string | null, lon?: number | string | null) {
  if (lat === null || lat === undefined || lon === null || lon === undefined) {
    return false;
  }

  const parsedLat = Number(lat);
  const parsedLon = Number(lon);

  return !Number.isNaN(parsedLat) && !Number.isNaN(parsedLon);
}

export function useWeather({
  lat,
  lon,
  location,
  date,
  enabled = true,
}: UseWeatherOptions): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedDate = useMemo(() => formatDateForWeatherRoute(date), [date]);

  const canFetch = useMemo(() => {
    const hasDate = Boolean(formattedDate);
    const hasLocation = Boolean(location && String(location).trim().length > 0);
    const hasCoords = hasValidLatLon(lat, lon);

    return enabled && hasDate && (hasCoords || hasLocation);
  }, [enabled, formattedDate, lat, lon, location]);

  const refetch = useCallback(async () => {
    if (!canFetch || !formattedDate) {
      setWeather(null);
      setLoading(false);
      setError(null);
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number> = {
        date: formattedDate,
      };

      if (hasValidLatLon(lat, lon)) {
        params.lat = Number(lat);
        params.lon = Number(lon);
      }

      if (location && String(location).trim().length > 0) {
        params.location = String(location).trim();
      }

      const response = await apiClient.get<WeatherData>("api/weather/forecast", {
        params,
      });

      setWeather(response.data);
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to fetch weather forecast";

      setError(message);
      setWeather(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [canFetch, formattedDate, lat, lon, location]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    weather,
    loading,
    error,
    refetch,
  };
}

export default useWeather;
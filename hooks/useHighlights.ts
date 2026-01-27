import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";

type Highlight = {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  views: number;
  channelName: string;
  duration: number;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/* ----------------------------- */
/* HTML & Text Utilities          */
/* ----------------------------- */

/**
 * Decodes HTML entities in YouTube titles.
 */
function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/**
 * Capitalize the first letter of a word.
 */
function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/* ----------------------------- */
/* Acronyms & Proper Nouns        */
/* ----------------------------- */

const ACRONYMS = new Set([
  "NBA", "NFL", "MLB", "NHL", "CFB", "WNBA", "FIBA", "USA", "NCAA",
  "MVP", "DPOY", "ROY", "MIP", "6MOY", "FMVP", "ASG", "HOF", "COY",
  "3PT", "FG", "FT", "FTA", "PTS", "AST", "REB", "STL", "BLK",
  "PG", "SG", "SF", "PF", "C", "GOAT", "OT", "B2B", "FTW", "HOF",
  "LAL", "BOS", "NYK", "CHI", "DAL", "MIA", "PHX", "GSW", "LAC",
]);

const PROPER_NOUNS = new Set([
  "Lakers", "Celtics", "Warriors", "Nuggets", "Clippers", "Suns",
  "Cowboys", "Chiefs", "Packers", "Steelers", "49ers", "Eagles",
  "Yankees", "Dodgers", "Cubs", "Red Sox", "Braves", "Astros",
  "Rangers", "Cardinals", "Mets", "Mariners", "Orioles", "Twins",
  "Rangers", "Panthers", "Penguins", "Bruins", "Blackhawks", "Avalanche",
  "United", "Barcelona", "Arsenal", "Liverpool", "Chelsea", "PSG", "Bayern",
  "Real Madrid", "Manchester City", "Manchester United",
]);

/**
 * Converts a string to sentence case while preserving acronyms and proper nouns.
 */
function toSentenceCasePreserveAcronyms(str: string): string {
  const cleaned = str.toLowerCase().replace(/\s+/g, " ").trim();

  const words = cleaned.split(" ").map((word, i, arr) => {
    const upper = word.toUpperCase();
    if (ACRONYMS.has(upper)) return upper;

    // Check for two-word proper nouns
    const twoWord = i < arr.length - 1 ? `${capitalize(word)} ${capitalize(arr[i + 1])}` : "";
    if (PROPER_NOUNS.has(twoWord)) {
      arr[i + 1] = ""; // skip next word
      return twoWord;
    }

    const cap = capitalize(word);
    return PROPER_NOUNS.has(cap) ? cap : i === 0 ? cap : word;
  });

  return words.filter(Boolean).join(" ");
}

/* ----------------------------- */
/* React Hook: useHighlights      */
/* ----------------------------- */

/**
 * Fetches and caches YouTube highlights for a given sport.
 *
 * @param sport - League abbreviation: "nba", "nfl", "mlb", "nhl", "cfb", "soccer"
 * @param query - Optional search query (defaults to league highlights)
 * @param maxResults - Number of highlights to fetch (1–50)
 */
export function useHighlights(
  sport: string = "nba",
  query: string = "",
  maxResults: number = 10
) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unique key for caching
  const cacheKey = `cachedHighlights-${sport}-${query}-${maxResults}`;

  useEffect(() => {
    const fetchHighlights = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check AsyncStorage cache first
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const cachedData: Highlight[] = JSON.parse(cached);
          setHighlights(cachedData);
          setLoading(false);
        }

        // Fetch from API
        const response = await axios.get<Highlight[]>(`${BASE_URL}/api/highlights`, {
          params: { sport, query, maxResults },
        });

        const data = response.data;

        // Clean and format highlights
        const cleanedData = data
          .filter((item) => !/tickets|playstation/i.test(item.title))
          .map((item) => ({
            ...item,
            title: toSentenceCasePreserveAcronyms(decodeHTMLEntities(item.title)),
            channelName: item.channelName || "Unknown",
          }));

        setHighlights(cleanedData);

        // Cache the results
        await AsyncStorage.setItem(cacheKey, JSON.stringify(cleanedData));
      } catch (err: any) {
        setError(err.message || "Failed to load highlights");
        if (!highlights.length) setHighlights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, [sport, query, maxResults]);

  return { highlights, loading, error };
}

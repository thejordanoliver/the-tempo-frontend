import { CustomHeader } from "@/components/CustomHeader";
import { Colors } from "@/constants/styles";
import { usePreferences } from "@/contexts/PreferencesContext";
import { getWweSuperstars, type WweBrand, type WweSuperstarSummary } from "@/services/wweApi";
import { useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const BRANDS: Array<WweBrand | null> = [
  null, "Raw", "SmackDown", "NXT", "Evolve", "ID/NIL", "Legends",
];
const PAGE_SIZE = 40;

export default function WweLeagueScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const palette = isDark ? Colors.dark : Colors.light;

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState<WweBrand | null>(null);
  const [rows, setRows] = useState<WweSuperstarSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const generation = useRef(0);
  const busy = useRef(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader tabName="WWE" onBack={() => navigation.goBack()} />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const ticket = ++generation.current;
    setRows([]);
    setTotal(0);
    setError(null);
    setLoading(true);
    busy.current = true;
    getWweSuperstars({ q: query, brand, limit: PAGE_SIZE, offset: 0 })
      .then((response) => {
        if (generation.current !== ticket) return;
        setRows(response.data);
        setTotal(response.total);
      })
      .catch(() => {
        if (generation.current === ticket) setError("Could not load the WWE roster.");
      })
      .finally(() => {
        if (generation.current !== ticket) return;
        setLoading(false);
        busy.current = false;
      });
    return () => { generation.current += 1; };
  }, [query, brand, reload]);

  const loadMore = useCallback(() => {
    if (loading || busy.current || rows.length >= total || error) return;
    const ticket = generation.current;
    busy.current = true;
    setLoadingMore(true);
    getWweSuperstars({ q: query, brand, limit: PAGE_SIZE, offset: rows.length })
      .then((response) => {
        if (generation.current !== ticket) return;
        setRows((previous) => {
          const existing = new Set(previous.map((p) => p.id));
          return [...previous, ...response.data.filter((p) => !existing.has(p.id))];
        });
        setTotal(response.total);
      })
      .catch(() => {
        if (generation.current === ticket) setError("Could not load more superstars.");
      })
      .finally(() => {
        if (generation.current !== ticket) return;
        busy.current = false;
        setLoadingMore(false);
      });
  }, [brand, error, loading, query, rows.length, total]);

  const renderItem = useCallback(({ item }: { item: WweSuperstarSummary }) => {
    const image = item.headshot_url || item.profile_image_url;
    return (
      <Pressable
        onPress={() => router.push({ pathname: "/player/wwe/[slug]", params: { slug: item.slug } } as any)}
        style={[styles.item, { borderColor: isDark ? "#343434" : "#E6E6E6" }]}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.name}'s profile`}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.avatar} resizeMode="cover" />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? "#343434" : "#ECECEC" }]}>
            <Text style={[styles.initials, { color: palette.text }]}>{item.name.slice(0, 1)}</Text>
          </View>
        )}
        <View style={styles.itemCopy}>
          <Text style={[styles.name, { color: palette.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.subtext} numberOfLines={1}>
            {item.brand_memberships.length ? item.brand_memberships.join(" · ") : item.brand || "WWE Superstar"}
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>
    );
  }, [isDark, palette.text, router]);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <TextInput
        style={[styles.search, { backgroundColor: palette.itemBackground, color: palette.text }]}
        placeholder="Search WWE superstars"
        placeholderTextColor={Colors.midTone}
        value={searchInput}
        onChangeText={setSearchInput}
        autoCapitalize="none"
        accessibilityLabel="Search WWE superstars"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.filterContent}>
        {BRANDS.map((value) => (
          <Pressable
            key={value ?? "All"}
            onPress={() => setBrand(value)}
            style={[styles.filter, {
              backgroundColor: brand === value ? (isDark ? Colors.dark.lightRed : Colors.light.red) : palette.itemBackground,
            }]}
          >
            <Text style={{ color: brand === value ? Colors.white : palette.text, fontWeight: "600" }}>
              {value ?? "All"}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={[styles.count, { color: Colors.midTone }]}>{loading ? "Loading roster…" : `${total} profiles`}</Text>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.slug}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? (
          <Pressable disabled={!error} onPress={() => setReload((value) => value + 1)}>
            <Text style={[styles.message, { color: palette.text }]}>{error ? error + " Tap to retry." : "No superstars found."}</Text>
          </Pressable>
        ) : <ActivityIndicator style={styles.message} />}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.message} /> : error && rows.length > 0 ?
          <Pressable onPress={() => setReload((value) => value + 1)}><Text style={[styles.message, { color: palette.text }]}>{error} Tap to retry.</Text></Pressable> : null}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 14, marginBottom: 10, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  filters: { flexGrow: 0, maxHeight: 49 },
  filterContent: { paddingHorizontal: 14, gap: 8, alignItems: "center" },
  filter: { borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  count: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4, fontSize: 12 },
  list: { paddingHorizontal: 14, paddingBottom: 28 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  avatar: { width: 56, height: 56, borderRadius: 10 },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  initials: { fontSize: 24, fontWeight: "700" },
  itemCopy: { flex: 1, gap: 3 },
  name: { fontSize: 17, fontWeight: "700" },
  subtext: { color: "#999999", fontSize: 12 },
  arrow: { fontSize: 26, color: "#888888" },
  message: { textAlign: "center", paddingVertical: 30 },
});

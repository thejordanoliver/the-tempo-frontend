import { CustomHeader } from "@/components/CustomHeader";
import { Colors } from "@/constants/styles";
import { usePreferences } from "@/contexts/PreferencesContext";
import { getWweSuperstar, type WweSuperstar } from "@/services/wweApi";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function titles(items: unknown[]): string[] {
  return items.flatMap((item) => {
    if (typeof item === "string") return [item];
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const label = record.name ?? record.title ?? record.label;
    return typeof label === "string" ? [label] : [];
  });
}

export default function WweSuperstarProfile() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const palette = isDark ? Colors.dark : Colors.light;
  const [superstar, setSuperstar] = useState<WweSuperstar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeader tabName="Superstar" onBack={() => navigation.goBack()} />,
    });
  }, [navigation]);

  useEffect(() => {
    let canceled = false;
    setLoading(true);
    setError(null);
    setSuperstar(null);
    if (!slug || Array.isArray(slug)) {
      setLoading(false);
      setError("Invalid superstar.");
      return;
    }
    getWweSuperstar(slug)
      .then((data) => { if (!canceled) setSuperstar(data); })
      .catch(() => { if (!canceled) setError("Unable to load the superstar profile."); })
      .finally(() => { if (!canceled) setLoading(false); });
    return () => { canceled = true; };
  }, [slug]);

  if (loading) {
    return <View style={[styles.center, { backgroundColor: palette.background }]}><ActivityIndicator /></View>;
  }
  if (!superstar) {
    return <View style={[styles.center, { backgroundColor: palette.background }]}>
      <Text style={{ color: palette.text }}>{error || "Superstar not found."}</Text>
    </View>;
  }

  const image = superstar.headshot_url;
  const metadata: Array<[string, string | number | null]> = [
    ["Brand", superstar.brand_memberships.join(", ") || superstar.brand],
    ["Height", superstar.height],
    ["Weight", superstar.weight != null ? `${superstar.weight} lbs` : null],
    ["Billed from", superstar.billed_from],
    ["Debut year", superstar.debut_year],
  ];
  const championships = titles(Array.isArray(superstar.championships) ? superstar.championships : []);
  const accolades = titles(Array.isArray(superstar.accolades) ? superstar.accolades : []);

  return (
    <ScrollView style={{ backgroundColor: palette.background }} contentContainerStyle={styles.content}>
      {image ? <Image source={{ uri: image }} style={styles.portrait} resizeMode="contain" /> :
        <View style={[styles.portrait, styles.placeholder, { backgroundColor: palette.itemBackground }]}>
          <Text style={{ fontSize: 72, color: palette.text, fontWeight: "700" }}>{superstar.name.slice(0, 1)}</Text>
        </View>}
      <Text style={[styles.heading, { color: palette.text }]}>{superstar.name}</Text>
      {superstar.nickname ? <Text style={styles.muted}>{superstar.nickname}</Text> : null}
      <View style={[styles.details, { backgroundColor: palette.itemBackground }]}>
        {metadata.filter(([, value]) => value != null && value !== "").map(([label, value]) => (
          <View style={styles.detailRow} key={label}>
            <Text style={styles.muted}>{label}</Text>
            <Text style={[styles.value, { color: palette.text }]}>{value}</Text>
          </View>
        ))}
      </View>
      {superstar.biography ? <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: palette.text }]}>Biography</Text>
        <Text style={[styles.description, { color: palette.text }]}>{superstar.biography}</Text>
      </View> : null}
      {superstar.signature_moves?.length ? <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: palette.text }]}>Signature Moves</Text>
        <Text style={[styles.description, { color: palette.text }]}>{superstar.signature_moves.join(" · ")}</Text>
      </View> : null}
      {championships.length ? <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: palette.text }]}>Championships</Text>
        <Text style={[styles.description, { color: palette.text }]}>{championships.join(" · ")}</Text>
      </View> : null}
      {accolades.length ? <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: palette.text }]}>Accolades</Text>
        <Text style={[styles.description, { color: palette.text }]}>{accolades.join(" · ")}</Text>
      </View> : null}
      {superstar.wwe_profile_url ? <Pressable
        style={styles.external}
        accessibilityRole="link"
        onPress={() => { void Linking.openURL(superstar.wwe_profile_url!); }}
      ><Text style={styles.externalText}>View official WWE profile</Text></Pressable> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  content: { padding: 18, paddingBottom: 48, alignItems: "stretch", gap: 14 },
  portrait: { width: "100%", height: 280, borderRadius: 16 },
  placeholder: { alignItems: "center", justifyContent: "center" },
  heading: { fontSize: 30, fontWeight: "800", textAlign: "center" },
  muted: { color: "#999999", fontSize: 14 },
  details: { padding: 14, borderRadius: 14, gap: 14 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  value: { flex: 1, textAlign: "right", fontWeight: "600" },
  section: { gap: 8, paddingTop: 6 },
  sectionHeading: { fontSize: 20, fontWeight: "700" },
  description: { fontSize: 15, lineHeight: 23 },
  external: { padding: 15, backgroundColor: "#CC0000", borderRadius: 12, alignItems: "center", marginTop: 12 },
  externalText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});

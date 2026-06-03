import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const faqs = [
  { q: "How do I earn points?", a: "Scan the QR code at any volunteering event to earn points automatically." },
  { q: "When do my points expire?", a: "Points are valid for 12 months from the date they were earned." },
  { q: "How do I redeem a coupon?", a: "Go to Rewards, choose a coupon, redeem it, then show the 6-digit PIN to the cashier." },
  { q: "Can I transfer points to someone else?", a: "Points are non-transferable and tied to your individual account." },
  { q: "What happens if my QR scan fails?", a: "Try again or approach the event coordinator who can manually log your attendance." },
];

export default function Help() {
  const router = useRouter();
  const { theme } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const accent = "#22d3a5";

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Help & FAQ</Text>
          <View style={styles.spacer} />
        </View>

        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: accent }]}>
          <View style={styles.bannerIconBox}>
            <Ionicons name="help-circle-outline" size={42} color="#fff" />
          </View>
          <Text style={styles.bannerTitle}>Got questions?</Text>
          <Text style={styles.bannerSub}>Find answers to the most common questions below</Text>
          <View style={styles.bannerDecor} />
        </View>

        {/* FAQ Accordion */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Frequently Asked</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {faqs.map((faq, index) => (
              <View
                key={index}
                style={[
                  styles.faqItem,
                  index < faqs.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                ]}
              >
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => setOpenIndex(openIndex === index ? null : index)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.faqQ, { color: theme.colors.text }]}>{faq.q}</Text>
                  <Ionicons
                    name={openIndex === index ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={accent}
                  />
                </TouchableOpacity>
                {openIndex === index && (
                  <Text style={[styles.faqA, { color: theme.colors.textSecondary }]}>{faq.a}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: 48 },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  pageTitle: { fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
  spacer: { width: 40, height: 40 },
  banner: {
    marginHorizontal: 20, borderRadius: 24, padding: 24,
    marginBottom: 28, overflow: "hidden", position: "relative", alignItems: "center",
  },
  bannerIconBox: { marginBottom: 8 },
  bannerTitle: { color: "#fff", fontSize: 20, fontWeight: "900", marginBottom: 6 },
  bannerSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, textAlign: "center" },
  bannerDecor: {
    position: "absolute", width: 140, height: 140, borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.1)", bottom: -50, right: -30,
  },
  section: { paddingHorizontal: 20 },
  sectionLabel: {
    fontSize: 11, fontWeight: "800", letterSpacing: 1.2,
    textTransform: "uppercase", marginBottom: 12,
  },
  card: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  faqItem: { paddingHorizontal: 16, paddingVertical: 14 },
  faqQuestion: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  faqQ: { flex: 1, fontSize: 14, fontWeight: "700", marginRight: 12 },
  faqA: { fontSize: 13, fontWeight: "500", marginTop: 10, lineHeight: 20 },
});
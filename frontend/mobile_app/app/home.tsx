import { Text, View, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

interface FeaturedEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  points: number;
  category: string;
  emoji?: string;
  image?: any;
  color: string;
  participants: number;
  maxParticipants: number;
}

const featuredEvents: FeaturedEvent[] = [
  {
    id: "1",
    title: "Beach Cleanup",
    date: "May 18",
    location: "East Coast Park",
    points: 50,
    category: "Environment",
    image: require("@/assets/images/beach.webp"),
    color: "#10b981",
    participants: 24,
    maxParticipants: 30,
  },
  {
    id: "2",
    title: "Food Bank Volunteer",
    date: "May 20",
    location: "Downtown Food Bank",
    points: 40,
    category: "Food & Hunger",
    image: require("@/assets/images/foodbank.jpg"),
    color: "#f97316",
    participants: 18,
    maxParticipants: 25,
  },
  {
    id: "3",
    title: "Park Restoration",
    date: "May 25",
    location: "Botanic Gardens",
    points: 60,
    category: "Environment",
    image: require("@/assets/images/park.jpg"),
    color: "#6366f1",
    participants: 32,
    maxParticipants: 40,
  },
];

const updates = [
  { id: "1", emoji: "🎉", title: "You earned 50 pts!", subtitle: "Beach Cleanup — 2 days ago" },
  { id: "2", emoji: "🆕", title: "New event added", subtitle: "Youth Tutoring — May 22" },
];

const UNREAD_COUNT = 3; // ← change this to 0 when no unread notifications
const CARD_IMAGE_HEIGHT = 120;
const CARD_WIDTH = 200;

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>Good morning 👋</Text>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Volunteer Rewards</Text>
          </View>
          <View style={styles.headerRight}>

            {/* Bell with red badge */}
            <TouchableOpacity
              style={[styles.notifBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => router.push("/notifications")}
            >
              <Text style={styles.notifEmoji}>🔔</Text>
              {UNREAD_COUNT > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{UNREAD_COUNT}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Avatar → Profile */}
            <TouchableOpacity
              style={[styles.avatarBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}
              onPress={() => router.push("/profile" as any)}
              activeOpacity={0.8}
            >
              <View style={styles.avatarInner}>
                <View style={[styles.avatarHead, { backgroundColor: theme.colors.textSecondary }]} />
                <View style={[styles.avatarBody, { backgroundColor: theme.colors.textSecondary }]} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── POINTS HERO CARD ── */}
        <View style={[styles.heroCard, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.heroCardDecor1} />
          <View style={styles.heroCardDecor2} />
          <View style={styles.heroLeft}>
            <Text style={styles.heroLabel}>YOUR POINTS</Text>
            <Text style={styles.heroPoints}>214</Text>
            <Text style={styles.heroCaption}>86 pts to next reward 🎁</Text>
          </View>
          <View style={styles.heroRight}>
            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.heroActionBtn} onPress={() => router.push("/scan")}>
                <Text style={styles.heroActionEmoji}>📷</Text>
                <Text style={styles.heroActionText}>Scan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroActionBtn} onPress={() => router.push("/rewards")}>
                <Text style={styles.heroActionEmoji}>🎁</Text>
                <Text style={styles.heroActionText}>Redeem</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroActionBtn} onPress={() => router.push("/my-coupons" as any)}>
                <Text style={styles.heroActionEmoji}>🎟️</Text>
                <Text style={styles.heroActionText}>Coupons</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── STATS ROW ── */}
        <View style={styles.statsRow}>
          {[
            { emoji: "⏱️", value: "18", label: "Hours" },
            { emoji: "📅", value: "4", label: "Events" },
            { emoji: "🏆", value: "9", label: "Rewards" },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── FEATURED EVENTS ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Featured Events</Text>
            <TouchableOpacity onPress={() => router.push("/events")}>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {featuredEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                activeOpacity={0.88}
                onPress={() => router.push("/events")}
              >
                <View style={[styles.eventCardTop, { backgroundColor: event.color }]}>
                  {event.image && (
                    <Image
                      source={event.image}
                      style={{ width: CARD_WIDTH, height: CARD_IMAGE_HEIGHT, position: "absolute", top: 0, left: 0 }}
                      resizeMode="cover"
                    />
                  )}
                  {!event.image && event.emoji && (
                    <Text style={styles.eventCardEmoji}>{event.emoji}</Text>
                  )}
                  <View style={styles.eventCardOverlay} />
                  <View style={styles.eventCardBadge}>
                    <Text style={styles.eventCardBadgeText}>{event.category}</Text>
                  </View>
                </View>

                <View style={[styles.eventCardBody, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.eventCardDate, { color: event.color }]}>{event.date}</Text>
                  <Text style={[styles.eventCardTitle, { color: theme.colors.text }]}>{event.title}</Text>
                  <Text style={[styles.eventCardLocation, { color: theme.colors.textSecondary }]}>📍 {event.location}</Text>
                  <View style={[styles.progressBg, { backgroundColor: theme.colors.border }]}>
                    <View style={[styles.progressFill, {
                      width: `${(event.participants / event.maxParticipants) * 100}%` as any,
                      backgroundColor: event.color,
                    }]} />
                  </View>
                  <View style={styles.eventCardFooter}>
                    <Text style={[styles.eventParticipants, { color: theme.colors.textSecondary }]}>
                      {event.participants}/{event.maxParticipants} joined
                    </Text>
                    <Text style={[styles.eventPoints, { color: event.color }]}>+{event.points} pts</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── MY COUPONS BANNER ── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.couponsBanner, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => router.push("/my-coupons" as any)}
            activeOpacity={0.85}
          >
            <View style={[styles.couponsBannerIcon, { backgroundColor: "#ec489922" }]}>
              <Text style={styles.couponsBannerEmoji}>🎟️</Text>
            </View>
            <View style={styles.couponsBannerText}>
              <Text style={[styles.couponsBannerTitle, { color: theme.colors.text }]}>My Coupons</Text>
              <Text style={[styles.couponsBannerSub, { color: theme.colors.textSecondary }]}>2 active coupons ready to use</Text>
            </View>
            <Text style={[styles.couponsBannerArrow, { color: theme.colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── UPDATES ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Updates</Text>
            <TouchableOpacity onPress={() => router.push("/notifications")}>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          {updates.map((update) => (
            <View key={update.id} style={[styles.updateCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[styles.updateIconBox, { backgroundColor: theme.colors.surfaceSecondary }]}>
                <Text style={styles.updateEmoji}>{update.emoji}</Text>
              </View>
              <View style={styles.updateText}>
                <Text style={[styles.updateTitle, { color: theme.colors.text }]}>{update.title}</Text>
                <Text style={[styles.updateSubtitle, { color: theme.colors.textSecondary }]}>{update.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { paddingBottom: 40 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  greeting: { fontSize: 13, fontWeight: "500", marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: "900" },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  // Bell with badge
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
  },
  notifEmoji: { fontSize: 18 },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },

  // Avatar
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarInner: { alignItems: "center", justifyContent: "center" },
  avatarHead: { width: 16, height: 16, borderRadius: 8, marginBottom: 2 },
  avatarBody: { width: 24, height: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12 },

  // Hero Card
  heroCard: {
    marginHorizontal: 24,
    borderRadius: 28,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
    position: "relative",
  },
  heroCardDecor1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -80,
    right: -60,
  },
  heroCardDecor2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: -40,
    left: 20,
  },
  heroLeft: { flex: 1, zIndex: 1 },
  heroLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  heroPoints: { color: "#fff", fontSize: 52, fontWeight: "900", lineHeight: 56, marginBottom: 6 },
  heroCaption: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  heroRight: { zIndex: 1 },
  heroActions: { gap: 8 },
  heroActionBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    width: 76,
  },
  heroActionEmoji: { fontSize: 20, marginBottom: 3 },
  heroActionText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: "900", marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: "600" },

  // Sections
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: "900" },
  seeAll: { fontSize: 13, fontWeight: "700" },

  // Events
  horizontalScroll: { paddingLeft: 24 },
  eventCard: {
    width: CARD_WIDTH,
    borderRadius: 24,
    overflow: "hidden",
    marginRight: 14,
  },
  eventCardTop: {
    height: CARD_IMAGE_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  eventCardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 1,
  },
  eventCardEmoji: { fontSize: 40, zIndex: 1 },
  eventCardBadge: {
    position: "absolute",
    bottom: 8,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    zIndex: 2,
  },
  eventCardBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  eventCardBody: { padding: 14 },
  eventCardDate: { fontSize: 12, fontWeight: "800", marginBottom: 4 },
  eventCardTitle: { fontSize: 15, fontWeight: "900", marginBottom: 4 },
  eventCardLocation: { fontSize: 11, marginBottom: 10 },
  progressBg: { height: 5, borderRadius: 3, marginBottom: 6, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  eventCardFooter: { flexDirection: "row", justifyContent: "space-between" },
  eventParticipants: { fontSize: 10, fontWeight: "600" },
  eventPoints: { fontSize: 12, fontWeight: "800" },

  // Coupons Banner
  couponsBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
  },
  couponsBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  couponsBannerEmoji: { fontSize: 24 },
  couponsBannerText: { flex: 1 },
  couponsBannerTitle: { fontSize: 15, fontWeight: "800", marginBottom: 2 },
  couponsBannerSub: { fontSize: 12 },
  couponsBannerArrow: { fontSize: 24, fontWeight: "300" },

  updateCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 24,
    marginBottom: 10,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  updateIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  updateEmoji: { fontSize: 22 },
  updateText: { flex: 1 },
  updateTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  updateSubtitle: { fontSize: 12 },
});
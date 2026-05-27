import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet, FlatList, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: string;
  available: boolean;
  emoji: string;
  color: string;
  validUntil: string;
  merchant: string;
  discount: string;
  terms: string[];
}

const rewardsData: Reward[] = [
  {
    id: "1", title: "Coffee Shop Voucher", description: "Get $5 off your purchase",
    pointsCost: 200, category: "Food & Drink", available: true, emoji: "☕", color: "#f97316",
    validUntil: "30 Jun 2026", merchant: "Volunteer Café", discount: "$5 OFF",
    terms: ["Redeemable at all participating outlets.", "Not valid with any other discounts.", "No cash value.", "One voucher per transaction."],
  },
  {
    id: "2", title: "Restaurant Discount", description: "15% off total bill",
    pointsCost: 500, category: "Dining", available: true, emoji: "🍽️", color: "#ec4899",
    validUntil: "31 Jul 2026", merchant: "Partner Restaurants", discount: "15% OFF",
    terms: ["Valid at participating restaurants only.", "Cannot be combined with other offers.", "No cash value.", "One use per visit."],
  },
  {
    id: "3", title: "Movie Tickets", description: "2 free movie tickets",
    pointsCost: 800, category: "Entertainment", available: true, emoji: "🎬", color: "#6366f1",
    validUntil: "31 Aug 2026", merchant: "Golden Village", discount: "2 FREE TICKETS",
    terms: ["Valid for standard screenings only.", "Not valid on public holidays.", "No cash value.", "Booking required in advance."],
  },
  {
    id: "4", title: "Gift Card $50", description: "Redeem for $50 gift card",
    pointsCost: 3000, category: "Shopping", available: false, emoji: "🎁", color: "#94a3b8",
    validUntil: "Need 3,000 pts", merchant: "CapitaLand Malls", discount: "$50 GIFT CARD",
    terms: ["Valid at all CapitaLand malls.", "Cannot be exchanged for cash.", "Non-transferable.", "Subject to availability."],
  },
  {
    id: "5", title: "Gym Membership", description: "1 month free gym access",
    pointsCost: 1200, category: "Fitness", available: true, emoji: "💪", color: "#10b981",
    validUntil: "30 Sep 2026", merchant: "ActiveSG Gyms", discount: "1 MONTH FREE",
    terms: ["Valid at all ActiveSG outlets.", "New members only.", "No cash value.", "Registration required."],
  },
  {
    id: "6", title: "Book Voucher", description: "Get $20 off books",
    pointsCost: 400, category: "Shopping", available: true, emoji: "📚", color: "#3b82f6",
    validUntil: "31 Jul 2026", merchant: "Popular Bookstore", discount: "$20 OFF",
    terms: ["Minimum purchase of $30.", "Valid at all Popular outlets.", "No cash value.", "One voucher per transaction."],
  },
];

export default function Rewards() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [userPoints] = useState(2500);

  const filteredRewards = rewardsData.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePress = (item: Reward) => {
    router.push({
      pathname: "/coupon-detail",
      params: {
        title: item.title,
        description: item.description,
        pointsCost: item.pointsCost.toString(),
        emoji: item.emoji,
        color: item.color,
        validUntil: item.validUntil,
        merchant: item.merchant,
        discount: item.discount,
        terms: JSON.stringify(item.terms),
        userPoints: userPoints.toString(),
      },
    });
  };

  const renderRewardCard = ({ item }: { item: Reward }) => {
    const canRedeem = userPoints >= item.pointsCost && item.available;

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => handlePress(item)}
        style={styles.ticketWrapper}
      >
        <View style={[styles.ticket, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={[styles.ticketStrip, { backgroundColor: item.color }]}>
            <Text style={styles.ticketEmoji}>{item.emoji}</Text>
          </View>
          <View style={[styles.notchLeft, { backgroundColor: theme.colors.background }]} />
          <View style={styles.ticketContent}>
            <View style={styles.ticketTop}>
              <Text style={[styles.ticketTitle, { color: theme.colors.text }]} numberOfLines={1}>{item.title}</Text>
              {!item.available && <Text style={styles.lockEmoji}>🔒</Text>}
            </View>
            <Text style={[styles.ticketDesc, { color: theme.colors.textSecondary }]}>{item.description}</Text>
            <Text style={[styles.ticketValid, { color: theme.colors.textTertiary }]}>{item.validUntil}</Text>
          </View>
          <View style={[styles.notchRight, { backgroundColor: theme.colors.background }]} />
          <View style={styles.ticketRight}>
            <Text style={[styles.ticketPoints, { color: item.color }]}>{item.pointsCost}</Text>
            <Text style={[styles.ticketPtsLabel, { color: theme.colors.textSecondary }]}>pts</Text>
            <TouchableOpacity
              style={[styles.redeemBtn, { backgroundColor: canRedeem ? item.color : theme.colors.border }]}
              disabled={!canRedeem}
              onPress={() => handlePress(item)}
            >
              <Text style={styles.redeemBtnText}>{canRedeem ? "→" : "🔒"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.backText, { color: theme.colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Rewards</Text>
        <View style={[styles.pointsBadge, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.pointsBadgeText}>⭐ {userPoints} pts</Text>
        </View>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search coupons..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredRewards}
        keyExtractor={(item) => item.id}
        renderItem={renderRewardCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎁</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No coupons found</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Try a different search</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  backText: { fontSize: 18, fontWeight: "700" },
  headerTitle: { fontSize: 20, fontWeight: "900" },
  pointsBadge: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  pointsBadgeText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  searchBox: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginBottom: 20, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 30 },
  ticketWrapper: { marginBottom: 14 },
  ticket: { flexDirection: "row", alignItems: "center", borderRadius: 18, borderWidth: 1, overflow: "hidden", height: 100 },
  ticketStrip: { width: 72, height: "100%", alignItems: "center", justifyContent: "center" },
  ticketEmoji: { fontSize: 32 },
  notchLeft: { width: 18, height: 18, borderRadius: 9, marginLeft: -9, zIndex: 2 },
  notchRight: { width: 18, height: 18, borderRadius: 9, marginRight: -9, zIndex: 2 },
  ticketContent: { flex: 1, paddingHorizontal: 12, justifyContent: "center" },
  ticketTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  ticketTitle: { fontSize: 14, fontWeight: "800", flex: 1, marginRight: 4 },
  lockEmoji: { fontSize: 14 },
  ticketDesc: { fontSize: 12, marginBottom: 4 },
  ticketValid: { fontSize: 10, fontWeight: "500" },
  ticketRight: { width: 72, alignItems: "center", justifyContent: "center", gap: 4, paddingRight: 8 },
  ticketPoints: { fontSize: 18, fontWeight: "900" },
  ticketPtsLabel: { fontSize: 10, fontWeight: "600", marginTop: -4 },
  redeemBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 4 },
  redeemBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  empty: { alignItems: "center", marginTop: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  emptyText: { fontSize: 14 },
});
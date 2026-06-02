import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet, FlatList, TextInput, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.72.201:3000/api";

interface Coupon {
  id: number;
  title: string;
  description: string;
  points_required: number;
  quantity: number;
  expiry_date: string;
  status: string;
  image_url?: string;
}

const getCouponStyle = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes("fairprice")) return { icon: "cart-outline", color: "#f97316" };
  if (lower.includes("kopitiam") || lower.includes("breadtalk")) return { icon: "restaurant-outline", color: "#ec4899" };
  if (lower.includes("cathay") || lower.includes("movie")) return { icon: "film-outline", color: "#6366f1" };
  if (lower.includes("popular") || lower.includes("book")) return { icon: "book-outline", color: "#3b82f6" };
  if (lower.includes("gym") || lower.includes("activesg")) return { icon: "barbell-outline", color: "#10b981" };
  if (lower.includes("grab")) return { icon: "car-outline", color: "#22c55e" };
  if (lower.includes("capitaland") || lower.includes("gift")) return { icon: "gift-outline", color: "#a855f7" };
  return { icon: "ticket-outline", color: "#6366f1" };
};

export default function Rewards() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem("user");
        if (stored) {
          const user = JSON.parse(stored);
          setUserPoints(user.points || 0);
        }
        const response = await fetch(`${BASE_URL}/coupons`);
        const data = await response.json();
        setCoupons(data.coupons || []);
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredCoupons = coupons.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePress = (item: Coupon) => {
    const style = getCouponStyle(item.title);
    const validDate = new Date(item.expiry_date).toLocaleDateString();

    router.push({
      pathname: "/coupon-detail",
      params: {
        couponId: item.id.toString(), // ← ADDED
        title: item.title,
        description: item.description,
        pointsCost: item.points_required.toString(),
        emoji: style.icon,
        color: style.color,
        validUntil: validDate,
        merchant: item.title.split(" ")[0],
        discount: item.title,
        terms: JSON.stringify([
          "Redeemable at participating outlets.",
          "Not valid with any other discounts.",
          "No cash value.",
          "One voucher per transaction.",
        ]),
        userPoints: userPoints.toString(),
      },
    });
  };

  const renderRewardCard = ({ item }: { item: Coupon }) => {
    const style = getCouponStyle(item.title);
    const canRedeem = userPoints >= item.points_required;
    const validDate = new Date(item.expiry_date).toLocaleDateString();

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => handlePress(item)}
        style={styles.ticketWrapper}
      >
        <View style={[styles.ticket, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={[styles.ticketStrip, { backgroundColor: style.color }]}>
            <Ionicons name={style.icon as any} size={32} color="#fff" />
          </View>
          <View style={[styles.notchLeft, { backgroundColor: theme.colors.background }]} />
          <View style={styles.ticketContent}>
            <View style={styles.ticketTop}>
              <Text style={[styles.ticketTitle, { color: theme.colors.text }]} numberOfLines={1}>{item.title}</Text>
              {!canRedeem && <Ionicons name="lock-closed" size={14} color={theme.colors.textSecondary} />}
            </View>
            <Text style={[styles.ticketDesc, { color: theme.colors.textSecondary }]} numberOfLines={1}>{item.description}</Text>
            <Text style={[styles.ticketValid, { color: theme.colors.textTertiary }]}>Valid till {validDate}</Text>
          </View>
          <View style={[styles.notchRight, { backgroundColor: theme.colors.background }]} />
          <View style={styles.ticketRight}>
            <Text style={[styles.ticketPoints, { color: style.color }]}>{item.points_required}</Text>
            <Text style={[styles.ticketPtsLabel, { color: theme.colors.textSecondary }]}>pts</Text>
            <TouchableOpacity
              style={[styles.redeemBtn, { backgroundColor: canRedeem ? style.color : theme.colors.border }]}
              disabled={!canRedeem}
              onPress={() => handlePress(item)}
            >
              <Ionicons
                name={canRedeem ? "arrow-forward" : "lock-closed"}
                size={16}
                color="#fff"
              />
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
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Rewards</Text>
        <View style={[styles.pointsBadge, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="star" size={14} color="#fff" />
          <Text style={styles.pointsBadgeText}>{userPoints} pts</Text>
        </View>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Ionicons name="search-outline" size={18} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search coupons..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredCoupons}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRewardCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="gift-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No coupons found</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Try a different search</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: "900" },
  pointsBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  pointsBadgeText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 20, marginBottom: 20, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 30 },
  ticketWrapper: { marginBottom: 14 },
  ticket: { flexDirection: "row", alignItems: "center", borderRadius: 18, borderWidth: 1, overflow: "hidden", height: 100 },
  ticketStrip: { width: 72, height: "100%", alignItems: "center", justifyContent: "center" },
  notchLeft: { width: 18, height: 18, borderRadius: 9, marginLeft: -9, zIndex: 2 },
  notchRight: { width: 18, height: 18, borderRadius: 9, marginRight: -9, zIndex: 2 },
  ticketContent: { flex: 1, paddingHorizontal: 12, justifyContent: "center" },
  ticketTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  ticketTitle: { fontSize: 14, fontWeight: "800", flex: 1, marginRight: 4 },
  ticketDesc: { fontSize: 12, marginBottom: 4 },
  ticketValid: { fontSize: 10, fontWeight: "500" },
  ticketRight: { width: 72, alignItems: "center", justifyContent: "center", gap: 4, paddingRight: 8 },
  ticketPoints: { fontSize: 18, fontWeight: "900" },
  ticketPtsLabel: { fontSize: 10, fontWeight: "600", marginTop: -4 },
  redeemBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 4 },
  empty: { alignItems: "center", marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 16, marginBottom: 6 },
  emptyText: { fontSize: 14 },
});
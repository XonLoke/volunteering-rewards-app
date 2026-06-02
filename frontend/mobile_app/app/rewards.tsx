import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { api } from "../../src/services/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";


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

  if (lower.includes("fairprice")) {
    return { icon: "cart-outline", color: "#f97316", category: "Groceries" };
  }

  if (
    lower.includes("kopitiam") ||
    lower.includes("breadtalk") ||
    lower.includes("food") ||
    lower.includes("meal")
  ) {
    return { icon: "restaurant-outline", color: "#ec4899", category: "Food" };
  }

  if (
    lower.includes("cathay") ||
    lower.includes("movie") ||
    lower.includes("cinema")
  ) {
    return {
      icon: "film-outline",
      color: "#6366f1",
      category: "Entertainment",
    };
  }

  if (
    lower.includes("popular") ||
    lower.includes("book") ||
    lower.includes("stationery")
  ) {
    return { icon: "book-outline", color: "#3b82f6", category: "Lifestyle" };
  }

  if (
    lower.includes("gym") ||
    lower.includes("activesg") ||
    lower.includes("sport")
  ) {
    return { icon: "barbell-outline", color: "#10b981", category: "Fitness" };
  }

  if (lower.includes("grab") || lower.includes("transport")) {
    return { icon: "car-outline", color: "#22c55e", category: "Transport" };
  }

  if (
    lower.includes("capitaland") ||
    lower.includes("gift") ||
    lower.includes("voucher")
  ) {
    return { icon: "gift-outline", color: "#a855f7", category: "Voucher" };
  }

  return { icon: "ticket-outline", color: "#6366f1", category: "Reward" };
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return "No expiry date";
  }

  return date.toLocaleDateString("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDaysLeft = (dateStr: string) => {
  const expiry = new Date(dateStr);

  if (Number.isNaN(expiry.getTime())) {
    return "No expiry";
  }

  const today = new Date();
  const diff = expiry.getTime() - today.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return "Expired";
  if (days === 0) return "Ends today";
  if (days === 1) return "1 day left";

  return `${days} days left`;
};

export default function Rewards() {
  const router = useRouter();
  const { theme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const stored = await AsyncStorage.getItem("user");

      if (stored) {
        const user = JSON.parse(stored);
        setUserPoints(user.points || 0);
      }

      const response = await api.get("/rewards");
      const data = await response.json();

      setCoupons(data.coupons || []);
    } catch (err) {
      console.error("Failed to fetch rewards:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const filteredCoupons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return coupons;
    }

    return coupons.filter((coupon) => {
      const style = getCouponStyle(coupon.title);

      return (
        coupon.title.toLowerCase().includes(query) ||
        coupon.description.toLowerCase().includes(query) ||
        style.category.toLowerCase().includes(query)
      );
    });
  }, [coupons, searchQuery]);

  const redeemableCount = coupons.filter(
    (coupon) => userPoints >= coupon.points_required && coupon.quantity > 0
  ).length;

  const lockedCount = Math.max(coupons.length - redeemableCount, 0);

  const handlePress = (item: Coupon) => {
    const style = getCouponStyle(item.title);
    const validDate = formatDate(item.expiry_date);

    router.push({
      pathname: "/coupon-detail",
      params: {
        couponId: item.id.toString(),
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
    const soldOut = item.quantity <= 0;
    const lowStock = item.quantity > 0 && item.quantity <= 5;
    const remainingPoints = Math.max(item.points_required - userPoints, 0);
    const progress =
      item.points_required > 0
        ? Math.min(userPoints / item.points_required, 1)
        : 1;

    const validDate = formatDate(item.expiry_date);
    const daysLeft = getDaysLeft(item.expiry_date);

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => handlePress(item)}
        style={styles.ticketWrapper}
      >
        <View
          style={[
            styles.ticket,
            {
              backgroundColor: theme.colors.surface,
              borderColor:
                canRedeem && !soldOut
                  ? style.color + "55"
                  : theme.colors.border,
              opacity: soldOut ? 0.68 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.ticketStrip,
              {
                backgroundColor:
                  canRedeem && !soldOut ? style.color : theme.colors.border,
              },
            ]}
          >
            <Ionicons name={style.icon as any} size={31} color="#fff" />

            <Text style={styles.stripCategory} numberOfLines={1}>
              {style.category}
            </Text>
          </View>

          <View
            style={[
              styles.notchLeft,
              { backgroundColor: theme.colors.background },
            ]}
          />

          <View style={styles.ticketContent}>
            <View style={styles.ticketTop}>
              <Text
                style={[styles.ticketTitle, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>

              {canRedeem && !soldOut ? (
                <View
                  style={[
                    styles.readyBadge,
                    { backgroundColor: style.color + "18" },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={12}
                    color={style.color}
                  />
                  <Text style={[styles.readyText, { color: style.color }]}>
                    Ready
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.lockBadge,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <Ionicons
                    name={soldOut ? "close-circle" : "lock-closed"}
                    size={12}
                    color={theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.lockText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {soldOut ? "Sold" : "Lock"}
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={[styles.ticketDesc, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.description}
            </Text>

            <View style={styles.metaRow}>
              <View
                style={[
                  styles.miniPill,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={
                    daysLeft === "Expired"
                      ? "#ef4444"
                      : theme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.miniPillText,
                    {
                      color:
                        daysLeft === "Expired"
                          ? "#ef4444"
                          : theme.colors.textSecondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {daysLeft}
                </Text>
              </View>

              {lowStock && !soldOut && (
                <View style={[styles.miniPill, { backgroundColor: "#f59e0b22" }]}>
                  <Ionicons name="flame-outline" size={12} color="#f59e0b" />
                  <Text style={[styles.miniPillText, { color: "#f59e0b" }]}>
                    {item.quantity} left
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={[styles.ticketValid, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              Valid till {validDate}
            </Text>

            <View
              style={[
                styles.progressTrack,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor:
                      canRedeem && !soldOut ? style.color : theme.colors.primary,
                    width: `${progress * 100}%`,
                  },
                ]}
              />
            </View>

            <Text
              style={[styles.progressText, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {soldOut
                ? "Currently unavailable"
                : canRedeem
                ? "Enough points to redeem"
                : `${remainingPoints} more points needed`}
            </Text>
          </View>

          <View
            style={[
              styles.notchRight,
              { backgroundColor: theme.colors.background },
            ]}
          />

          <View style={styles.ticketRight}>
            <Text style={[styles.ticketPoints, { color: style.color }]}>
              {item.points_required}
            </Text>

            <Text
              style={[
                styles.ticketPtsLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              pts
            </Text>

            <TouchableOpacity
              style={[
                styles.redeemBtn,
                {
                  backgroundColor:
                    canRedeem && !soldOut ? style.color : theme.colors.border,
                },
              ]}
              disabled={!canRedeem || soldOut}
              onPress={() => handlePress(item)}
              activeOpacity={0.82}
            >
              <Ionicons
                name={canRedeem && !soldOut ? "arrow-forward" : "lock-closed"}
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
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backBtn,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={23} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text
            style={[styles.headerMini, { color: theme.colors.textSecondary }]}
          >
            Rewards Store
          </Text>

          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Redeem Perks
          </Text>
        </View>

        <View
          style={[styles.pointsBadge, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name="star" size={14} color="#fff" />
          <Text style={styles.pointsBadgeText}>{userPoints}</Text>
        </View>
      </View>

      <FlatList
        data={loading ? [] : filteredCoupons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRewardCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          !loading && filteredCoupons.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            <View
              style={[
                styles.heroCard,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <View style={styles.heroTop}>
                <View>
                  <Text style={styles.heroLabel}>Available Balance</Text>

                  <View style={styles.heroPointsRow}>
                    <Text style={styles.heroPoints}>{userPoints}</Text>
                    <Text style={styles.heroPtsText}>pts</Text>
                  </View>
                </View>

                <View style={styles.heroIconBox}>
                  <Ionicons name="gift" size={34} color="#fff" />
                </View>
              </View>

              <Text style={styles.heroSubText}>
                Use your volunteer points to unlock vouchers, perks, and
                community rewards.
              </Text>

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatBox}>
                  <Text style={styles.heroStatNumber}>{coupons.length}</Text>
                  <Text style={styles.heroStatLabel}>Rewards</Text>
                </View>

                <View style={styles.heroStatBox}>
                  <Text style={styles.heroStatNumber}>{redeemableCount}</Text>
                  <Text style={styles.heroStatLabel}>Ready</Text>
                </View>

                <View style={styles.heroStatBox}>
                  <Text style={styles.heroStatNumber}>{lockedCount}</Text>
                  <Text style={styles.heroStatLabel}>Locked</Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={19}
                color={theme.colors.textSecondary}
              />

              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                placeholder="Search rewards, food, vouchers..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons
                    name="close-circle"
                    size={19}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text
                  style={[styles.sectionTitle, { color: theme.colors.text }]}
                >
                  Available Coupons
                </Text>

                <Text
                  style={[
                    styles.sectionSubtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {loading
                    ? "Loading coupons..."
                    : `${filteredCoupons.length} coupon${
                        filteredCoupons.length === 1 ? "" : "s"
                      } found`}
                </Text>
              </View>

              <View
                style={[
                  styles.livePill,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <View style={styles.liveDot} />
                <Text
                  style={[
                    styles.liveText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Live
                </Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <View
                style={[
                  styles.loadingIconBox,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>

              <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>
                Loading rewards
              </Text>

              <Text
                style={[
                  styles.loadingText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Fetching the latest coupons from the rewards store...
              </Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <View
                style={[
                  styles.emptyIconOuter,
                  { backgroundColor: theme.colors.primary + "10" },
                ]}
              >
                <View
                  style={[
                    styles.emptyIconBox,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <Ionicons
                    name="gift-outline"
                    size={58}
                    color={theme.colors.primary}
                  />
                </View>
              </View>

              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No coupons found
              </Text>

              <Text
                style={[styles.emptyText, { color: theme.colors.textSecondary }]}
              >
                Try searching for another reward, voucher, or category.
              </Text>

              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={[
                    styles.clearSearchBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  activeOpacity={0.82}
                >
                  <Text style={styles.clearSearchText}>Clear search</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  headerCenter: {
    flex: 1,
    paddingHorizontal: 14,
  },

  headerMini: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  pointsBadge: {
    minWidth: 66,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 12,
  },

  pointsBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 5,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  emptyList: {
    flexGrow: 1,
  },

  heroCard: {
    borderRadius: 30,
    padding: 22,
    marginTop: 6,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  heroLabel: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 5,
  },

  heroPointsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  heroPoints: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1.2,
  },

  heroPtsText: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 5,
    marginBottom: 7,
  },

  heroIconBox: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroSubText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 12,
  },

  heroStatsRow: {
    flexDirection: "row",
    marginTop: 18,
  },

  heroStatBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 8,
  },

  heroStatNumber: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },

  heroStatLabel: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 54,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: 14,
    marginLeft: 9,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },

  livePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#10b981",
    marginRight: 6,
  },

  liveText: {
    fontSize: 12,
    fontWeight: "800",
  },

  ticketWrapper: {
    marginBottom: 15,
  },

  ticket: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    minHeight: 132,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },

  ticketStrip: {
    width: 76,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  stripCategory: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    textAlign: "center",
    marginTop: 8,
  },

  notchLeft: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: -9,
    alignSelf: "center",
    zIndex: 2,
  },

  notchRight: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: -9,
    alignSelf: "center",
    zIndex: 2,
  },

  ticketContent: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: "center",
  },

  ticketTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  ticketTitle: {
    fontSize: 15,
    fontWeight: "900",
    flex: 1,
    marginRight: 8,
  },

  readyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
  },

  readyText: {
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 4,
  },

  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
  },

  lockText: {
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 4,
  },

  ticketDesc: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 7,
  },

  miniPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 4,
  },

  miniPillText: {
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 4,
  },

  ticketValid: {
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 8,
  },

  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 5,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  progressText: {
    fontSize: 10,
    fontWeight: "700",
  },

  ticketRight: {
    width: 74,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 8,
    paddingVertical: 12,
  },

  ticketPoints: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  ticketPtsLabel: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: -5,
  },

  redeemBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingHorizontal: 34,
  },

  loadingIconBox: {
    width: 88,
    height: 88,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  loadingTitle: {
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 6,
  },

  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 45,
    paddingHorizontal: 34,
  },

  emptyIconOuter: {
    width: 136,
    height: 136,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  emptyIconBox: {
    width: 104,
    height: 104,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    fontWeight: "600",
  },

  clearSearchBtn: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
  },

  clearSearchText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
});
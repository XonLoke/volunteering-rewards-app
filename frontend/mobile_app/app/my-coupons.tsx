import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { api } from "../../src/services/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";


interface Coupon {
  id: number;
  user_id: number;
  coupon_id: number;
  title: string;
  description: string;
  pin_hash: string;
  status: string;
  expiry_date: string;
  redeemed_at: string | null;
  created_at: string;
}

type FilterType = "active" | "used" | "all";

const getCouponStyle = (title: string) => {
  const lower = title.toLowerCase();

  if (lower.includes("fairprice")) {
    return { icon: "cart-outline", color: "#f97316" };
  }

  if (lower.includes("kopitiam") || lower.includes("breadtalk")) {
    return { icon: "restaurant-outline", color: "#ec4899" };
  }

  if (lower.includes("cathay") || lower.includes("movie")) {
    return { icon: "film-outline", color: "#6366f1" };
  }

  if (lower.includes("popular") || lower.includes("book")) {
    return { icon: "book-outline", color: "#3b82f6" };
  }

  if (lower.includes("gym") || lower.includes("activesg")) {
    return { icon: "barbell-outline", color: "#10b981" };
  }

  if (lower.includes("grab")) {
    return { icon: "car-outline", color: "#22c55e" };
  }

  if (lower.includes("capitaland") || lower.includes("gift")) {
    return { icon: "gift-outline", color: "#a855f7" };
  }

  return { icon: "ticket-outline", color: "#6366f1" };
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString();
};

const isCouponExpired = (expiryDate: string | null) => {
  if (!expiryDate) return false;

  const date = new Date(expiryDate);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() < new Date().getTime();
};

export default function MyCoupons() {
  const router = useRouter();
  const { theme } = useTheme();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("active");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCurrentPoints = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const storedPoints = await AsyncStorage.getItem("userPoints");

      if (storedPoints !== null && !Number.isNaN(Number(storedPoints))) {
        setCurrentPoints(Number(storedPoints));
        return;
      }

      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentPoints(Number(user.points ?? 0));
      }
    } catch (error) {
      console.error("Failed to load current points:", error);
    }
  };

  const fetchCoupons = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        Alert.alert("Login required", "Please login again.");
        router.replace("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      await loadCurrentPoints();

      const response = await api.get("/me/coupons");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to fetch coupons.");
      }

      const fetchedCoupons = data.coupons || [];

      const sortedCoupons = fetchedCoupons.sort((a: Coupon, b: Coupon) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      setCoupons(sortedCoupons);
    } catch (err: any) {
      console.error("Failed to fetch coupons:", err);
      Alert.alert("Error", err.message || "Failed to load coupons.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCoupons(true);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCoupons(false);
  };

  const activeCoupons = coupons.filter(
    (coupon) => coupon.status === "unused" && !isCouponExpired(coupon.expiry_date)
  );

  const usedCoupons = coupons.filter((coupon) => coupon.status === "used");

  const expiredCoupons = coupons.filter(
    (coupon) => coupon.status !== "used" && isCouponExpired(coupon.expiry_date)
  );

  const getVisibleCoupons = () => {
    if (selectedFilter === "active") {
      return activeCoupons;
    }

    if (selectedFilter === "used") {
      return [...usedCoupons, ...expiredCoupons];
    }

    return coupons;
  };

  const visibleCoupons = getVisibleCoupons();

  const handleUseCoupon = (coupon: Coupon) => {
    const expired = isCouponExpired(coupon.expiry_date);

    if (coupon.status === "used") {
      Alert.alert("Coupon already used", "This coupon has already been used.");
      return;
    }

    if (expired) {
      Alert.alert("Coupon expired", "This coupon has expired.");
      return;
    }

    const style = getCouponStyle(coupon.title);
    const expiryDate = formatDate(coupon.expiry_date);

    router.push({
      pathname: "/pin-display",
      params: {
        pin: coupon.pin_hash,
        title: coupon.title,
        description: coupon.description,
        color: style.color,
        emoji: style.icon,
        validUntil: expiryDate,
        code: `VR-${coupon.pin_hash}`,
        userCouponId: String(coupon.id),
      },
    } as any);
  };

  const renderFilterButton = (label: string, value: FilterType, count: number) => {
    const active = selectedFilter === value;

    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: active
              ? theme.colors.primary
              : theme.colors.surface,
            borderColor: active
              ? theme.colors.primary
              : theme.colors.border,
          },
        ]}
        onPress={() => setSelectedFilter(value)}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.filterText,
            {
              color: active ? "#fff" : theme.colors.textSecondary,
            },
          ]}
        >
          {label} {count}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCoupon = (coupon: Coupon) => {
    const style = getCouponStyle(coupon.title);
    const isUsed = coupon.status === "used";
    const isExpired = isCouponExpired(coupon.expiry_date);
    const disabled = isUsed || isExpired;

    const expiryDate = formatDate(coupon.expiry_date);
    const usedDate = formatDate(coupon.redeemed_at);
    const createdDate = formatDate(coupon.created_at);

    const statusLabel = isUsed ? "USED" : isExpired ? "EXPIRED" : "ACTIVE";
    const statusColor = disabled ? theme.colors.textTertiary : style.color;
    const statusBg = disabled ? theme.colors.border : style.color + "22";

    return (
      <View
        key={coupon.id}
        style={[
          styles.couponContainer,
          {
            borderColor: disabled ? theme.colors.border : style.color,
            opacity: disabled ? 0.55 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.couponCard,
            {
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: style.color + "22",
              },
            ]}
          >
            <Ionicons name={style.icon as any} size={28} color={style.color} />
          </View>

          <View style={styles.contentSection}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.couponTitle, { color: theme.colors.text }]}
                numberOfLines={2}
              >
                {coupon.title}
              </Text>

              <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {statusLabel}
                </Text>
              </View>
            </View>

            {isUsed ? (
              <Text
                style={[
                  styles.metaText,
                  {
                    color: theme.colors.textTertiary,
                  },
                ]}
              >
                Used on: {usedDate}
              </Text>
            ) : isExpired ? (
              <Text
                style={[
                  styles.metaText,
                  {
                    color: theme.colors.textTertiary,
                  },
                ]}
              >
                Expired: {expiryDate}
              </Text>
            ) : (
              <>
                <Text
                  style={[
                    styles.metaText,
                    {
                      color: theme.colors.textSecondary,
                    },
                  ]}
                >
                  Expires: {expiryDate}
                </Text>

                <Text
                  style={[
                    styles.descriptionText,
                    {
                      color: theme.colors.textSecondary,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {coupon.description}
                </Text>

                <Text
                  style={[
                    styles.instanceText,
                    {
                      color: theme.colors.textTertiary,
                    },
                  ]}
                >
                  Redeemed: {createdDate} · Coupon #{coupon.id}
                </Text>
              </>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.useButton,
              {
                backgroundColor: disabled ? theme.colors.border : style.color,
              },
            ]}
            onPress={() => handleUseCoupon(coupon)}
            disabled={disabled}
          >
            <Text
              style={[
                styles.useButtonText,
                {
                  color: disabled ? theme.colors.textTertiary : "#fff",
                },
              ]}
            >
              {isUsed ? "USED" : isExpired ? "EXPIRED" : "USE"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            My Coupons
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}
          >
            Each redemption creates a new coupon
          </Text>
        </View>

        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
        >
          <Text style={styles.countText}>{activeCoupons.length}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              styles.loadingText,
              {
                color: theme.colors.textSecondary,
              },
            ]}
          >
            Loading coupons...
          </Text>
        </View>
      ) : coupons.length === 0 ? (
        <View style={styles.empty}>
          <View
            style={[
              styles.emptyIconBox,
              {
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <Ionicons
              name="ticket-outline"
              size={58}
              color={theme.colors.textSecondary}
            />
          </View>

          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No coupons yet
          </Text>

          <Text
            style={[
              styles.emptyText,
              {
                color: theme.colors.textSecondary,
              },
            ]}
          >
            Redeem rewards to get coupons!
          </Text>

          <TouchableOpacity
            style={[
              styles.rewardsButton,
              {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => router.push("/rewards")}
          >
            <Text style={styles.rewardsButtonText}>Browse Rewards</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.summaryRow}>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.summaryIcon,
                  {
                    backgroundColor: theme.colors.primary + "22",
                  },
                ]}
              >
                <Ionicons name="star" size={22} color={theme.colors.primary} />
              </View>

              <Text
                style={[
                  styles.summaryLabel,
                  {
                    color: theme.colors.textSecondary,
                  },
                ]}
              >
                Balance
              </Text>

              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {currentPoints.toLocaleString()}
              </Text>

              <Text
                style={[
                  styles.summarySmall,
                  {
                    color: theme.colors.textSecondary,
                  },
                ]}
              >
                points left
              </Text>
            </View>

            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.summaryIcon,
                  {
                    backgroundColor: theme.colors.primary + "22",
                  },
                ]}
              >
                <Ionicons name="ticket" size={22} color={theme.colors.primary} />
              </View>

              <Text
                style={[
                  styles.summaryLabel,
                  {
                    color: theme.colors.textSecondary,
                  },
                ]}
              >
                Active
              </Text>

              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {activeCoupons.length}
              </Text>

              <Text
                style={[
                  styles.summarySmall,
                  {
                    color: theme.colors.textSecondary,
                  },
                ]}
              >
                coupons
              </Text>
            </View>
          </View>

          <View style={styles.filterRow}>
            {renderFilterButton("Active", "active", activeCoupons.length)}
            {renderFilterButton(
              "Used",
              "used",
              usedCoupons.length + expiredCoupons.length
            )}
            {renderFilterButton("All", "all", coupons.length)}
          </View>

          {visibleCoupons.length === 0 ? (
            <View
              style={[
                styles.emptyFilterBox,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="ticket-outline"
                size={38}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.emptyFilterTitle, { color: theme.colors.text }]}>
                Nothing here
              </Text>
              <Text
                style={[
                  styles.emptyFilterText,
                  {
                    color: theme.colors.textSecondary,
                  },
                ]}
              >
                No coupons for this category.
              </Text>
            </View>
          ) : (
            visibleCoupons.map(renderCoupon)
          )}
        </ScrollView>
      )}
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
    paddingTop: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "center",
  },
  countBadge: {
    minWidth: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  countText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    alignItems: "center",
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "900",
  },
  summarySmall: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "800",
  },
  couponContainer: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 22,
    marginBottom: 18,
    padding: 1,
  },
  couponCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    flexShrink: 0,
  },
  contentSection: {
    flex: 1,
    justifyContent: "center",
    marginRight: 12,
  },
  titleRow: {
    marginBottom: 4,
  },
  couponTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  instanceText: {
    fontSize: 10,
    lineHeight: 14,
  },
  useButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 68,
    flexShrink: 0,
  },
  useButtonText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  empty: {
    alignItems: "center",
    marginTop: 70,
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 108,
    height: 108,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  rewardsButton: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  rewardsButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  emptyFilterBox: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
  },
  emptyFilterTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyFilterText: {
    fontSize: 13,
    textAlign: "center",
  },
});
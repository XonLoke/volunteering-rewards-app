import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

interface Coupon {
  id: string;
  emoji: string;
  title: string;
  expiresDate: string;
  description: string;
  details: string[];
  color: string;
  isUsed: boolean;
  usedDate?: string;
}

const couponsData: Coupon[] = [
  {
    id: "1",
    emoji: "☕",
    title: "Coffee Shop $5 Voucher",
    expiresDate: "May 15, 2026",
    description: "Valid at participating locations",
    details: ["Show PIN at checkout"],
    color: "#f97316",
    isUsed: false,
  },
  {
    id: "2",
    emoji: "🍽️",
    title: "Restaurant 15% Off",
    expiresDate: "May 20, 2026",
    description: "15% off total bill",
    details: ["Cannot combine with other offers"],
    color: "#ec4899",
    isUsed: false,
  },
  {
    id: "3",
    emoji: "🎬",
    title: "Movie Tickets (USED)",
    expiresDate: "Used on: May 1, 2026",
    description: "Used on: May 1, 2026",
    details: [],
    color: "#6366f1",
    isUsed: true,
    usedDate: "May 1, 2026",
  },
];

export default function MyCoupons() {
  const router = useRouter();
  const { theme } = useTheme();

  const activeCoupons = couponsData.filter((c) => !c.isUsed);

  const handleUseCoupon = (coupon: Coupon) => {
    if (!coupon.isUsed) {
      router.push("/pin-display" as any);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backText, { color: theme.colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Coupons</Text>
        <View style={[styles.countBadge, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.countText}>{activeCoupons.length} active</Text>
        </View>
      </View>

      {/* Coupons List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {couponsData.map((coupon) => (
          <View
            key={coupon.id}
            style={[
              styles.couponContainer,
              {
                borderColor: coupon.isUsed ? theme.colors.border : coupon.color,
                opacity: coupon.isUsed ? 0.5 : 1,
              },
            ]}
          >
            <View style={[styles.couponCard, { backgroundColor: theme.colors.surface }]}>

              {/* Left Icon */}
              <View style={[styles.iconBox, { backgroundColor: coupon.color + "22" }]}>
                <Text style={styles.couponEmoji}>{coupon.emoji}</Text>
              </View>

              {/* Main Content */}
              <View style={styles.contentSection}>
                <Text style={[styles.couponTitle, { color: theme.colors.text }]} numberOfLines={2}>
                  {coupon.title}
                </Text>

                {coupon.isUsed ? (
                  <Text style={[styles.expiresLabel, { color: theme.colors.textTertiary }]}>
                    Used on: {coupon.usedDate}
                  </Text>
                ) : (
                  <>
                    <Text style={[styles.expiresLabel, { color: theme.colors.textSecondary }]}>
                      Expires: {coupon.expiresDate}
                    </Text>
                    <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
                      {coupon.description}
                    </Text>
                    {coupon.details.map((detail, index) => (
                      <Text key={index} style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                        • {detail}
                      </Text>
                    ))}
                  </>
                )}
              </View>

              {/* Use Button */}
              <TouchableOpacity
                style={[
                  styles.useButton,
                  { backgroundColor: coupon.isUsed ? theme.colors.border : coupon.color },
                ]}
                onPress={() => handleUseCoupon(coupon)}
                disabled={coupon.isUsed}
              >
                <Text style={[styles.useButtonText, { color: coupon.isUsed ? theme.colors.textTertiary : "#fff" }]}>
                  {coupon.isUsed ? "USED" : "USE"}
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        ))}
      </ScrollView>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  backText: { fontSize: 18, fontWeight: "700" },
  headerTitle: { fontSize: 20, fontWeight: "900" },
  countBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  countText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  couponContainer: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 20,
    marginBottom: 20,
    padding: 1,
  },
  couponCard: {
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    flexShrink: 0,
  },
  couponEmoji: { fontSize: 28 },
  contentSection: {
    flex: 1,
    justifyContent: "center",
    marginRight: 12,
  },
  couponTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  expiresLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 11,
    marginBottom: 2,
  },
  useButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
    flexShrink: 0,
  },
  useButtonText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
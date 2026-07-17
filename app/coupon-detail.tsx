import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Svg, Rect } from "react-native-svg";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

function QRPlaceholder({ color }: { color: string }) {
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Rect x={8} y={8} width={32} height={32} rx={4} fill={color} />
      <Rect x={16} y={16} width={16} height={16} rx={2} fill="#fff" />
      <Rect x={80} y={8} width={32} height={32} rx={4} fill={color} />
      <Rect x={88} y={16} width={16} height={16} rx={2} fill="#fff" />
      <Rect x={8} y={80} width={32} height={32} rx={4} fill={color} />
      <Rect x={16} y={88} width={16} height={16} rx={2} fill="#fff" />
      <Rect x={48} y={8} width={8} height={8} rx={2} fill={color} />
      <Rect x={60} y={8} width={8} height={8} rx={2} fill={color} />
      <Rect x={48} y={20} width={8} height={8} rx={2} fill={color} />
      <Rect x={48} y={48} width={8} height={8} rx={2} fill={color} />
      <Rect x={60} y={48} width={8} height={8} rx={2} fill={color} />
      <Rect x={72} y={48} width={8} height={8} rx={2} fill={color} />
      <Rect x={60} y={60} width={8} height={8} rx={2} fill={color} />
      <Rect x={72} y={60} width={8} height={8} rx={2} fill={color} />
      <Rect x={48} y={72} width={8} height={8} rx={2} fill={color} />
      <Rect x={60} y={72} width={8} height={8} rx={2} fill={color} />
      <Rect x={72} y={72} width={8} height={8} rx={2} fill={color} />
      <Rect x={80} y={48} width={8} height={8} rx={2} fill={color} />
      <Rect x={92} y={60} width={8} height={8} rx={2} fill={color} />
      <Rect x={104} y={48} width={8} height={8} rx={2} fill={color} />
      <Rect x={80} y={72} width={8} height={8} rx={2} fill={color} />
      <Rect x={104} y={72} width={8} height={8} rx={2} fill={color} />
      <Rect x={48} y={84} width={8} height={8} rx={2} fill={color} />
      <Rect x={60} y={96} width={8} height={8} rx={2} fill={color} />
      <Rect x={72} y={84} width={8} height={8} rx={2} fill={color} />
      <Rect x={80} y={96} width={8} height={8} rx={2} fill={color} />
      <Rect x={92} y={84} width={8} height={8} rx={2} fill={color} />
      <Rect x={104} y={96} width={8} height={8} rx={2} fill={color} />
    </Svg>
  );
}

export default function CouponDetail() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  const [currentPoints, setCurrentPoints] = useState(0);

  const safeParseTerms = () => {
    try {
      if (typeof params.terms === "string") {
        return JSON.parse(params.terms) as string[];
      }
      return [];
    } catch {
      return [];
    }
  };

  const coupon = {
    couponId: Number(params.couponId),
    title: typeof params.title === "string" ? params.title : "Reward Coupon",
    description:
      typeof params.description === "string"
        ? params.description
        : "Redeem this reward with your volunteer points.",
    pointsCost: Number(params.pointsCost) || 0,
    icon: typeof params.emoji === "string" ? params.emoji : "gift-outline",
    color:
      typeof params.color === "string" ? params.color : theme.colors.primary,
    validUntil:
      typeof params.validUntil === "string" ? params.validUntil : "31 Dec 2026",
    merchant: typeof params.merchant === "string" ? params.merchant : "",
    discount: typeof params.discount === "string" ? params.discount : "",
    terms: safeParseTerms(),
    userPoints: Number(params.userPoints) || 0,
  };

  useEffect(() => {
    const loadLatestPoints = async () => {
      try {
        const storedPoints = await AsyncStorage.getItem("userPoints");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedPoints !== null && !Number.isNaN(Number(storedPoints))) {
          setCurrentPoints(Number(storedPoints));
          return;
        }

        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentPoints(
            Number(user.points_balance ?? user.points ?? coupon.userPoints ?? 0)
          );
          return;
        }

        setCurrentPoints(coupon.userPoints);
      } catch (error) {
        console.error("Failed to load latest points:", error);
        setCurrentPoints(coupon.userPoints);
      }
    };

    loadLatestPoints();
  }, []);

  const canRedeem = currentPoints >= coupon.pointsCost;

  const handleRedeem = () => {
    if (!canRedeem) {
      Alert.alert(
        "Not enough points",
        `You need ${coupon.pointsCost} points, but you only have ${currentPoints} points.`
      );
      return;
    }

    router.push({
      pathname: "/redeem-confirmation",
      params: {
        couponId: String(coupon.couponId),
        title: coupon.title,
        description: coupon.description,
        pointsCost: String(coupon.pointsCost),
        currentBalance: String(currentPoints),
        color: coupon.color,
        emoji: coupon.icon,
        validUntil: coupon.validUntil,
      },
    });
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Reward Details</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Redeem your volunteer points
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.ticketTop, { backgroundColor: coupon.color }]}>
          <View style={styles.ticketTopDecor1} />
          <View style={styles.ticketTopDecor2} />

          <View style={styles.ticketIconCircle}>
            <Ionicons name={coupon.icon as any} size={34} color={coupon.color} />
          </View>

          <Text style={styles.ticketTitle}>{coupon.title}</Text>

          <View style={styles.pointsPill}>
            <Ionicons name="star" size={14} color="#fff" />
            <Text style={styles.ticketPoints}>{coupon.pointsCost} PTS</Text>
          </View>
        </View>

        <View style={[styles.dividerRow, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.notchLeft, { backgroundColor: theme.colors.background }]} />
          <View style={styles.dashedLine}>
            {Array.from({ length: 18 }).map((_, i) => (
              <View key={i} style={[styles.dash, { backgroundColor: theme.colors.border }]} />
            ))}
          </View>
          <View style={[styles.notchRight, { backgroundColor: theme.colors.background }]} />
        </View>

        <View style={[styles.ticketBottom, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.descTitle, { color: theme.colors.text }]}>About this coupon</Text>
          <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>{coupon.description}</Text>

          {coupon.terms.length > 0 && (
            <View style={[styles.termsBox, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              {coupon.terms.map((term, i) => (
                <View key={i} style={styles.termRow}>
                  <Text style={[styles.termDot, { color: coupon.color }]}>•</Text>
                  <Text style={[styles.termText, { color: theme.colors.textSecondary }]}>{term}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.validRow}>
            <Text style={[styles.validLabel, { color: theme.colors.textSecondary }]}>Valid until</Text>
            <Text style={[styles.validDate, { color: theme.colors.text }]}>{coupon.validUntil}</Text>
          </View>

          <View style={[styles.separator, { borderColor: theme.colors.border }]} />

          <View style={styles.qrSection}>
            <Text style={[styles.qrLabel, { color: theme.colors.textSecondary }]}>Coupon Preview</Text>
            <View style={[styles.qrBox, { backgroundColor: "#fff", borderColor: theme.colors.border }]}>
              <QRPlaceholder color={coupon.color} />
            </View>
            <Text style={[styles.qrNote, { color: theme.colors.textTertiary }]}>
              PIN will be shown in My Coupons after redemption
            </Text>
          </View>

          <View style={[styles.pointsRow, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
            <View style={styles.pointsItem}>
              <Text style={[styles.pointsItemLabel, { color: theme.colors.textSecondary }]}>Points Required</Text>
              <Text style={[styles.pointsItemValue, { color: coupon.color }]}>{coupon.pointsCost} pts</Text>
            </View>

            <View style={[styles.pointsDivider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.pointsItem}>
              <Text style={[styles.pointsItemLabel, { color: theme.colors.textSecondary }]}>Your Balance</Text>
              <Text style={[styles.pointsItemValue, { color: theme.colors.text }]}>
                {currentPoints.toLocaleString()} pts
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.redeemBtn, { backgroundColor: canRedeem ? coupon.color : theme.colors.border }]}
          disabled={!canRedeem}
          activeOpacity={0.85}
          onPress={handleRedeem}
        >
          <Text style={styles.redeemBtnText}>
            {canRedeem ? `REDEEM FOR ${coupon.pointsCost} POINTS` : "NOT ENOUGH POINTS"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
  },
  backBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "900" },
  headerSubtitle: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
  ticketTop: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingVertical: 34, paddingHorizontal: 24,
    alignItems: "center", overflow: "hidden", position: "relative",
  },
  ticketTopDecor1: {
    position: "absolute", width: 200, height: 200, borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)", top: -80, right: -60,
  },
  ticketTopDecor2: {
    position: "absolute", width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)", bottom: -40, left: -20,
  },
  ticketIconCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center", marginBottom: 16, zIndex: 1,
  },
  ticketTitle: { color: "#fff", fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 14, zIndex: 1 },
  pointsPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 999, zIndex: 1,
  },
  ticketPoints: { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 0.6 },
  dividerRow: { flexDirection: "row", alignItems: "center", height: 28 },
  notchLeft: { width: 28, height: 28, borderRadius: 14, marginLeft: -14 },
  notchRight: { width: 28, height: 28, borderRadius: 14, marginRight: -14 },
  dashedLine: { flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 4 },
  dash: { width: 6, height: 2, borderRadius: 1 },
  ticketBottom: { borderBottomLeftRadius: 24, borderBottomRightRadius: 24, padding: 24 },
  descTitle: { fontSize: 17, fontWeight: "800", marginBottom: 8 },
  descText: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  termsBox: { borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1 },
  termRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  termDot: { fontSize: 14, fontWeight: "900" },
  termText: { fontSize: 13, lineHeight: 18, flex: 1 },
  validRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  validLabel: { fontSize: 13 },
  validDate: { fontSize: 13, fontWeight: "700" },
  separator: { borderTopWidth: 1, borderStyle: "dashed", marginBottom: 20 },
  qrSection: { alignItems: "center", marginBottom: 20 },
  qrLabel: { fontSize: 12, fontWeight: "600", marginBottom: 12, letterSpacing: 0.5 },
  qrBox: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  qrNote: { fontSize: 11, letterSpacing: 0.5, textAlign: "center" },
  pointsRow: { flexDirection: "row", borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  pointsItem: { flex: 1, alignItems: "center", padding: 16 },
  pointsItemLabel: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
  pointsItemValue: { fontSize: 16, fontWeight: "800" },
  pointsDivider: { width: 1 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
  redeemBtn: { borderRadius: 16, paddingVertical: 18, alignItems: "center" },
  redeemBtnText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
});
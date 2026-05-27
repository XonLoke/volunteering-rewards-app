import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Svg, Rect } from "react-native-svg";

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

  const coupon = {
    title: params.title as string,
    description: params.description as string,
    pointsCost: Number(params.pointsCost),
    emoji: params.emoji as string,
    color: params.color as string,
    validUntil: params.validUntil as string,
    merchant: params.merchant as string,
    discount: params.discount as string,
    terms: JSON.parse(params.terms as string) as string[],
    userPoints: Number(params.userPoints),
  };

  const canRedeem = coupon.userPoints >= coupon.pointsCost;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backText, { color: theme.colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Coupon Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Ticket top */}
        <View style={[styles.ticketTop, { backgroundColor: coupon.color }]}>
          <View style={styles.ticketTopDecor1} />
          <View style={styles.ticketTopDecor2} />
          <Text style={styles.ticketEmoji}>{coupon.emoji}</Text>
          <Text style={styles.ticketDiscount}>{coupon.discount}</Text>
          <Text style={styles.ticketMerchant}>{coupon.merchant}</Text>
        </View>

        {/* Dashed divider with notches */}
        <View style={[styles.dividerRow, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.notchLeft, { backgroundColor: theme.colors.background }]} />
          <View style={styles.dashedLine}>
            {Array.from({ length: 18 }).map((_, i) => (
              <View key={i} style={[styles.dash, { backgroundColor: theme.colors.border }]} />
            ))}
          </View>
          <View style={[styles.notchRight, { backgroundColor: theme.colors.background }]} />
        </View>

        {/* Ticket bottom */}
        <View style={[styles.ticketBottom, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.descTitle, { color: theme.colors.text }]}>Get {coupon.discount} at your next visit</Text>
          <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>{coupon.description}</Text>

          <View style={[styles.termsBox, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
            {coupon.terms.map((term, i) => (
              <View key={i} style={styles.termRow}>
                <Text style={[styles.termDot, { color: coupon.color }]}>•</Text>
                <Text style={[styles.termText, { color: theme.colors.textSecondary }]}>{term}</Text>
              </View>
            ))}
          </View>

          <View style={styles.validRow}>
            <Text style={[styles.validLabel, { color: theme.colors.textSecondary }]}>Valid until</Text>
            <Text style={[styles.validDate, { color: theme.colors.text }]}>{coupon.validUntil}</Text>
          </View>

          <View style={[styles.separator, { borderColor: theme.colors.border }]} />

          <View style={styles.qrSection}>
            <Text style={[styles.qrLabel, { color: theme.colors.textSecondary }]}>Scan to redeem</Text>
            <View style={[styles.qrBox, { backgroundColor: "#fff", borderColor: theme.colors.border }]}>
              <QRPlaceholder color={coupon.color} />
            </View>
            <Text style={[styles.qrCode, { color: theme.colors.textTertiary }]}>VR-2026-XXXX</Text>
          </View>

          <View style={[styles.pointsRow, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
            <View style={styles.pointsItem}>
              <Text style={[styles.pointsItemLabel, { color: theme.colors.textSecondary }]}>Points Required</Text>
              <Text style={[styles.pointsItemValue, { color: coupon.color }]}>{coupon.pointsCost} pts</Text>
            </View>
            <View style={[styles.pointsDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.pointsItem}>
              <Text style={[styles.pointsItemLabel, { color: theme.colors.textSecondary }]}>Your Balance</Text>
              <Text style={[styles.pointsItemValue, { color: theme.colors.text }]}>{coupon.userPoints} pts</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Redeem button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.redeemBtn, { backgroundColor: canRedeem ? coupon.color : theme.colors.border }]}
          disabled={!canRedeem}
          activeOpacity={0.85}
          onPress={() => router.push({
            pathname: "/redeem-confirmation",
            params: {
              title: coupon.title,
              description: coupon.description,
              pointsCost: coupon.pointsCost.toString(),
              currentBalance: coupon.userPoints.toString(),
            },
          })}
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  backText: { fontSize: 18, fontWeight: "700" },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
  ticketTop: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingVertical: 36, alignItems: "center", overflow: "hidden", position: "relative" },
  ticketTopDecor1: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.1)", top: -80, right: -60 },
  ticketTopDecor2: { position: "absolute", width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.08)", bottom: -40, left: -20 },
  ticketEmoji: { fontSize: 48, marginBottom: 8, zIndex: 1 },
  ticketDiscount: { color: "#fff", fontSize: 36, fontWeight: "900", zIndex: 1 },
  ticketMerchant: { color: "rgba(255,255,255,0.85)", fontSize: 16, fontWeight: "600", marginTop: 4, zIndex: 1 },
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
  qrCode: { fontSize: 11, letterSpacing: 2 },
  pointsRow: { flexDirection: "row", borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  pointsItem: { flex: 1, alignItems: "center", padding: 16 },
  pointsItemLabel: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
  pointsItemValue: { fontSize: 16, fontWeight: "800" },
  pointsDivider: { width: 1 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
  redeemBtn: { borderRadius: 16, paddingVertical: 18, alignItems: "center" },
  redeemBtnText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
});
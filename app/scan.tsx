import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg";

interface User {
  id: number;
  name?: string;
  email?: string;
  points?: number;
  volunteer_qr_code?: string;
  volunteerQrCode?: string;
  qr_code?: string;
}

export default function Scan() {
  const router = useRouter();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    loadVolunteerQR();
  }, []);

  const initials = useMemo(() => {
    const name = user?.name || "Volunteer";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  const loadVolunteerQR = async () => {
    try {
      setLoading(true);

      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        Alert.alert("Login required", "Please login again.");
        router.replace("/login");
        return;
      }

      const parsedUser: User = JSON.parse(storedUser);

      const volunteerQrCode =
        parsedUser.volunteer_qr_code ||
        parsedUser.volunteerQrCode ||
        parsedUser.qr_code ||
        `VOL-${parsedUser.id}`;

      setUser(parsedUser);
      setQrValue(volunteerQrCode);
    } catch (err) {
      console.error("Failed to load volunteer QR:", err);
      Alert.alert("Error", "Failed to load your QR code.");
    } finally {
      setLoading(false);
    }
  };

  const goToSuccessDemo = () => {
    router.push({
      pathname: "/scan-success",
      params: {
        eventName: "Demo Volunteer Event",
        pointsEarned: "50",
        totalPoints: String((user?.points ?? 0) + 50),
      },
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.iconButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerMini, { color: theme.colors.textSecondary }]}>
            Attendance Pass
          </Text>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            My QR Code
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/scan-history" as any)}
          style={[
            styles.iconButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          activeOpacity={0.85}
        >
          <Ionicons name="time-outline" size={21} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
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
            Preparing your pass
          </Text>

          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Getting your personal volunteer QR code ready.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.page}
        >
          <View
            style={[
              styles.passCard,
              {
                backgroundColor: theme.colors.primary,
              },
            ]}
          >
            <View style={styles.passDecorOne} />
            <View style={styles.passDecorTwo} />

            <View style={styles.passTop}>
              <View>
                <Text style={styles.passLabel}>VOLUNTEER PASS</Text>
                <Text style={styles.passName} numberOfLines={1}>
                  {user?.name || "Volunteer"}
                </Text>
                <Text style={styles.passEmail} numberOfLines={1}>
                  {user?.email || "Ready for attendance"}
                </Text>
              </View>

              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>

            <View style={styles.passStatsRow}>
              <View style={styles.passStatBox}>
                <Text style={styles.passStatValue}>{user?.points ?? 0}</Text>
                <Text style={styles.passStatLabel}>Points</Text>
              </View>

              <View style={styles.passStatDivider} />

              <View style={styles.passStatBox}>
                <Text style={styles.passStatValue}>Active</Text>
                <Text style={styles.passStatLabel}>Status</Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.qrCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.qrTopRow}>
              <View
                style={[
                  styles.readyPill,
                  { backgroundColor: theme.colors.primary + "18" },
                ]}
              >
                <View style={styles.liveDot} />
                <Text style={[styles.readyText, { color: theme.colors.primary }]}>
                  Ready to scan
                </Text>
              </View>

              <TouchableOpacity
                onPress={loadVolunteerQR}
                style={[
                  styles.smallRefreshButton,
                  { backgroundColor: theme.colors.background },
                ]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="refresh"
                  size={17}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.qrOuterFrame}>
              <View style={styles.qrInnerFrame}>
                {qrValue ? (
                  <QRCode
                    value={qrValue}
                    size={230}
                    backgroundColor="#ffffff"
                    color="#111827"
                  />
                ) : (
                  <View style={styles.noQrBox}>
                    <Ionicons name="qr-code-outline" size={76} color="#9ca3af" />
                    <Text style={styles.noQrText}>No QR code found</Text>
                  </View>
                )}
              </View>
            </View>

            <Text style={[styles.qrTitle, { color: theme.colors.text }]}>
              Volunteer Attendance QR
            </Text>

            <Text
              style={[styles.qrSubtitle, { color: theme.colors.textSecondary }]}
            >
              Show this to the organiser after the event. Once scanned, your
              attendance will be confirmed and points will be awarded.
            </Text>

            <View
              style={[
                styles.qrIdBox,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View>
                <Text
                  style={[
                    styles.qrIdLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  QR ID
                </Text>
                <Text
                  style={[styles.qrIdValue, { color: theme.colors.text }]}
                  numberOfLines={1}
                >
                  {qrValue || "Not available"}
                </Text>
              </View>

              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={theme.colors.primary}
              />
            </View>
          </View>

          <View style={styles.actionGrid}>
            <TouchableOpacity
              onPress={loadVolunteerQR}
              style={[
                styles.actionCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              activeOpacity={0.86}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: theme.colors.primary + "18" },
                ]}
              >
                <Ionicons
                  name="refresh-outline"
                  size={23}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                Refresh
              </Text>
              <Text
                style={[
                  styles.actionSub,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Reload QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/scan-history" as any)}
              style={[
                styles.actionCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              activeOpacity={0.86}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: "#f59e0b22" },
                ]}
              >
                <Ionicons name="time-outline" size={23} color="#f59e0b" />
              </View>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                History
              </Text>
              <Text
                style={[
                  styles.actionSub,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Past scans
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={goToSuccessDemo}
            style={[
              styles.mainButton,
              { backgroundColor: theme.colors.primary },
            ]}
            activeOpacity={0.86}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.mainButtonText}>Demo Scan Success</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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

  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 17,
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
    letterSpacing: 0.9,
    marginBottom: 2,
  },

  headerTitle: {
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  page: {
    paddingHorizontal: 20,
    paddingBottom: 34,
  },

  passCard: {
    borderRadius: 34,
    padding: 23,
    marginTop: 8,
    marginBottom: 18,
    overflow: "hidden",
    position: "relative",
  },

  passDecorOne: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.09)",
    top: -80,
    right: -60,
  },

  passDecorTwo: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -45,
    left: 20,
  },

  passTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    zIndex: 1,
  },

  passLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 8,
  },

  passName: {
    color: "#fff",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.7,
    maxWidth: 220,
  },

  passEmail: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 5,
    maxWidth: 230,
  },

  avatarCircle: {
    width: 62,
    height: 62,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },

  passStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 22,
    paddingVertical: 15,
    zIndex: 1,
  },

  passStatBox: {
    flex: 1,
    alignItems: "center",
  },

  passStatValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },

  passStatLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },

  passStatDivider: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  qrCard: {
    borderRadius: 34,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
  },

  qrTopRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  readyPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 8,
  },

  readyText: {
    fontSize: 12,
    fontWeight: "900",
  },

  smallRefreshButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  qrOuterFrame: {
    backgroundColor: "#f8fafc",
    borderRadius: 34,
    padding: 12,
    marginBottom: 18,
  },

  qrInnerFrame: {
    backgroundColor: "#ffffff",
    borderRadius: 26,
    padding: 18,
    minWidth: 270,
    minHeight: 270,
    alignItems: "center",
    justifyContent: "center",
  },

  noQrBox: {
    width: 230,
    height: 230,
    alignItems: "center",
    justifyContent: "center",
  },

  noQrText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 10,
  },

  qrTitle: {
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 7,
    textAlign: "center",
    letterSpacing: -0.3,
  },

  qrSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 5,
  },

  qrIdBox: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  qrIdLabel: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },

  qrIdValue: {
    fontSize: 13,
    fontWeight: "800",
    maxWidth: 230,
  },

  actionGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },

  actionCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },

  actionIconBox: {
    width: 47,
    height: 47,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 3,
  },

  actionSub: {
    fontSize: 12,
    fontWeight: "700",
  },

  mainButton: {
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  mainButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },

  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },
});
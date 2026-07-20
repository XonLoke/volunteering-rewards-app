import { useEffect, useMemo, useRef, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authFetch } from "./api";
import QRCode from "react-native-qrcode-svg";

import { useTheme } from "@/contexts/ThemeContext";

interface User {
  id: number;
  name?: string;
  email?: string;
  points?: number;
  volunteer_qr_code?: string;
  volunteerQrCode?: string;
  qr_code?: string;
}

interface AttendanceResult {
  success?: boolean;
  found?: boolean;
  message?: string;

  attendance?: {
    id?: number;

    eventId?: number;
    event_id?: number;

    eventName?: string;
    event_name?: string;

    location?: string;

    pointsEarned?: number;
    points_earned?: number;
    pointsAwarded?: number;
    points_awarded?: number;

    totalPoints?: number;
    total_points?: number;

    scannedAt?: string;
    scanned_at?: string;
  };
}

const QR_PREFIX = "VR_VOLUNTEER:";

const API_BASE_URL = "https://vol-rewards-api.onrender.com/api";

const POLLING_INTERVAL_MS = 6000; // ← was 2500, widened to reduce rate-limit risk

export default function Scan() {
  const router = useRouter();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Full value stored inside the QR code.
  const [qrValue, setQrValue] = useState("");

  // Database QR value displayed underneath.
  const [qrId, setQrId] = useState("");

  // Only detect attendance recorded after this screen is opened.
  const qrOpenedAtRef = useRef(new Date().toISOString());

  // Prevent duplicate navigation.
  const successOpenedRef = useRef(false);

  // Prevent overlapping backend requests.
  const pollingInProgressRef = useRef(false);

  useEffect(() => {
    loadVolunteerQR();
  }, []);

  /*
   * Silently check the backend every 6 seconds.
   *
   * When attendance is recorded, the volunteer phone
   * automatically navigates to /scan-success.
   */
  useEffect(() => {
    if (!user?.id || !qrValue) {
      return;
    }

    let screenIsActive = true;

    const checkLatestAttendance = async () => {
      if (
        !screenIsActive ||
        successOpenedRef.current ||
        pollingInProgressRef.current
      ) {
        return;
      }

      pollingInProgressRef.current = true;

      try {
        const after = encodeURIComponent(qrOpenedAtRef.current);
        const token = await AsyncStorage.getItem("token");

const response = await authFetch(
          `${API_BASE_URL}/attendance/volunteer/${user.id}/latest?after=${after}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );

        const responseText = await response.text();

        if (!responseText) {
          console.log(
            "Attendance endpoint returned an empty response.",
          );
          return;
        }

        let result: AttendanceResult;

        try {
          result = JSON.parse(responseText) as AttendanceResult;
        } catch {
          console.log(
            "Attendance endpoint returned invalid JSON:",
            responseText,
          );
          return;
        }

        if (!response.ok) {
          console.log(
            "Attendance polling error:",
            result.message || `HTTP ${response.status}`,
          );
          return;
        }

        if (
          !result.found ||
          !result.attendance ||
          successOpenedRef.current ||
          !screenIsActive
        ) {
          return;
        }

        successOpenedRef.current = true;

        const attendance = result.attendance;

        const eventId =
          attendance.eventId ??
          attendance.event_id ??
          0;

        const eventName =
          attendance.eventName ||
          attendance.event_name ||
          "Volunteer Event";

        const location =
          attendance.location ||
          "Attendance confirmed";

        const rawPointsEarned =
          attendance.pointsEarned ??
          attendance.points_earned ??
          attendance.pointsAwarded ??
          attendance.points_awarded ??
          0;

        const rawTotalPoints =
          attendance.totalPoints ??
          attendance.total_points ??
          0;

        const parsedPointsEarned = Number(rawPointsEarned);
        const parsedTotalPoints = Number(rawTotalPoints);

        const pointsEarned = Number.isFinite(
          parsedPointsEarned,
        )
          ? parsedPointsEarned
          : 0;

        const totalPoints = Number.isFinite(
          parsedTotalPoints,
        )
          ? parsedTotalPoints
          : 0;

        console.log(
          "Attendance confirmation received:",
          attendance,
        );

        router.replace({
          pathname: "/scan-success",
          params: {
            eventName,
            location,
            eventId: String(eventId),
            pointsEarned: String(pointsEarned),
            totalPoints: String(totalPoints),
          },
        } as any);
      } catch (error) {
        console.log(
          "Unable to check attendance status:",
          error,
        );
      } finally {
        pollingInProgressRef.current = false;
      }
    };

    checkLatestAttendance();

    const pollingTimer = setInterval(
      checkLatestAttendance,
      POLLING_INTERVAL_MS,
    );

    return () => {
      screenIsActive = false;
      clearInterval(pollingTimer);
    };
  }, [user?.id, qrValue, router]);

  const initials = useMemo(() => {
    const name = user?.name?.trim() || "Volunteer";

    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  const loadVolunteerQR = async () => {
    try {
      setLoading(true);
      setQrValue("");
      setQrId("");

      // Start a new attendance-checking session.
      qrOpenedAtRef.current = new Date().toISOString();
      successOpenedRef.current = false;
      pollingInProgressRef.current = false;

      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        Alert.alert(
          "Login required",
          "Your login session was not found. Please log in again.",
          [
            {
              text: "Go to login",
              onPress: () =>
                router.replace("/login" as any),
            },
          ],
        );

        return;
      }

      let parsedUser: User;

      try {
        parsedUser = JSON.parse(storedUser) as User;
      } catch (error) {
        console.error(
          "Unable to parse stored user:",
          error,
        );

        await AsyncStorage.removeItem("user");

        Alert.alert(
          "Session error",
          "Your saved login information is invalid. Please log in again.",
          [
            {
              text: "Go to login",
              onPress: () =>
                router.replace("/login" as any),
            },
          ],
        );

        return;
      }

      const volunteerId = Number(parsedUser.id);

      if (
        !Number.isInteger(volunteerId) ||
        volunteerId <= 0
      ) {
        setUser(parsedUser);

        Alert.alert(
          "Invalid account",
          "Your account does not contain a valid volunteer ID. Please log out and log in again.",
        );

        return;
      }

      const volunteerQrCode =
        parsedUser.volunteer_qr_code?.trim() ||
        parsedUser.volunteerQrCode?.trim() ||
        parsedUser.qr_code?.trim();

      setUser({
        ...parsedUser,
        id: volunteerId,
      });

      /*
       * Do not generate a fake QR fallback.
       * This value must come from PostgreSQL.
       */
      if (!volunteerQrCode) {
        Alert.alert(
          "QR code unavailable",
          "Your account does not have a volunteer QR code. Confirm that volunteer_qr_code exists in PostgreSQL, then log out and log in again.",
        );

        return;
      }

      /*
       * The organiser scanner expects:
       *
       * VR_VOLUNTEER:<volunteer_qr_code>
       */
      const encodedQrValue =
        `${QR_PREFIX}${volunteerQrCode}`;

      console.log(
        "Volunteer QR database value:",
        volunteerQrCode,
      );

      console.log(
        "Complete encoded QR value:",
        encodedQrValue,
      );

      setQrId(volunteerQrCode);
      setQrValue(encodedQrValue);
    } catch (error) {
      console.error(
        "Failed to load volunteer QR:",
        error,
      );

      Alert.alert(
        "Unable to load QR code",
        "Something went wrong while preparing your attendance QR code.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
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
          <Ionicons
            name="chevron-back"
            size={22}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text
            style={[
              styles.headerMini,
              {
                color: theme.colors.textSecondary,
              },
            ]}
          >
            Attendance Pass
          </Text>

          <Text
            style={[
              styles.headerTitle,
              {
                color: theme.colors.text,
              },
            ]}
          >
            My QR Code
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            router.push("/scan-history" as any)
          }
          style={[
            styles.iconButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          activeOpacity={0.85}
        >
          <Ionicons
            name="time-outline"
            size={21}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <View
            style={[
              styles.loadingIconBox,
              {
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
            />
          </View>

          <Text
            style={[
              styles.loadingTitle,
              {
                color: theme.colors.text,
              },
            ]}
          >
            Preparing your pass
          </Text>

          <Text
            style={[
              styles.loadingText,
              {
                color: theme.colors.textSecondary,
              },
            ]}
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
              <View style={styles.passUserDetails}>
                <Text style={styles.passLabel}>
                  VOLUNTEER PASS
                </Text>

                <Text
                  style={styles.passName}
                  numberOfLines={1}
                >
                  {user?.name || "Volunteer"}
                </Text>

                <Text
                  style={styles.passEmail}
                  numberOfLines={1}
                >
                  {user?.email || "Ready for attendance"}
                </Text>
              </View>

              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {initials}
                </Text>
              </View>
            </View>

            <View style={styles.passStatsRow}>
              <View style={styles.passStatBox}>
                <Text style={styles.passStatValue}>
                  {user?.points ?? 0}
                </Text>

                <Text style={styles.passStatLabel}>
                  Points
                </Text>
              </View>

              <View style={styles.passStatDivider} />

              <View style={styles.passStatBox}>
                <Text style={styles.passStatValue}>
                  {qrValue ? "Active" : "Unavailable"}
                </Text>

                <Text style={styles.passStatLabel}>
                  Status
                </Text>
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
                  {
                    backgroundColor: qrValue
                      ? theme.colors.primary + "18"
                      : "#ef444418",
                  },
                ]}
              >
                <View
                  style={[
                    styles.liveDot,
                    {
                      backgroundColor: qrValue
                        ? "#10b981"
                        : "#ef4444",
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.readyText,
                    {
                      color: qrValue
                        ? theme.colors.primary
                        : "#ef4444",
                    },
                  ]}
                >
                  {qrValue
                    ? "Ready to scan"
                    : "QR unavailable"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={loadVolunteerQR}
                style={[
                  styles.smallRefreshButton,
                  {
                    backgroundColor:
                      theme.colors.background,
                  },
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
                    quietZone={4}
                  />
                ) : (
                  <View style={styles.noQrBox}>
                    <Ionicons
                      name="qr-code-outline"
                      size={76}
                      color="#9ca3af"
                    />

                    <Text style={styles.noQrText}>
                      No QR code found
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Text
              style={[
                styles.qrTitle,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              Volunteer Attendance QR
            </Text>

            <Text
              style={[
                styles.qrSubtitle,
                {
                  color: theme.colors.textSecondary,
                },
              ]}
            >
              Show this QR code to the onsite controller
              after the event. Your attendance and reward
              points will be updated once the scan is
              confirmed.
            </Text>

            <View
              style={[
                styles.qrIdBox,
                {
                  backgroundColor:
                    theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.qrIdDetails}>
                <Text
                  style={[
                    styles.qrIdLabel,
                    {
                      color: theme.colors.textSecondary,
                    },
                  ]}
                >
                  Volunteer QR ID
                </Text>

                <Text
                  style={[
                    styles.qrIdValue,
                    {
                      color: theme.colors.text,
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {qrId || "Not available"}
                </Text>
              </View>

              <Ionicons
                name={
                  qrValue
                    ? "shield-checkmark-outline"
                    : "alert-circle-outline"
                }
                size={22}
                color={
                  qrValue
                    ? theme.colors.primary
                    : "#ef4444"
                }
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
                  {
                    backgroundColor:
                      theme.colors.primary + "18",
                  },
                ]}
              >
                <Ionicons
                  name="refresh-outline"
                  size={23}
                  color={theme.colors.primary}
                />
              </View>

              <Text
                style={[
                  styles.actionTitle,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                Refresh
              </Text>

              <Text
                style={[
                  styles.actionSub,
                  {
                    color: theme.colors.textSecondary,
                  },
                ]}
              >
                Reload QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push("/scan-history" as any)
              }
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
                  {
                    backgroundColor: "#f59e0b22",
                  },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={23}
                  color="#f59e0b"
                />
              </View>

              <Text
                style={[
                  styles.actionTitle,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                History
              </Text>

              <Text
                style={[
                  styles.actionSub,
                  {
                    color: theme.colors.textSecondary,
                  },
                ]}
              >
                Past scans
              </Text>
            </TouchableOpacity>
          </View>

          {!qrValue && (
            <View style={styles.warningCard}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#ef4444"
              />

              <Text style={styles.warningText}>
                Your saved account does not contain a
                volunteer QR code. Confirm that
                volunteer_qr_code exists in PostgreSQL,
                then log out and log in again.
              </Text>
            </View>
          )}
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

  passUserDetails: {
    flex: 1,
    paddingRight: 12,
  },

  passLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 8,
  },

  passName: {
    color: "#ffffff",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  passEmail: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 5,
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
    color: "#ffffff",
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
    color: "#ffffff",
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
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
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

  qrIdDetails: {
    flex: 1,
    paddingRight: 12,
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

  warningCard: {
    borderWidth: 1,
    borderColor: "#ef444440",
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ef444410",
  },

  warningText: {
    flex: 1,
    color: "#b91c1c",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginLeft: 10,
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
import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { api } from "../../src/services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCANNER_SIZE = Math.min(SCREEN_WIDTH - 60, 320);
const QR_PREFIX = "VR_VOLUNTEER:";

interface ScanResult {
  message: string;
  data?: {
    attendance_id: number;
    points_awarded: number;
  };
}

export default function Scanner() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId?: string }>();
  const eventId = Number(params.eventId) || 0;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
    points?: number;
  } | null>(null);
  const [torch, setTorch] = useState(false);

  const lastScannedRef = useRef("");
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Start scan line animation
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scanLineAnim]);

  const handleBarCodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (!scanning || processing) return;
      if (!eventId) {
        setResult({
          type: "error",
          message: "No event selected. Please go back and choose an event.",
        });
        return;
      }

      // Debounce: ignore same code within 5 seconds
      if (data === lastScannedRef.current) return;
      lastScannedRef.current = data;
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = setTimeout(() => {
        lastScannedRef.current = "";
      }, 5000);

      // Extract QR value — strip prefix if present
      let qrCodeValue = data;
      if (qrCodeValue.startsWith(QR_PREFIX)) {
        qrCodeValue = qrCodeValue.slice(QR_PREFIX.length);
      }

      setProcessing(true);
      setScanning(false);

      try {
        const response = await api.post<ScanResult>("/attendance/scan", {
          event_id: eventId,
          qr_code_value: qrCodeValue,
        });

        const points = response?.data?.points_awarded ?? 0;
        setResult({
          type: "success",
          message: response.message || "Check-in successful!",
          points,
        });
      } catch (error: any) {
        const msg =
          error?.message === "already_scanned"
            ? "This volunteer has already been checked in."
            : error?.message === "volunteer_not_found"
              ? "Volunteer not found. Please check the QR code."
              : error?.message === "not_registered"
                ? "This volunteer is not registered for this event."
                : error?.message || "Failed to record attendance. Please try again.";

        setResult({
          type: "error",
          message: msg,
        });

        // Auto-resume scanning after error
        setTimeout(() => {
          setResult(null);
          setScanning(true);
          setProcessing(false);
        }, 2500);
      } finally {
        setProcessing(false);
      }
    },
    [scanning, processing, eventId]
  );

  const handleRescan = useCallback(() => {
    setResult(null);
    setScanning(true);
    setProcessing(false);
    lastScannedRef.current = "";
  }, []);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#6A00E8" />
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <View style={styles.permissionIconBox}>
            <Ionicons name="camera-outline" size={48} color="#6A00E8" />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan volunteer QR codes for attendance
            check-in.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
            activeOpacity={0.85}
          >
            <Text style={styles.permissionButtonText}>Grant Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Scan QR Code</Text>

        <TouchableOpacity
          onPress={() => setTorch((prev) => !prev)}
          style={styles.headerButton}
          activeOpacity={0.85}
        >
          <Ionicons
            name={torch ? "flashlight" : "flashlight-outline"}
            size={22}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Camera */}
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={torch}
        onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        {/* Scanner frame overlay */}
        <View style={styles.overlay}>
          <View style={styles.maskTop} />
          <View style={styles.scannerRow}>
            <View style={styles.maskSide} />
            <View style={styles.scannerFrame}>
              {/* Corner indicators */}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />

              {/* Scanning line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, SCANNER_SIZE - 4],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
            <View style={styles.maskSide} />
          </View>
          <View style={styles.maskBottom}>
            <Text style={styles.instructionText}>
              Point the camera at a volunteer's QR code
            </Text>
          </View>
        </View>

        {/* Processing overlay */}
        {processing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.processingText}>Processing check-in...</Text>
          </View>
        )}

        {/* Result overlay */}
        {result && (
          <View style={styles.resultOverlay}>
            <View
              style={[
                styles.resultCard,
                result.type === "success"
                  ? styles.successCard
                  : styles.errorCard,
              ]}
            >
              <View
                style={[
                  styles.resultIconBox,
                  result.type === "success"
                    ? styles.successIconBox
                    : styles.errorIconBox,
                ]}
              >
                <Ionicons
                  name={
                    result.type === "success"
                      ? "checkmark-circle"
                      : "alert-circle"
                  }
                  size={56}
                  color={result.type === "success" ? "#16A34A" : "#EF4444"}
                />
              </View>

              <Text
                style={[
                  styles.resultTitle,
                  {
                    color:
                      result.type === "success" ? "#16A34A" : "#EF4444",
                  },
                ]}
              >
                {result.type === "success"
                  ? "Check-in Complete!"
                  : "Scan Failed"}
              </Text>

              <Text style={styles.resultMessage}>{result.message}</Text>

              {result.type === "success" && result.points && result.points > 0 && (
                <View style={styles.pointsBadge}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={styles.pointsText}>
                    +{result.points} points awarded
                  </Text>
                </View>
              )}

              <View style={styles.resultButtons}>
                <TouchableOpacity
                  style={styles.resultPrimaryButton}
                  onPress={handleRescan}
                  activeOpacity={0.86}
                >
                  <Ionicons name="scan-outline" size={18} color="#fff" />
                  <Text style={styles.resultPrimaryText}>Scan Next</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resultSecondaryButton}
                  onPress={() => router.back()}
                  activeOpacity={0.86}
                >
                  <Text style={styles.resultSecondaryText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </CameraView>

      {/* Bottom info bar */}
      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={16} color="#aaa" />
        <Text style={styles.footerText}>
          {eventId
            ? `Scanning for Event #${eventId}`
            : "No event selected — scans will not be recorded"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: "700",
    color: "#555",
  },
  // ── Permission UI ──
  permissionIconBox: {
    width: 88,
    height: 88,
    borderRadius: 30,
    backgroundColor: "#EFE7FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111",
    marginBottom: 10,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: "#6A00E8",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.3,
  },
  // ── Camera ──
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
  },
  maskTop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scannerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  maskSide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scannerFrame: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#6A00E8",
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 6,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 6,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 6,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 6,
  },
  scanLine: {
    width: SCANNER_SIZE - 32,
    height: 4,
    backgroundColor: "#6A00E8",
    borderRadius: 2,
    opacity: 0.9,
  },
  maskBottom: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  instructionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginTop: -20,
    opacity: 0.9,
  },
  // ── Processing overlay ──
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  processingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 14,
  },
  // ── Result overlay ──
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  resultCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  successCard: {
    borderWidth: 1,
    borderColor: "#16A34A30",
  },
  errorCard: {
    borderWidth: 1,
    borderColor: "#EF444430",
  },
  resultIconBox: {
    width: 84,
    height: 84,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successIconBox: {
    backgroundColor: "#16A34A18",
  },
  errorIconBox: {
    backgroundColor: "#EF444418",
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  resultMessage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B18",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 6,
    marginBottom: 20,
  },
  pointsText: {
    color: "#92400E",
    fontSize: 13,
    fontWeight: "900",
  },
  resultButtons: {
    width: "100%",
    gap: 10,
  },
  resultPrimaryButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "#6A00E8",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  resultPrimaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
  resultSecondaryButton: {
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  resultSecondaryText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "800",
  },
  // ── Footer ──
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#111",
    gap: 6,
  },
  footerText: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "700",
  },
});

import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.72.201:3000/api";

const CORNER_SIZE = 28;
const CORNER_THICKNESS = 4;
const CORNER_COLOR = "#ffffff";

function CornerFrame() {
  return (
    <>
      <View style={[styles.corner, styles.cornerTL]}>
        <View style={[styles.cornerH, { backgroundColor: CORNER_COLOR }]} />
        <View style={[styles.cornerV, { backgroundColor: CORNER_COLOR }]} />
      </View>

      <View style={[styles.corner, styles.cornerTR]}>
        <View
          style={[
            styles.cornerH,
            { backgroundColor: CORNER_COLOR, left: "auto", right: 0 },
          ]}
        />
        <View
          style={[
            styles.cornerV,
            { backgroundColor: CORNER_COLOR, left: "auto", right: 0 },
          ]}
        />
      </View>

      <View style={[styles.corner, styles.cornerBL]}>
        <View
          style={[
            styles.cornerH,
            { backgroundColor: CORNER_COLOR, top: "auto", bottom: 0 },
          ]}
        />
        <View style={[styles.cornerV, { backgroundColor: CORNER_COLOR }]} />
      </View>

      <View style={[styles.corner, styles.cornerBR]}>
        <View
          style={[
            styles.cornerH,
            {
              backgroundColor: CORNER_COLOR,
              top: "auto",
              bottom: 0,
              left: "auto",
              right: 0,
            },
          ]}
        />
        <View
          style={[
            styles.cornerV,
            { backgroundColor: CORNER_COLOR, left: "auto", right: 0 },
          ]}
        />
      </View>
    </>
  );
}

export default function Scan() {
  const router = useRouter();
  const { theme } = useTheme();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [torch, setTorch] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const extractEventId = (data: string) => {
    try {
      const parsed = JSON.parse(data);

      if (parsed.eventId) return Number(parsed.eventId);
      if (parsed.event_id) return Number(parsed.event_id);
      if (parsed.id) return Number(parsed.id);
    } catch {
      // QR is not JSON, continue below
    }

    const directNumber = Number(data);

    if (!Number.isNaN(directNumber)) {
      return directNumber;
    }

    const match =
      data.match(/eventId=(\d+)/i) || data.match(/event_id=(\d+)/i);

    if (match) {
      return Number(match[1]);
    }

    return null;
  };

  const submitScanToBackend = async (qrData: string) => {
    if (submitting) return;

    const eventId = extractEventId(qrData);

    if (!eventId) {
      Alert.alert(
        "Invalid QR Code",
        "This QR code does not contain a valid event ID."
      );
      setScanned(false);
      setScannedData(null);
      return;
    }

    setSubmitting(true);

    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        Alert.alert("Login required", "Please login again.");
        router.replace("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      const response = await fetch(`${BASE_URL}/attendance/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          volunteerId: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (
          result.message === "already_scanned" ||
          result.error?.message === "already_scanned"
        ) {
          throw new Error("You have already scanned this event.");
        }

        throw new Error(
          result.message || result.error?.message || "Failed to submit scan."
        );
      }

      const updatedUser = {
        ...user,
        points: result.totalPoints ?? user.points ?? 0,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      await AsyncStorage.setItem(
        "userPoints",
        String(result.totalPoints ?? user.points ?? 0)
      );

      router.replace({
        pathname: "/scan-success",
        params: {
          eventName: result.eventName ?? "Volunteer Event",
          pointsEarned: String(result.pointsEarned ?? 0),
          totalPoints: String(result.totalPoints ?? user.points ?? 0),
        },
      });
    } catch (err: any) {
      Alert.alert("Scan failed", err.message || "Something went wrong.");
      setScanned(false);
      setScannedData(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setScannedData(data);
    submitScanToBackend(data);
  };

  const openPhotoLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Photo library access is needed to scan QR codes from images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      base64: true,
    });

    if (result.canceled || !result.assets.length) return;

    const asset = result.assets[0];
    setDecoding(true);

    try {
      const base64 = asset.base64;

      if (!base64) {
        Alert.alert("Error", "Could not read image data. Please try again.");
        return;
      }

      const jsQR = (await import("jsqr")).default;
      const response = await fetch(`data:image/jpeg;base64,${base64}`);
      const blob = await response.blob();

      if (typeof createImageBitmap !== "undefined") {
        const bitmap = await createImageBitmap(blob);
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext("2d")!;

        ctx.drawImage(bitmap, 0, 0);

        const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setScanned(true);
          setScannedData(code.data);
          submitScanToBackend(code.data);
        } else {
          Alert.alert(
            "No QR found",
            "No QR code found. Try a clearer or better-lit photo."
          );
        }
      } else {
        Alert.alert(
          "Not supported",
          "Your device does not support QR decoding from images. Please use the camera to scan instead."
        );
      }
    } catch (err) {
      console.error("QR decode error:", err);
      Alert.alert("Error", "Failed to decode the image. Please try again.");
    } finally {
      setDecoding(false);
    }
  };

  const resetScan = () => {
    setScanned(false);
    setScannedData(null);
  };

  const submitDemoScan = async () => {
    setScanned(true);
    setScannedData("Demo eventId: 1");
    await submitScanToBackend("1");
  };

  const skipToSuccessUIOnly = () => {
    router.push({
      pathname: "/scan-success",
      params: {
        eventName: "Demo Volunteer Event",
        pointsEarned: "50",
        totalPoints: "2500",
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
            styles.backButton,
            { backgroundColor: theme.colors.surfaceSecondary },
          ]}
        >
          <Text style={[styles.backText, { color: theme.colors.primaryLight }]}>
            Back
          </Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          QR Scanner
        </Text>

        <View style={styles.spacer} />
      </View>

      {!permission ? (
        <View
          style={[styles.messageBox, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.messageText, { color: theme.colors.text }]}>
            Requesting camera permission...
          </Text>
        </View>
      ) : !permission.granted ? (
        <View
          style={[styles.messageBox, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.messageText, { color: theme.colors.text }]}>
            Camera access is needed to scan QR codes.
          </Text>

          <TouchableOpacity
            onPress={requestPermission}
            style={[
              styles.retryButton,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={[styles.retryText, { color: "#fff" }]}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text
            style={[styles.frameHint, { color: theme.colors.textSecondary }]}
          >
            Position QR code within frame
          </Text>

          <View style={styles.scannerContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              enableTorch={torch}
              onBarcodeScanned={
                scanned || submitting ? undefined : handleBarCodeScanned
              }
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            />

            <View style={styles.overlayTop} />
            <View style={styles.overlayBottom} />
            <View style={styles.overlayLeft} />
            <View style={styles.overlayRight} />

            <View style={styles.qrFrame}>
              <CornerFrame />
              <Text style={styles.qrAreaLabel}>QR Code Area</Text>
            </View>

            <View
              style={[
                styles.hintBox,
                { backgroundColor: "rgba(0,0,0,0.45)" },
              ]}
            >
              <Text style={[styles.hintTitle, { color: "#fff" }]}>
                {submitting
                  ? "Submitting scan..."
                  : scanned
                  ? "Scan complete"
                  : "Align QR code in the frame"}
              </Text>

              <Text style={[styles.hintSub, { color: "#e5e7eb" }]}>
                {submitting
                  ? "Please wait"
                  : scanned
                  ? "Processing your points"
                  : "Camera will scan automatically"}
              </Text>
            </View>

            {submitting && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color="#fff" size="large" />
              </View>
            )}

            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={[
                  styles.controlBtn,
                  {
                    backgroundColor: torch
                      ? theme.colors.primary
                      : theme.colors.surfaceSecondary,
                  },
                ]}
                onPress={() => setTorch((t) => !t)}
                disabled={submitting}
              >
                <Ionicons
                  name={torch ? "flashlight" : "flashlight-outline"}
                  size={22}
                  color={theme.colors.text}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.controlBtn,
                  { backgroundColor: theme.colors.surfaceSecondary },
                ]}
                onPress={openPhotoLibrary}
                disabled={decoding || submitting}
              >
                {decoding ? (
                  <ActivityIndicator color={theme.colors.primary} size="small" />
                ) : (
                  <Ionicons
                    name="image-outline"
                    size={22}
                    color={theme.colors.text}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {scannedData ? (
        <View
          style={[
            styles.resultBox,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[styles.resultLabel, { color: theme.colors.textSecondary }]}
          >
            Scanned data
          </Text>

          <Text style={[styles.resultText, { color: theme.colors.text }]}>
            {scannedData}
          </Text>

          <TouchableOpacity
            onPress={resetScan}
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.primary },
            ]}
            disabled={submitting}
          >
            <Text style={[styles.actionButtonText, { color: "#fff" }]}>
              Scan again
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* DEV ONLY - real backend demo scan */}
      <TouchableOpacity
        style={[
          styles.devButton,
          { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
        ]}
        onPress={submitDemoScan}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={[styles.devButtonText, { color: "#fff" }]}>
            Demo Scan Event 1 Backend
          </Text>
        )}
      </TouchableOpacity>

      {/* DEV ONLY - UI only skip */}
      <TouchableOpacity
        style={[
          styles.devButton,
          {
            backgroundColor: theme.colors.surfaceSecondary,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={skipToSuccessUIOnly}
        disabled={submitting}
      >
        <Text style={[styles.devButtonText, { color: theme.colors.text }]}>
          Skip to Success UI Only
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const OVERLAY_COLOR = "rgba(7,9,19,0.62)";
const QR_BOX = 220;

const styles = StyleSheet.create({
  container: {
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
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  spacer: {
    width: 56,
  },
  frameHint: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "500",
  },
  scannerContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "25%",
    backgroundColor: OVERLAY_COLOR,
  },
  overlayBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "28%",
    backgroundColor: OVERLAY_COLOR,
  },
  overlayLeft: {
    position: "absolute",
    top: "25%",
    bottom: "28%",
    left: 0,
    width: "10%",
    backgroundColor: OVERLAY_COLOR,
  },
  overlayRight: {
    position: "absolute",
    top: "25%",
    bottom: "28%",
    right: 0,
    width: "10%",
    backgroundColor: OVERLAY_COLOR,
  },
  qrFrame: {
    width: QR_BOX,
    height: QR_BOX,
    alignItems: "center",
    justifyContent: "center",
  },
  qrAreaLabel: {
    fontSize: 13,
    color: "#ffffff",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  cornerTL: {
    top: 0,
    left: 0,
  },
  cornerTR: {
    top: 0,
    right: 0,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
  },
  cornerH: {
    position: "absolute",
    height: CORNER_THICKNESS,
    left: 0,
    right: 0,
    top: 0,
    borderRadius: 2,
  },
  cornerV: {
    position: "absolute",
    width: CORNER_THICKNESS,
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 2,
  },
  hintBox: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
  },
  hintTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  hintSub: {
    fontSize: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraControls: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    gap: 16,
  },
  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 18,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 18,
  },
  retryText: {
    fontWeight: "700",
  },
  resultBox: {
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  resultLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  devButton: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  devButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
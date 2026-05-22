import { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

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
        <View style={[styles.cornerH, { backgroundColor: CORNER_COLOR, left: "auto", right: 0 }]} />
        <View style={[styles.cornerV, { backgroundColor: CORNER_COLOR, left: "auto", right: 0 }]} />
      </View>
      <View style={[styles.corner, styles.cornerBL]}>
        <View style={[styles.cornerH, { backgroundColor: CORNER_COLOR, top: "auto", bottom: 0 }]} />
        <View style={[styles.cornerV, { backgroundColor: CORNER_COLOR }]} />
      </View>
      <View style={[styles.corner, styles.cornerBR]}>
        <View style={[styles.cornerH, { backgroundColor: CORNER_COLOR, top: "auto", bottom: 0, left: "auto", right: 0 }]} />
        <View style={[styles.cornerV, { backgroundColor: CORNER_COLOR, left: "auto", right: 0 }]} />
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

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setScannedData(data);
  };

  const openPhotoLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Photo library access is needed to scan QR codes from images.");
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
      // Use the base64 data directly with jsQR via a canvas in a web context
      // Since Hermes doesn't support canvas, we decode using fetch + Image API workaround
      const base64 = asset.base64;
      if (!base64) {
        alert("Could not read image data. Please try again.");
        return;
      }

      // Dynamically load jsQR
      const jsQR = (await import("jsqr")).default;

      // Create an Image element to get pixel data
      // This works because Expo uses a JS engine that supports Image via react-native
      // We'll use a fetch-based approach to convert base64 → ImageData
      const response = await fetch(`data:image/jpeg;base64,${base64}`);
      const blob = await response.blob();

      // Use createImageBitmap if available (works in some RN environments)
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
        } else {
          alert("No QR code found. Try a clearer or better-lit photo.");
        }
      } else {
        // Fallback: inform user this device doesn't support image QR decoding
        alert("Your device doesn't support QR decoding from images. Please use the camera to scan instead.");
      }
    } catch (err) {
      console.error("QR decode error:", err);
      alert("Failed to decode the image. Please try again.");
    } finally {
      setDecoding(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <Text style={[styles.backText, { color: theme.colors.primaryLight }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>QR Scanner</Text>
        <View style={styles.spacer} />
      </View>

      {!permission ? (
        <View style={[styles.messageBox, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.messageText, { color: theme.colors.text }]}>Requesting camera permission...</Text>
        </View>
      ) : !permission.granted ? (
        <View style={[styles.messageBox, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.messageText, { color: theme.colors.text }]}>Camera access is needed to scan QR codes.</Text>
          <TouchableOpacity onPress={requestPermission} style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.retryText, { color: theme.colors.text }]}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={[styles.frameHint, { color: theme.colors.textSecondary }]}>Position QR code within frame</Text>

          <View style={styles.scannerContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              enableTorch={torch}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
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

            <View style={styles.hintBox}>
              <Text style={[styles.hintTitle, { color: theme.colors.text }]}>
                {scanned ? "Scan complete ✓" : "Align QR code in the frame"}
              </Text>
              <Text style={[styles.hintSub, { color: theme.colors.textSecondary }]}>
                {scanned ? "Tap 'Scan again' to continue" : "Camera will scan automatically"}
              </Text>
            </View>

            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={[styles.controlBtn, torch && [styles.controlBtnActive, { backgroundColor: theme.colors.primary }], { backgroundColor: theme.colors.surfaceSecondary }]}
                onPress={() => setTorch((t) => !t)}
              >
                <Text style={[styles.controlIcon, { color: theme.colors.text }]}>💡</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
                onPress={openPhotoLibrary}
                disabled={decoding}
              >
                {decoding ? (
                  <ActivityIndicator color={theme.colors.primary} size="small" />
                ) : (
                  <Text style={[styles.controlIcon, { color: theme.colors.text }]}>🖼️</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {scannedData ? (
        <View style={[styles.resultBox, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>Scanned data</Text>
          <Text style={[styles.resultText, { color: theme.colors.text }]}>{scannedData}</Text>
          <TouchableOpacity
            onPress={() => { setScanned(false); setScannedData(null); }}
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Scan again</Text>
          </TouchableOpacity>
        </View>
      ) : null}

    {/* DEV ONLY - remove before submission */}
      <TouchableOpacity
        style={[styles.devButton, { backgroundColor: theme.colors.surfaceSecondary }]}
        onPress={() => router.push("/scan-success")}
      >
        <Text style={[styles.devButtonText, { color: theme.colors.text }]}>Skip to Success</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const OVERLAY_COLOR = "rgba(7,9,19,0.62)";
const QR_BOX = 220;

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  backText: { fontSize: 14, fontWeight: "600" },
  title: { fontSize: 22, fontWeight: "800" },
  spacer: { width: 56 },
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
  overlayTop: { position: "absolute", top: 0, left: 0, right: 0, height: "25%", backgroundColor: OVERLAY_COLOR },
  overlayBottom: { position: "absolute", bottom: 0, left: 0, right: 0, height: "28%", backgroundColor: OVERLAY_COLOR },
  overlayLeft: { position: "absolute", top: "25%", bottom: "28%", left: 0, width: "10%", backgroundColor: OVERLAY_COLOR },
  overlayRight: { position: "absolute", top: "25%", bottom: "28%", right: 0, width: "10%", backgroundColor: OVERLAY_COLOR },
  qrFrame: { width: QR_BOX, height: QR_BOX, alignItems: "center", justifyContent: "center" },
  qrAreaLabel: { fontSize: 13 },
  corner: { position: "absolute", width: CORNER_SIZE, height: CORNER_SIZE },
  cornerTL: { top: 0, left: 0 },
  cornerTR: { top: 0, right: 0 },
  cornerBL: { bottom: 0, left: 0 },
  cornerBR: { bottom: 0, right: 0 },
  cornerH: { position: "absolute", height: CORNER_THICKNESS, left: 0, right: 0, top: 0, borderRadius: 2 },
  cornerV: { position: "absolute", width: CORNER_THICKNESS, top: 0, bottom: 0, left: 0, borderRadius: 2 },
  hintBox: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
  },
  hintTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  hintSub: { fontSize: 12 },
  cameraControls: { position: "absolute", bottom: 20, flexDirection: "row", gap: 16 },
  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  controlBtnActive: { },
  controlIcon: { fontSize: 22 },
  messageBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  messageText: { fontSize: 16, textAlign: "center", marginBottom: 18 },
  retryButton: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 18 },
  retryText: { fontWeight: "700" },
  resultBox: {
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  resultLabel: { fontSize: 13, marginBottom: 8 },
  resultText: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  actionButton: { borderRadius: 18, paddingVertical: 16, alignItems: "center" },
  actionButtonText: { fontSize: 15, fontWeight: "700" },


  devButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  devButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  
});
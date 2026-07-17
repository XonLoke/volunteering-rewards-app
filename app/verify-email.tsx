import { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "https://vol-rewards-api.onrender.com/api";

export default function VerifyEmail() {
  const router = useRouter();
  const { theme } = useTheme();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token. Please check your email link.");
      return;
    }

    verifyToken(token);
  }, [token]);

  const verifyToken = async (t: string) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/verify-email?token=${encodeURIComponent(t)}`);
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error?.message || data.message || "Verification failed.");
        return;
      }

      setStatus("success");
      setMessage(data.message || "Email verified successfully!");
    } catch (err: any) {
      setStatus("error");
      setMessage("Could not connect to the server. Please try again.");
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {status === "loading" && (
            <>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.title, { color: theme.colors.text, marginTop: 20 }]}>
                Verifying your email...
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Please wait a moment.
              </Text>
            </>
          )}

          {status === "success" && (
            <>
              <View style={[styles.iconCircle, { backgroundColor: "#10b98118" }]}>
                <Ionicons name="checkmark-circle" size={56} color="#10b981" />
              </View>
              <Text style={[styles.title, { color: theme.colors.text, marginTop: 16 }]}>
                Email Verified!
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {message}
              </Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.buttonText}>Sign In Now</Text>
              </TouchableOpacity>
            </>
          )}

          {status === "error" && (
            <>
              <View style={[styles.iconCircle, { backgroundColor: "#ef444418" }]}>
                <Ionicons name="alert-circle" size={56} color="#ef4444" />
              </View>
              <Text style={[styles.title, { color: theme.colors.text, marginTop: 16 }]}>
                Verification Failed
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {message}
              </Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.buttonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  card: { borderRadius: 24, padding: 32, borderWidth: 1, alignItems: "center" },
  iconCircle: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontWeight: "600", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  button: { width: "100%", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
});

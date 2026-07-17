import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "https://vol-rewards-api.onrender.com/api";

export default function ForgotPassword() {
  const router = useRouter();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Missing field", "Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Request failed.");
      }

      setSent(true);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {/* Back button */}
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
            </TouchableOpacity>

            {sent ? (
              // ── Success state ───────────────────────────
              <>
                <View style={styles.iconWrap}>
                  <Ionicons name="mail-outline" size={48} color={theme.colors.primary} />
                </View>

                <Text style={[styles.title, { color: theme.colors.text }]}>Check Your Email</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  If an account exists for{"\n"}
                  <Text style={{ fontWeight: "700" }}>{email}</Text>
                  {"\n\n"}
                  a password reset link has been sent. Please check your inbox and follow the instructions.
                </Text>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.colors.primary }]}
                  onPress={() => router.push("/login")}
                >
                  <Text style={styles.buttonText}>Back to Sign In</Text>
                </TouchableOpacity>
              </>
            ) : (
              // ── Email input state ───────────────────────
              <>
                <View style={styles.iconWrap}>
                  <Ionicons name="lock-closed-outline" size={40} color={theme.colors.primary} />
                </View>

                <Text style={[styles.title, { color: theme.colors.text }]}>Forgot Password?</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Enter your email address and we'll send you a link to reset your password.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email address</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="user@example.com"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.colors.primary, opacity: loading ? 0.7 : 1 }]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backLink}
                  onPress={() => router.push("/login")}
                >
                  <Ionicons name="chevron-back" size={16} color={theme.colors.primary} />
                  <Text style={[styles.backLinkText, { color: theme.colors.primary }]}> Back to Sign In</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  card: { borderRadius: 24, padding: 28, borderWidth: 1, alignItems: "center" },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, alignSelf: "flex-start", marginBottom: 16 },
  iconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 16, marginTop: 8 },
  title: { fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontWeight: "600", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  inputGroup: { width: "100%", marginBottom: 20 },
  label: { fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontWeight: "600" },
  button: { width: "100%", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginBottom: 16 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
  backLink: { flexDirection: "row", alignItems: "center", padding: 8 },
  backLinkText: { fontSize: 14, fontWeight: "600" },
});

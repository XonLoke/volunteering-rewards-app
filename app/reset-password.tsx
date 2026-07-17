import { useState, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "https://vol-rewards-api.onrender.com/api";

export default function ResetPassword() {
  const router = useRouter();
  const { theme } = useTheme();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (!token) {
      setInvalid(true);
    }
  }, [token]);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match", "Please make sure both passwords match.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters.");
      return;
    }
    if (!/(?=.*[A-Z])(?=.*\d)/.test(password)) {
      Alert.alert("Weak password", "Password must contain at least one uppercase letter and one number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, password_confirm: confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Reset failed.");
      }

      setSuccess(true);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (invalid) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerCard}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={[styles.title, { color: theme.colors.text }]}>Invalid Link</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              This password reset link is invalid or missing a token. Please request a new reset link.
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push("/forgot-password")}
            >
              <Text style={styles.buttonText}>Request New Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (success) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerCard}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#10b981" />
            <Text style={[styles.title, { color: theme.colors.text }]}>Password Reset!</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Your password has been reset successfully. You can now sign in with your new password.
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.buttonText}>Sign In Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.iconWrap}>
              <Ionicons name="key-outline" size={40} color={theme.colors.primary} />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>Set New Password</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Enter your new password below. Must be at least 8 characters with one uppercase letter and one number.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>New Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
                style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Confirm Password</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
                style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  centerCard: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  card: { borderRadius: 24, padding: 28, borderWidth: 1, alignItems: "center" },
  iconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 16, marginTop: 8 },
  title: { fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontWeight: "600", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  inputGroup: { width: "100%", marginBottom: 20 },
  label: { fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontWeight: "600" },
  button: { width: "100%", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginBottom: 16 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
});

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
import { useTheme } from "../contexts/ThemeContext";
import { api } from "../src/services/api";

export default function ResetPassword() {
  const router = useRouter();
  const { theme } = useTheme();
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [missingToken, setMissingToken] = useState(false);

  useEffect(() => {
    if (!token) {
      setMissingToken(true);
    }
  }, [token]);

  const handleReset = async () => {
    if (!token) return;

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
    if (!/[A-Z]/.test(password) || !/\d/.test(password)) {
      Alert.alert("Weak password", "Password must contain at least one uppercase letter and one number.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        password,
        password_confirm: confirmPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      Alert.alert("Reset failed", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <KeyboardAvoidingView
          style={styles.screen}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.container}>
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.iconWrap}>
                <Text style={styles.icon}>✅</Text>
              </View>
              <Text style={[styles.title, { color: theme.colors.text }]}>Password Reset!</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary, textAlign: "center" }]}>
                Your password has been reset successfully. You can now sign in.
              </Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.buttonText}>Sign In Now</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (missingToken) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>⚠️</Text>
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Invalid Link</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary, textAlign: "center" }]}>
              Missing reset token. Please request a new password reset link.
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push("/forgot-password")}
            >
              <Text style={styles.buttonText}>Request New Link</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
              <Text style={styles.icon}>🔑</Text>
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Set New Password</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Min. 8 characters with one uppercase letter and one number.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>New Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 8 chars, uppercase + number"
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

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                Remember your password?
              </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={[styles.signInText, { color: theme.colors.primary }]}> Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: 32,
    padding: 28,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  iconWrap: {
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 28 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  input: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 15,
  },
  button: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { fontSize: 14 },
  signInText: { fontSize: 14, fontWeight: "700" },
});

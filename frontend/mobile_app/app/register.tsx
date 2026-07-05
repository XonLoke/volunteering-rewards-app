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
import { api, setAuthToken } from "../src/services/api";
import { useTheme } from "../contexts/ThemeContext";



export default function Register() {
  const router = useRouter();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
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
      const data = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirm: confirmPassword,
      });

      // Registration succeeded — token is returned but we want user to sign in explicitly
      Alert.alert(
        "Account Created! 🎉",
        "Welcome to Volunteer Rewards! Please sign in.",
        [{ text: "Sign In Now!", onPress: () => router.push("/login") }]
      );
    } catch (err: any) {
      // Show more specific validation errors if available
      const details = (err as any)?.details;
      let message = err.message || "Something went wrong.";
      if (details && typeof details === "object") {
        const msgs = Object.values(details).filter(Boolean);
        if (msgs.length > 0) message = msgs.join("\n");
      }
      Alert.alert("Registration failed", message);
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
            <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Register to access your rewards dashboard
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Jane Doe"
                placeholderTextColor={theme.colors.textSecondary}
                style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="user@example.com"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Password</Text>
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
              style={[styles.registerButton, { backgroundColor: theme.colors.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>REGISTER</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                Already have an account?
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
  title: { fontSize: 32, fontWeight: "800", marginBottom: 12 },
  subtitle: { fontSize: 16, marginBottom: 28 },
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
  registerButton: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: "#fff",
  },
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { fontSize: 14 },
  signInText: { fontSize: 14, fontWeight: "700" },
});
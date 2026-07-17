import { useState } from "react";
import {
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
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://vol-rewards-api.onrender.com/api";

export default function Login() {
  const router = useRouter();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || "Login failed");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid login response from server.");
      }

      // Check role — only volunteers can access this app
      const role = (data.user.role || "").toLowerCase();
      if (role !== "volunteer") {
        throw new Error("Access denied. This app is for volunteers only.");
      }

      // Save token for backend requests
      await AsyncStorage.setItem("token", data.token);

      // Save full user object for profile/home
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      // Save points separately so Home can show it immediately
      await AsyncStorage.setItem("userPoints", String(data.user.points_balance ?? data.user.points ?? 0));

      // Save user id separately if other pages need it
      await AsyncStorage.setItem(
        "userId",
        String(data.user.id)
      );

      // Replace instead of push so user cannot go back to login screen
      router.replace("/home");
    } catch (err: any) {
      Alert.alert(
        "Login failed",
        err.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert("Forgot Password", "This will be available soon.");
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Welcome Back
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              Sign in to continue
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Email address
              </Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="user@example.com"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderColor: theme.colors.surfaceSecondary,
                  },
                ]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Password
              </Text>

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderColor: theme.colors.surfaceSecondary,
                  },
                ]}
              />
            </View>

            <TouchableOpacity
              style={styles.forgotButton}
              onPress={handleForgotPassword}
            >
              <Text
                style={[
                  styles.forgotText,
                  { color: theme.colors.primaryLight },
                ]}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.loginButtonText, { color: "#fff" }]}>
                  LOGIN
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text
                style={[
                  styles.footerText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Don&apos;t have an account?
              </Text>

              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text
                  style={[
                    styles.signUpText,
                    { color: theme.colors.primaryLight },
                  ]}
                >
                  {" "}
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
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
    shadowOffset: {
      width: 0,
      height: 16,
    },
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 15,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 14,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
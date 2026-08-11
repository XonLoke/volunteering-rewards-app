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

const BASE_URL = "https://vol-rewards-api.onrender.com/api";

export default function ForgotPassword() {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Missing email", "Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();
      console.log("Forgot password status:", response.status);
      console.log("Forgot password response:", JSON.stringify(data));

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || "Something went wrong.");
      }

      // Backend intentionally always returns the same generic message
      // regardless of whether the email exists (prevents enumeration),
      // so we just show it and flip to the "submitted" state.
      setSubmitted(true);
    } catch (err: any) {
      Alert.alert(
        "Request failed",
        err.message || "Could not send reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
              Forgot Password
            </Text>

            {submitted ? (
              <>
                <Text
                  style={[
                    styles.subtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  If an account with that email exists, a password reset
                  link has been sent. Check your inbox.
                </Text>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => router.replace("/login")}
                >
                  <Text style={[styles.loginButtonText, { color: "#fff" }]}>
                    BACK TO LOGIN
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text
                  style={[
                    styles.subtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Enter the email linked to your account and we&apos;ll
                  send you a reset link.
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

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    {
                      backgroundColor: theme.colors.primary,
                      opacity: loading ? 0.7 : 1,
                    },
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={[styles.loginButtonText, { color: "#fff" }]}>
                      SEND RESET LINK
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.footer}>
                  <TouchableOpacity onPress={() => router.back()}>
                    <Text
                      style={[
                        styles.signUpText,
                        { color: theme.colors.primaryLight },
                      ]}
                    >
                      Back to Login
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
    lineHeight: 22,
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
  signUpText: {
    fontSize: 14,
    fontWeight: "700",
  },
});

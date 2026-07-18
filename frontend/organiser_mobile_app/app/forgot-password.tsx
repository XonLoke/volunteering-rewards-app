import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiPost } from "../lib/api";

const FRONTEND_URL = process.env.EXPO_PUBLIC_FRONTEND_URL || "https://volunteering-rewards-app.vercel.app";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) {
      Alert.alert("Missing field", "Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await apiPost("/api/auth/forgot-password", {
        email: email.trim().toLowerCase(),
        redirect_url: `${FRONTEND_URL}/reset-password`,
      });
      setSent(true);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="mail-open-outline" size={70} color="#6A00E8" />
        </View>
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitleCenter}>
          If an account exists for{"\n"}
          <Text style={{ fontWeight: "800", color: "#111" }}>{email}</Text>
          {"\n"}a password reset link has been sent.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.buttonText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="lock-open-outline" size={70} color="#6A00E8" />

      <Text style={styles.logo}>VR Organizer</Text>
      <Text style={styles.sub}>Volunteer Reward App</Text>

      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.small}>
        Enter your email and we'll send you a reset link.
      </Text>

      <View style={styles.inputBox}>
        <Ionicons name="mail" size={18} color="#6A00E8" />
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
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
        style={styles.linkWrap}
        onPress={() => router.push("/")}
      >
        <Ionicons name="arrow-back" size={16} color="#6A00E8" />
        <Text style={styles.linkText}> Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconWrap: {
    marginBottom: 10,
  },
  logo: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4B00B5",
    marginTop: 10,
  },
  sub: {
    fontSize: 14,
    color: "#555",
    marginBottom: 35,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
    color: "#111",
  },
  subtitleCenter: {
    color: "#555",
    marginBottom: 30,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
  },
  small: {
    color: "#666",
    marginBottom: 25,
    textAlign: "center",
  },
  inputBox: {
    width: "100%",
    height: 52,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },
  input: {
    flex: 1,
    marginLeft: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#6A00E8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  linkWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  linkText: {
    color: "#6A00E8",
    fontSize: 14,
    fontWeight: "600",
  },
});

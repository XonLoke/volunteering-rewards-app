import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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

export default function ResetPassword() {
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

  async function handleReset() {
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

    try {
      setLoading(true);
      await apiPost("/api/auth/reset-password", {
        token,
        password,
        password_confirm: confirmPassword,
      });
      setSuccess(true);
    } catch (error: any) {
      Alert.alert("Reset failed", error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View style={styles.container}>
        <Ionicons name="checkmark-circle-outline" size={70} color="#22c55e" />
        <Text style={styles.title}>Password Reset!</Text>
        <Text style={styles.subtitleCenter}>
          Your password has been reset successfully. You can now sign in.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.buttonText}>Sign In Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (missingToken) {
    return (
      <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={70} color="#ef4444" />
        <Text style={styles.title}>Invalid Link</Text>
        <Text style={styles.subtitleCenter}>
          Missing reset token. Please request a new password reset link.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/forgot-password")}
        >
          <Text style={styles.buttonText}>Request New Link</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="key-outline" size={70} color="#6A00E8" />

      <Text style={styles.logo}>VR Organizer</Text>
      <Text style={styles.sub}>Volunteer Reward App</Text>

      <Text style={styles.title}>Set New Password</Text>
      <Text style={styles.small}>
        Min. 8 characters with one uppercase letter and one number.
      </Text>

      <View style={styles.inputBox}>
        <Ionicons name="lock-closed-outline" size={18} color="#6A00E8" />
        <TextInput
          placeholder="New password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.inputBox}>
        <Ionicons name="lock-closed-outline" size={18} color="#6A00E8" />
        <TextInput
          placeholder="Confirm password"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
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

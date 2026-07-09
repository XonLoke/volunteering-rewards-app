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
import { apiPost, setAuthToken } from "../lib/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("bob@test.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Details", "Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiPost("/api/auth/login", { email, password });

      // Store JWT token for subsequent API calls
      if (data.token) {
        setAuthToken(data.token);
      }

      Alert.alert("Success", "Login successful!");
      router.replace("/(tabs)/dashboard");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Ionicons name="calendar-outline" size={70} color="#6A00E8" />

      <Text style={styles.logo}>VR Organizer</Text>
      <Text style={styles.sub}>Volunteer Reward App</Text>

      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.small}>Login using your organiser account</Text>

      <View style={styles.inputBox}>
        <Ionicons name="mail" size={18} color="#6A00E8" />
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputBox}>
        <Ionicons name="lock-closed-outline" size={18} color="#6A00E8" />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.hint}>
        Use your organiser account (e.g. bob@test.com / password123)
      </Text>
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
  },
  small: {
    color: "#666",
    marginBottom: 25,
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
  hint: {
    marginTop: 18,
    color: "#777",
    fontSize: 12,
    textAlign: "center",
  },
});

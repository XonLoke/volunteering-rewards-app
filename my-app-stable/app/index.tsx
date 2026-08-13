import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

import { apiPost, setAccessToken } from "../lib/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const cleanedEmail = email.trim().toLowerCase();
    const cleanedPassword = password.trim();

    if (!cleanedEmail || !cleanedPassword) {
      Alert.alert("Missing Details", "Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiPost("/auth/login", {
        email: cleanedEmail,
        password: cleanedPassword,
      });

      console.log("Login response:", JSON.stringify(data, null, 2));

      const role =
        typeof data?.user?.role === "string"
          ? data.user.role.toLowerCase()
          : typeof data?.user?.role?.name === "string"
            ? data.user.role.name.toLowerCase()
            : "";

      const isOrganiser =
        role === "organiser" ||
        role === "organizer" ||
        role === "organisation_admin" ||
        role === "organization_admin";

      if (!isOrganiser) {
        Alert.alert(
          "Access Denied",
          `This account is not an organiser account.\nRole received: ${
            role || "unknown"
          }`,
        );
        return;
      }

      const token =
        data?.accessToken ||
        data?.access_token ||
        data?.token ||
        data?.tokens?.accessToken ||
        data?.tokens?.access_token;

      if (!token) {
        throw new Error(
          "Login succeeded, but no access token was returned by the backend.",
        );
      }

      if (!data?.user) {
        throw new Error(
          "Login succeeded, but no user information was returned by the backend.",
        );
      }

      setAccessToken(token);

      await AsyncStorage.multiSet([
        ["token", token],
        ["user", JSON.stringify(data.user)],
      ]);

      const savedUser = await AsyncStorage.getItem("user");

      console.log("Saved organiser profile:", savedUser);

      Alert.alert("Success", "Login successful!", [
        {
          text: "Continue",
          onPress: () => router.replace("/(tabs)/dashboard"),
        },
      ]);
    } catch (error) {
      console.log("Login error:", error);

      const message =
        error instanceof Error ? error.message : "Cannot connect to backend.";

      Alert.alert("Login Failed", message);
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

      <Text style={styles.small}>Login using your account</Text>

      <View style={styles.inputBox}>
        <Ionicons name="mail-outline" size={18} color="#6A00E8" />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#999999"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          editable={!loading}
        />
      </View>

      <View style={styles.inputBox}>
        <Ionicons name="lock-closed-outline" size={18} color="#6A00E8" />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#999999"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          onSubmitEditing={handleLogin}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
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
    color: "#555555",
    marginBottom: 35,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#222222",
    marginBottom: 4,
  },

  small: {
    color: "#666666",
    marginBottom: 25,
  },

  inputBox: {
    width: "100%",
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: "#222222",
    fontSize: 15,
  },

  button: {
    width: "100%",
    minHeight: 52,
    backgroundColor: "#6A00E8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
});

import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.72.201:3000/api";

const menuItems = [
  {
    id: "1",
    icon: "create-outline",
    label: "Edit Profile",
    sub: "Update your personal details",
    route: "/edit-profile",
    color: "#6366f1",
  },
  {
    id: "2",
    icon: "stats-chart-outline",
    label: "Points History",
    sub: "Track points earned and used",
    route: "/points-history",
    color: "#f59e0b",
  },
  {
    id: "3",
    icon: "scan-outline",
    label: "Scan History",
    sub: "View confirmed QR attendance",
    route: "/scan-history",
    color: "#10b981",
  },
  {
    id: "4",
    icon: "settings-outline",
    label: "Settings",
    sub: "Theme and app preferences",
    route: "/settings",
    color: "#06b6d4",
  },
];

const supportItems = [
  {
    id: "5",
    icon: "help-circle-outline",
    label: "Help & FAQ",
    sub: "Find answers quickly",
    route: "/help",
    color: "#a855f7",
  },
  {
    id: "6",
    icon: "call-outline",
    label: "Contact Us",
    sub: "Reach the support team",
    route: "/contact",
    color: "#ec4899",
  },
];

export default function Profile() {
  const router = useRouter();
  const { theme } = useTheme();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [scansCount, setScansCount] = useState(0);
  const [couponsCount, setCouponsCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUserAndStats();
    }, [])
  );

  const initials = (() => {
    const name = user?.name || "Volunteer";
    return name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  })();

  const loadUserAndStats = async () => {
    try {
      setLoadingStats(true);

      const stored = await AsyncStorage.getItem("user");

      if (!stored) {
        setUser(null);
        setAvatarUri(null);
        setScansCount(0);
        setCouponsCount(0);
        return;
      }

      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      setAvatarUri(parsedUser.avatar_url || null);

      try {
        const profileRes = await fetch(
          `${BASE_URL}/profile?user_id=${parsedUser.id}`
        );
        const profileData = await profileRes.json();

        if (profileRes.ok && profileData.user) {
          const updatedUser = {
            ...parsedUser,
            ...profileData.user,
          };

          setUser(updatedUser);
          setAvatarUri(updatedUser.avatar_url || null);

          await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

          if (typeof updatedUser.points !== "undefined") {
            await AsyncStorage.setItem("userPoints", String(updatedUser.points));
          }
        }
      } catch (profileErr) {
        console.log("Profile refresh skipped:", profileErr);
      }

      try {
        const scansRes = await fetch(`${BASE_URL}/scans?user_id=${parsedUser.id}`);
        const scansData = await scansRes.json();

        if (scansRes.ok) {
          setScansCount((scansData.scans || []).length);
        }
      } catch (scanErr) {
        console.log("Scans count skipped:", scanErr);
      }

      try {
        const couponsRes = await fetch(
          `${BASE_URL}/my-coupons?user_id=${parsedUser.id}`
        );
        const couponsData = await couponsRes.json();

        if (couponsRes.ok) {
          setCouponsCount((couponsData.coupons || []).length);
        }
      } catch (couponErr) {
        console.log("Coupons count skipped:", couponErr);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadUserAndStats();
    } finally {
      setRefreshing(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert("Log out?", "You will need to log in again to continue.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: handleLogout,
      },
    ]);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userPoints");
    router.replace("/login" as any);
  };

  const uploadProfilePhoto = async (localUri: string) => {
    try {
      const stored = await AsyncStorage.getItem("user");

      if (!stored) {
        Alert.alert("Login required", "Please login again.");
        router.replace("/login" as any);
        return;
      }

      const currentUser = JSON.parse(stored);

      const formData = new FormData();
      formData.append("user_id", String(currentUser.id));
      formData.append("avatar", {
        uri: localUri,
        name: `profile-${currentUser.id}.jpg`,
        type: "image/jpeg",
      } as any);

      const response = await fetch(`${BASE_URL}/profile/avatar`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload profile picture.");
      }

      const updatedUser = {
        ...currentUser,
        ...data.user,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);
      setAvatarUri(updatedUser.avatar_url || null);

      Alert.alert("Updated", "Profile picture updated successfully.");
    } catch (error: any) {
      console.error("Upload profile photo error:", error);
      Alert.alert("Error", error.message || "Failed to upload profile picture.");
    }
  };

  const handleChangePhoto = async () => {
    Alert.alert("Profile Photo", "Choose how to update your photo", [
      {
        text: "Take Photo",
        onPress: async () => {
          const { granted } = await ImagePicker.requestCameraPermissionsAsync();

          if (!granted) {
            Alert.alert("Permission needed", "Camera access is required.");
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
          });

          if (!result.canceled) {
            await uploadProfilePhoto(result.assets[0].uri);
          }
        },
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const { granted } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (!granted) {
            Alert.alert(
              "Permission needed",
              "Photo library access is required."
            );
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
          });

          if (!result.canceled) {
            await uploadProfilePhoto(result.assets[0].uri);
          }
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const points = Number(user?.points ?? 0);

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={[styles.heroCard, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.heroDecorOne} />
          <View style={styles.heroDecorTwo} />

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.heroIconButton}
              onPress={() => router.back()}
              activeOpacity={0.85}
            >
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerMini}>Account</Text>
              <Text style={styles.headerTitle}>My Profile</Text>
            </View>

            <TouchableOpacity
              style={styles.heroIconButton}
              onPress={onRefresh}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileHero}>
            <TouchableOpacity
              onPress={handleChangePhoto}
              activeOpacity={0.88}
              style={styles.avatarTouchable}
            >
              <View style={styles.avatarRing}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                  </View>
                )}
              </View>

              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={15} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={styles.nameText} numberOfLines={1}>
              {user?.name || "Guest Volunteer"}
            </Text>

            <Text style={styles.emailText} numberOfLines={1}>
              {user?.email || "Login to view your profile"}
            </Text>

            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={13} color="rgba(255,255,255,0.78)" />
              <Text style={styles.phoneText} numberOfLines={1}>
                {user?.phone && String(user.phone).trim() !== ""
                  ? user.phone
                  : "No phone number added"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.editProfilePill}
              onPress={() => router.push("/edit-profile" as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="create-outline" size={15} color="#fff" />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View
            style={[
              styles.pointsCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.pointsTop}>
              <View
                style={[
                  styles.statIconBox,
                  { backgroundColor: theme.colors.primary + "18" },
                ]}
              >
                <Ionicons
                  name="sparkles-outline"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>

              <Text
                style={[styles.statCardLabel, { color: theme.colors.textSecondary }]}
              >
                Total Points
              </Text>
            </View>

            {loadingStats ? (
              <ActivityIndicator
                color={theme.colors.primary}
                style={styles.pointsLoader}
              />
            ) : (
              <Text style={[styles.pointsValue, { color: theme.colors.text }]}>
                {points.toLocaleString()}
              </Text>
            )}

            <Text
              style={[styles.pointsCaption, { color: theme.colors.textSecondary }]}
            >
              Earned from volunteering and scan rewards
            </Text>
          </View>

          <View style={styles.miniStatsStack}>
            <TouchableOpacity
              style={[
                styles.miniStatCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => router.push("/scan-history" as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.miniIconBox, { backgroundColor: "#10b98118" }]}>
                <Ionicons name="scan-outline" size={21} color="#10b981" />
              </View>

              <View>
                <Text style={[styles.miniStatValue, { color: theme.colors.text }]}>
                  {loadingStats ? "..." : scansCount}
                </Text>
                <Text
                  style={[
                    styles.miniStatLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Scans
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.miniStatCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => router.push("/my-coupons" as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.miniIconBox, { backgroundColor: "#f59e0b18" }]}>
                <Ionicons name="ticket-outline" size={21} color="#f59e0b" />
              </View>

              <View>
                <Text style={[styles.miniStatValue, { color: theme.colors.text }]}>
                  {loadingStats ? "..." : couponsCount}
                </Text>
                <Text
                  style={[
                    styles.miniStatLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Coupons
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[
              styles.quickAction,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => router.push("/scan" as any)}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.quickIcon,
                { backgroundColor: theme.colors.primary + "18" },
              ]}
            >
              <Ionicons
                name="qr-code-outline"
                size={22}
                color={theme.colors.primary}
              />
            </View>
            <Text style={[styles.quickTitle, { color: theme.colors.text }]}>
              My QR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickAction,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => router.push("/rewards" as any)}
            activeOpacity={0.85}
          >
            <View style={[styles.quickIcon, { backgroundColor: "#ec489918" }]}>
              <Ionicons name="gift-outline" size={22} color="#ec4899" />
            </View>
            <Text style={[styles.quickTitle, { color: theme.colors.text }]}>
              Rewards
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickAction,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => router.push("/my-coupons" as any)}
            activeOpacity={0.85}
          >
            <View style={[styles.quickIcon, { backgroundColor: "#f59e0b18" }]}>
              <Ionicons name="ticket-outline" size={22} color="#f59e0b" />
            </View>
            <Text style={[styles.quickTitle, { color: theme.colors.text }]}>
              Coupons
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Account Settings
            </Text>

            <Text
              style={[styles.sectionSub, { color: theme.colors.textSecondary }]}
            >
              Manage your account
            </Text>
          </View>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuRow,
                  index < menuItems.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.menuIconBg,
                    { backgroundColor: item.color + "18" },
                  ]}
                >
                  <Ionicons name={item.icon as any} size={21} color={item.color} />
                </View>

                <View style={styles.menuTextCol}>
                  <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
                    {item.label}
                  </Text>

                  <Text
                    style={[
                      styles.menuSub,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {item.sub}
                  </Text>
                </View>

                <View
                  style={[
                    styles.arrowBubble,
                    { backgroundColor: theme.colors.background },
                  ]}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color={theme.colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Support
            </Text>

            <Text
              style={[styles.sectionSub, { color: theme.colors.textSecondary }]}
            >
              Help and contact
            </Text>
          </View>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {supportItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuRow,
                  index < supportItems.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.menuIconBg,
                    { backgroundColor: item.color + "18" },
                  ]}
                >
                  <Ionicons name={item.icon as any} size={21} color={item.color} />
                </View>

                <View style={styles.menuTextCol}>
                  <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
                    {item.label}
                  </Text>

                  <Text
                    style={[
                      styles.menuSub,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {item.sub}
                  </Text>
                </View>

                <View
                  style={[
                    styles.arrowBubble,
                    { backgroundColor: theme.colors.background },
                  ]}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color={theme.colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: "#ef444414",
              borderColor: "#ef444444",
            },
          ]}
          onPress={confirmLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={[styles.versionTag, { color: theme.colors.textSecondary }]}>
          VolunteerRewards v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  scroll: {
    paddingBottom: 46,
  },

  heroCard: {
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    paddingBottom: 30,
    overflow: "hidden",
    position: "relative",
  },

  heroDecorOne: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.09)",
    top: -90,
    right: -70,
  },

  heroDecorTwo: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -45,
    left: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },

  heroIconButton: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleWrap: {
    flex: 1,
    paddingHorizontal: 14,
  },

  headerMini: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 2,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  profileHero: {
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 1,
  },

  avatarTouchable: {
    marginTop: 4,
    marginBottom: 16,
  },

  avatarRing: {
    width: 118,
    height: 118,
    borderRadius: 38,
    padding: 5,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 34,
  },

  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarInitials: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
  },

  cameraBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },

  nameText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginBottom: 5,
    maxWidth: 300,
  },

  emailText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 5,
    maxWidth: 300,
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 14,
    maxWidth: 300,
  },

  phoneText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontWeight: "700",
  },

  editProfilePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 6,
  },

  editProfileText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },

  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },

  pointsCard: {
    flex: 1.25,
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    minHeight: 160,
  },

  pointsTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  statIconBox: {
    width: 47,
    height: 47,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  statCardLabel: {
    fontSize: 12,
    fontWeight: "800",
  },

  pointsLoader: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },

  pointsValue: {
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 6,
  },

  pointsCaption: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },

  miniStatsStack: {
    flex: 1,
    gap: 12,
  },

  miniStatCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  miniIconBox: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  miniStatValue: {
    fontSize: 20,
    fontWeight: "900",
  },

  miniStatLabel: {
    fontSize: 11,
    fontWeight: "700",
  },

  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 14,
    gap: 12,
  },

  quickAction: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    padding: 15,
    alignItems: "center",
  },

  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  quickTitle: {
    fontSize: 12,
    fontWeight: "900",
  },

  section: {
    paddingHorizontal: 20,
    marginTop: 26,
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  sectionSub: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  menuCard: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
  },

  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },

  menuIconBg: {
    width: 47,
    height: 47,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  menuTextCol: {
    flex: 1,
  },

  menuLabel: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 3,
  },

  menuSub: {
    fontSize: 12,
    fontWeight: "600",
  },

  arrowBubble: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 21,
    borderWidth: 1,
    paddingVertical: 16,
  },

  logoutText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "900",
  },

  versionTag: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 11,
    fontWeight: "700",
  },
});
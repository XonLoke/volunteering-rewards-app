import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const menuItems = [
  { id: "1", emoji: "✏️", label: "Edit Profile", sub: "Update your details", route: "/edit-profile" },
  { id: "2", emoji: "📋", label: "Points History", sub: "See your earned points", route: "/points-history" },
  { id: "3", emoji: "🔍", label: "Scan History", sub: "All past QR scans", route: "/scan-history" },
  { id: "4", emoji: "⚙️", label: "Settings", sub: "App preferences", route: "/settings" },
];

const supportItems = [
  { id: "5", emoji: "❓", label: "Help & FAQ", sub: "Get answers fast", route: "/help" },
  { id: "6", emoji: "📞", label: "Contact Us", sub: "We're here to help", route: "/contact" },
];

const accent = "#22d3a5";
const accentSoft = "#22d3a510";
const gold = "#f5c842";

export default function Profile() {
  const router = useRouter();
  const { theme } = useTheme();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    router.push("/login" as any);
  };

  const handleChangePhoto = async () => {
    Alert.alert("Profile Photo", "Choose how to update your photo", [
      {
        text: "📷  Take Photo",
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
          if (!result.canceled) setAvatarUri(result.assets[0].uri);
        },
      },
      {
        text: "🖼️  Choose from Library",
        onPress: async () => {
          const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!granted) {
            Alert.alert("Permission needed", "Photo library access is required.");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
          });
          if (!result.canceled) setAvatarUri(result.assets[0].uri);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── HERO BANNER ── */}
        <View style={[styles.heroBanner, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.blob1, { backgroundColor: accent + "30" }]} />
          <View style={[styles.blob2, { backgroundColor: gold + "20" }]} />

          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.colors.background + "cc", borderColor: theme.colors.border }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.iconBtnText, { color: theme.colors.text }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.screenTitle, { color: theme.colors.text }]}>Profile</Text>
            <View style={styles.spacer} />
          </View>

          {/* Avatar */}
          <View style={styles.avatarArea}>
            <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.88}>
              <View style={[styles.avatarRing, { borderColor: accent }]}>
                <View style={[styles.avatarRingInner, { borderColor: accent + "44" }]}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                  ) : (
                    <View style={[styles.avatarFallback, { backgroundColor: theme.colors.background }]}>
                      <View style={[styles.fallHead, { backgroundColor: theme.colors.textSecondary }]} />
                      <View style={[styles.fallBody, { backgroundColor: theme.colors.textSecondary }]} />
                    </View>
                  )}
                </View>
              </View>
              <View style={[styles.camBadge, { backgroundColor: accent }]}>
                <Text style={styles.camText}>📷</Text>
              </View>
            </TouchableOpacity>

            {/* Real user name and email */}
            <Text style={[styles.nameText, { color: theme.colors.text }]}>
              {user?.name || "Guest"}
            </Text>
            <Text style={[styles.emailText, { color: theme.colors.textSecondary }]}>
              {user?.email || ""}
            </Text>
            <TouchableOpacity
              style={[styles.editPhotoPill, { backgroundColor: accentSoft, borderColor: accent + "66" }]}
              onPress={handleChangePhoto}
            >
              <Text style={[styles.editPhotoLabel, { color: accent }]}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── STATS ROW ── */}
        <View style={styles.statsRow}>
          <View style={[styles.statHero, { backgroundColor: accent }]}>
            <Text style={styles.statHeroNum}>{user?.points || 0}</Text>
            <Text style={styles.statHeroLabel}>Points</Text>
            <View style={styles.statHeroDot} />
          </View>
          <View style={styles.statsStack}>
            <View style={[styles.statMini, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.statMiniNum, { color: theme.colors.text }]}>0</Text>
              <Text style={[styles.statMiniLabel, { color: theme.colors.textSecondary }]}>Scans</Text>
            </View>
            <View style={[styles.statMini, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.statMiniNum, { color: theme.colors.text }]}>0</Text>
              <Text style={[styles.statMiniLabel, { color: theme.colors.textSecondary }]}>Coupons</Text>
            </View>
          </View>
        </View>

        {/* ── ACCOUNT SETTINGS ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionPill, { backgroundColor: accent }]} />
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Account Settings</Text>
          </View>
          <View style={[styles.menuCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuRow,
                  index < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                ]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuEmojiBg, { backgroundColor: accentSoft }]}>
                  <Text style={styles.menuEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.menuTextCol}>
                  <Text style={[styles.menuLabel, { color: theme.colors.text }]}>{item.label}</Text>
                  <Text style={[styles.menuSub, { color: theme.colors.textSecondary }]}>{item.sub}</Text>
                </View>
                <View style={[styles.arrowBubble, { backgroundColor: accentSoft }]}>
                  <Text style={[styles.arrowText, { color: accent }]}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── SUPPORT ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionPill, { backgroundColor: gold }]} />
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Support</Text>
          </View>
          <View style={[styles.menuCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {supportItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuRow,
                  index < supportItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                ]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuEmojiBg, { backgroundColor: gold + "18" }]}>
                  <Text style={styles.menuEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.menuTextCol}>
                  <Text style={[styles.menuLabel, { color: theme.colors.text }]}>{item.label}</Text>
                  <Text style={[styles.menuSub, { color: theme.colors.textSecondary }]}>{item.sub}</Text>
                </View>
                <View style={[styles.arrowBubble, { backgroundColor: gold + "18" }]}>
                  <Text style={[styles.arrowText, { color: gold }]}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── LOG OUT ── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={[styles.versionTag, { color: theme.colors.textTertiary }]}>VolunteerRewards v1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: 48 },
  heroBanner: {
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
    position: "relative",
  },
  blob1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -40,
    right: -40,
  },
  blob2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    bottom: 10,
    left: -30,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  iconBtnText: { fontSize: 18, fontWeight: "700" },
  screenTitle: { fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
  spacer: { width: 40, height: 40 },
  avatarArea: { alignItems: "center", paddingTop: 8 },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    padding: 4,
    marginBottom: 16,
  },
  avatarRingInner: {
    flex: 1,
    borderRadius: 50,
    borderWidth: 2,
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%", borderRadius: 50 },
  avatarFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  fallHead: { width: 34, height: 34, borderRadius: 17, marginBottom: 4 },
  fallBody: { width: 52, height: 28, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  camBadge: {
    position: "absolute",
    bottom: 14,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  camText: { fontSize: 14 },
  nameText: { fontSize: 22, fontWeight: "900", letterSpacing: 0.2, marginBottom: 4 },
  emailText: { fontSize: 13, fontWeight: "500", marginBottom: 14 },
  editPhotoPill: {
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  editPhotoLabel: { fontSize: 13, fontWeight: "700" },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 12,
  },
  statHero: {
    flex: 1.2,
    borderRadius: 22,
    padding: 20,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  statHeroNum: { fontSize: 28, fontWeight: "900", color: "#fff", marginBottom: 4 },
  statHeroLabel: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.85)" },
  statHeroDot: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    bottom: -20,
    right: -20,
  },
  statsStack: { flex: 1, gap: 12 },
  statMini: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  statMiniNum: { fontSize: 20, fontWeight: "900", marginBottom: 2 },
  statMiniLabel: { fontSize: 11, fontWeight: "600" },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionPill: { width: 4, height: 16, borderRadius: 2 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  menuCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuEmojiBg: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  menuEmoji: { fontSize: 18 },
  menuTextCol: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  menuSub: { fontSize: 11, fontWeight: "500" },
  arrowBubble: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  arrowText: { fontSize: 20, fontWeight: "700", lineHeight: 24 },
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#ef4444",
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#ef444410",
  },
  logoutText: { color: "#ef4444", fontSize: 15, fontWeight: "800", letterSpacing: 0.3 },
  versionTag: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 11,
    fontWeight: "500",
  },
});
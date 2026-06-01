import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function Feedback() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Feedback</Text>

      <View style={styles.ratingBox}>
        <Text style={styles.overall}>Overall Rating</Text>
        <Text style={styles.rating}>4.7</Text>
        <Text style={styles.stars}>★★★★★</Text>
        <Text style={styles.white}>(86 Feedbacks)</Text>
      </View>

      {["Alice Johnson", "Ryan Lee", "Sarah Wong"].map((name, index) => (
        <View key={index} style={styles.feedbackCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.date}>May 25, 2025</Text>
            <Text style={styles.starSmall}>★★★★★</Text>
            <Text style={styles.comment}>
              {index === 0
                ? "Well organized and meaningful event!"
                : "Great teamwork and smooth coordination."}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 18 },
  header: { textAlign: "center", fontSize: 20, fontWeight: "800", marginVertical: 18 },
  ratingBox: { backgroundColor: "#6A00E8", padding: 20, borderRadius: 16 },
  overall: { color: "#fff", fontWeight: "700" },
  rating: { color: "#fff", fontSize: 42, fontWeight: "900" },
  stars: { color: "#FFD700", fontSize: 22 },
  white: { color: "#fff" },
  feedbackCard: { flexDirection: "row", paddingVertical: 16, borderBottomWidth: 1, borderColor: "#eee" },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#6A00E8", alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarText: { color: "#fff", fontWeight: "800" },
  name: { fontWeight: "800" },
  date: { color: "#555", fontSize: 12 },
  starSmall: { color: "#FFD700", marginVertical: 4 },
  comment: { color: "#333" },
});
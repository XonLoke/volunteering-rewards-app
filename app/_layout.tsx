import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />

        <Stack.Screen name="home" />
        <Stack.Screen name="events" />
        <Stack.Screen name="event-booked" />

        <Stack.Screen name="rewards" />
        <Stack.Screen name="coupon-detail" />
        <Stack.Screen name="redeem-confirmation" />
        <Stack.Screen name="redeem-success" />
        <Stack.Screen name="my-coupons" />
        <Stack.Screen name="pin-display" />

        <Stack.Screen name="notifications" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="settings" />

        <Stack.Screen name="contact" />
        <Stack.Screen name="help" />

        <Stack.Screen name="scan-history" />
        <Stack.Screen name="scan-success" />

        <Stack.Screen name="ai-recommendations" />
        <Stack.Screen name="hall-of-fame" />
        <Stack.Screen name="scan" />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

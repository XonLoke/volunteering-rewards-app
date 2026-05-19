import { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { getToken } from '../src/services/storage';
import { setAuthToken } from '../src/services/api';
import { colors } from '../src/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

export default function RootLayout() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        const storedToken = await getToken();
        if (storedToken) {
          setAuthToken(storedToken);
          setAuthState('authenticated');
        } else {
          setAuthState('unauthenticated');
        }
      } catch (error) {
        console.warn('Auth bootstrap error:', error);
        setAuthState('unauthenticated');
      } finally {
        setAppIsReady(true);
      }
    }

    bootstrap();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.blue} />
      </View>
    );
  }

  const initialRoute = authState === 'authenticated' ? '(tabs)' : '(auth)';

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg.page },
          animation: 'slide_from_right',
        }}
      >
        {authState === 'authenticated' ? (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        )}
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg.page,
  },
});

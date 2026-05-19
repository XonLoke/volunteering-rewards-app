import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { getToken } from '../src/services/storage';
import { setAuthToken } from '../src/services/api';
import { colors } from '../src/theme';

type RedirectTarget = 'tabs' | 'onboarding' | null;

export default function IndexScreen() {
  const [redirectTo, setRedirectTo] = useState<RedirectTarget>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const storedToken = await getToken();
        if (storedToken) {
          setAuthToken(storedToken);
          setRedirectTo('tabs');
        } else {
          setRedirectTo('onboarding');
        }
      } catch {
        setRedirectTo('onboarding');
      }
    }

    checkAuth();
  }, []);

  if (redirectTo === 'tabs') {
    return <Redirect href="/(tabs)" />;
  }

  if (redirectTo === 'onboarding') {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent.blue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg.page,
  },
});

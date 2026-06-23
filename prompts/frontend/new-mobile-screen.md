# New Mobile Screen Template

## Task
Create a new `{ScreenName}` screen for the Expo/React Native mobile app.

## Steps

### 1. Create screen file — `frontend/mobile_app/app/{screen-name}.tsx`
```tsx
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { api } from '../src/services/api';

export default function {ScreenName}Screen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/{endpoint}');
      setData(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <ActivityIndicator size="large" style={styles.centered} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{Screen Title}</Text>
      {/* Render content here */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, color: '#1a1a1a' },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
});
```

### 2. Add navigation link in `frontend/mobile_app/app/_layout.tsx`
- Add the screen to the tab navigator or stack navigator

### 3. API service pattern
```ts
// frontend/mobile_app/src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://vol-rewards-api.onrender.com',
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export { api };
```

### 4. Verify
```bash
cd frontend/mobile_app && npx expo start --web
```

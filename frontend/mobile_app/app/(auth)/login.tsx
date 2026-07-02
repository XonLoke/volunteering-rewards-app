import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import Toast from '../../src/components/Toast';
import { api, setAuthToken } from '../../src/services/api';
import { setToken } from '../../src/services/storage';
import { colors, spacing, typography } from '../../src/theme';

interface LoginForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    points_balance: number;
    volunteer_qr_code?: string;
  };
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const handleDismissToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email: form.email.trim(),
        password: form.password,
      });

      // Store auth token
      setAuthToken(response.token);
      await setToken(response.token);

      // Save user data for QR code display and profile
      const userData = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        points: response.user.points_balance,
        volunteer_qr_code: response.user.volunteer_qr_code || '',
      };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      if (response.user.points_balance !== undefined) {
        await AsyncStorage.setItem('userPoints', String(response.user.points_balance));
      }

      // Navigate to main app
      router.replace('/(tabs)/home');
    } catch (error: any) {
      if (error?.name === 'ApiError') {
        switch (error?.code) {
          case 'invalid_credentials':
            showToast('Invalid email or password. Please try again.');
            break;
          case 'account_locked':
            showToast('Account temporarily locked. Please try again later.');
            break;
          case 'email_not_verified':
            showToast('Please verify your email before signing in.');
            break;
          default:
            showToast(error?.message || 'Login failed. Please try again.');
        }
      } else if (error instanceof TypeError && error.message === 'Network request failed') {
        showToast('Connection error. Check your internet.');
      } else {
        showToast('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [form, validateForm, showToast]);

  const handleForgotPassword = useCallback(() => {
    Alert.alert('Coming Soon', 'Password reset functionality will be available in a future update.');
  }, []);

  const handleSignUp = useCallback(() => {
    router.push('/(auth)/register');
  }, []);

  const updateField = useCallback((field: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    setErrors((prev) => {
      if (prev[field]) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Icon area */}
          <View style={styles.logoArea}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoStar}>{'★'}</Text>
            </View>
            <Text style={styles.appName}>Volunteering Rewards</Text>
          </View>

          {/* Heading */}
          <Text style={styles.heading}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              value={form.email}
              onChangeText={(text) => updateField('email', text)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
              returnKeyType="next"
            />

            <Input
              label="Password"
              value={form.password}
              onChangeText={(text) => updateField('password', text)}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              error={errors.password}
              returnKeyType="done"
            />

            {/* Show/Hide password toggle */}
            {form.password.length > 0 && (
              <TouchableOpacity
                style={styles.showPasswordButton}
                onPress={() => setShowPassword((prev) => !prev)}
                activeOpacity={0.7}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? 'Hide' : 'Show'} password
                </Text>
              </TouchableOpacity>
            )}

            {/* Forgot password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In button */}
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              variant="primary"
              style={styles.signInButton}
            />
          </View>

          {/* Sign up link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast for general errors */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type="error"
        onDismiss={handleDismissToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.page,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  logoArea: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bg.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoStar: {
    fontSize: 40,
    color: colors.accent.green,
  },
  appName: {
    ...typography.title3,
    color: colors.accent.green,
    fontWeight: '700',
  },
  heading: {
    ...typography.title1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xxl,
  },
  form: {
    marginBottom: spacing.xl,
  },
  showPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  showPasswordText: {
    ...typography.footnote,
    color: colors.accent.blue,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
    paddingVertical: spacing.xs,
  },
  forgotPasswordText: {
    ...typography.subhead,
    color: colors.accent.blue,
  },
  signInButton: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
  footerText: {
    ...typography.subhead,
    color: colors.text.secondary,
  },
  footerLink: {
    ...typography.subhead,
    color: colors.accent.blue,
    fontWeight: '600',
  },
});

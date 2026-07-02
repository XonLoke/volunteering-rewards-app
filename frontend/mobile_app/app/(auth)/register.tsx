import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
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

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface RegisterResponse {
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

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Full name is required';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (SG format)
    const trimmedPhone = form.phone.trim();
    if (!trimmedPhone) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleaned = trimmedPhone.replace(/^\+65\s?/, '').replace(/\s/g, '');
      if (!/^[89]\d{7}$/.test(cleaned)) {
        newErrors.phone =
          'Please enter a valid Singapore phone number (8 digits starting with 8 or 9)';
      }
    }

    // Password validation
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

  const handleRegister = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post<RegisterResponse>('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        password_confirm: form.confirmPassword,
      });

      // Store auth token
      setAuthToken(response.token);
      await setToken(response.token);

      // Save user data for QR code display
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
          case 'email_taken':
            setErrors((prev) => ({
              ...prev,
              email: 'Email already registered',
            }));
            break;
          case 'phone_taken':
            setErrors((prev) => ({
              ...prev,
              phone: 'Phone already registered',
            }));
            break;
          case 'validation_error':
            showToast(error?.message || 'Please check your inputs and try again.');
            break;
          default:
            showToast(error?.message || 'Registration failed. Please try again.');
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

  const handleSignIn = useCallback(() => {
    router.back();
  }, []);

  const updateField = useCallback((field: keyof RegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    setErrors((prev) => {
      if (prev[field]) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      // Clear confirmPassword error when password changes
      if (field === 'password' && prev.confirmPassword) {
        const { confirmPassword: _cp, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Back button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + spacing.sm }]}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={styles.backButtonText}>{'< Back'}</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Heading */}
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subtitle}>Join the volunteering community</Text>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              value={form.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="Enter your full name"
              autoCapitalize="words"
              autoComplete="name"
              error={errors.name}
              returnKeyType="next"
            />

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
              label="Phone Number"
              value={form.phone}
              onChangeText={(text) => updateField('phone', text)}
              placeholder="+65 8123 4567"
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoComplete="tel"
              error={errors.phone}
              helperText="Singapore number (+65 or 8 digits starting with 8 or 9)"
              returnKeyType="next"
            />

            <Input
              label="Password"
              value={form.password}
              onChangeText={(text) => updateField('password', text)}
              placeholder="Create a password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              error={errors.password}
              helperText="Minimum 8 characters"
              returnKeyType="next"
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

            <Input
              label="Confirm Password"
              value={form.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              placeholder="Re-enter your password"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              error={errors.confirmPassword}
              returnKeyType="done"
            />

            {/* Show/Hide confirm password toggle */}
            {form.confirmPassword.length > 0 && (
              <TouchableOpacity
                style={styles.showPasswordButton}
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                activeOpacity={0.7}
              >
                <Text style={styles.showPasswordText}>
                  {showConfirmPassword ? 'Hide' : 'Show'} password
                </Text>
              </TouchableOpacity>
            )}

            {/* Create Account button */}
            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              variant="primary"
              style={styles.createAccountButton}
            />
          </View>

          {/* Sign in link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Sign In</Text>
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
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  backButtonText: {
    ...typography.headline,
    color: colors.accent.blue,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xxl,
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
    marginBottom: spacing.lg,
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
  createAccountButton: {
    width: '100%',
    marginTop: spacing.md,
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

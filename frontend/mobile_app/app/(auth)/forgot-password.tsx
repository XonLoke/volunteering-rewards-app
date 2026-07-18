import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { api } from '../../src/services/api';
import { colors, spacing, typography } from '../../src/theme';

const FRONTEND_URL = process.env.EXPO_PUBLIC_FRONTEND_URL || "https://volunteering-rewards-app.vercel.app";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
        redirect_url: `${FRONTEND_URL}/reset-password`,
      });
      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleBackToLogin = useCallback(() => {
    router.push('/(auth)/login');
  }, []);

  if (sent) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoArea}>
              <View style={[styles.logoContainer, { backgroundColor: colors.status.pending + '20' }]}>
                <Text style={styles.logoIcon}>📧</Text>
              </View>
              <Text style={styles.appName}>Volunteering Rewards</Text>
            </View>

            <Text style={styles.heading}>Check Your Email</Text>
            <Text style={styles.subtitle}>
              If an account exists for{' '}
              <Text style={styles.emailBold}>{email}</Text>
              , a password reset link has been sent.
            </Text>

            <View style={styles.form}>
              <Button
                title="Back to Sign In"
                onPress={handleBackToLogin}
                variant="primary"
                style={styles.button}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoArea}>
            <View style={[styles.logoContainer, { backgroundColor: colors.bg.subtle }]}>
              <Text style={styles.logoStar}>🔒</Text>
            </View>
            <Text style={styles.appName}>Volunteering Rewards</Text>
          </View>

          <Text style={styles.heading}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a reset link.
          </Text>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={(text) => { setEmail(text); setError(null); }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={error || undefined}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            <Button
              title={loading ? 'Sending...' : 'Send Reset Link'}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              variant="primary"
              style={styles.button}
            />
          </View>

          {/* Back to sign in */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <Button
              title="Sign In"
              onPress={handleBackToLogin}
              variant="tertiary"
              style={styles.footerButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.page,
  },
  flex: { flex: 1 },
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoIcon: {
    fontSize: 36,
  },
  logoStar: {
    fontSize: 36,
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
    lineHeight: 22,
  },
  emailBold: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  form: {
    marginBottom: spacing.xl,
  },
  button: {
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
  footerButton: {
    paddingHorizontal: 0,
    minWidth: 0,
  },
});

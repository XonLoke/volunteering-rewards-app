import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Button from '../../src/components/Button';
import { colors, spacing, typography } from '../../src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Step {
  icon: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: '\u{1F331}',
    title: 'Volunteer & Earn',
    description:
      'Discover meaningful volunteering opportunities and earn points for every hour you contribute to the community.',
  },
  {
    icon: '\u{1F381}',
    title: 'Redeem Rewards',
    description:
      'Exchange your earned points for exciting rewards, from gift vouchers to exclusive merchandise and experiences.',
  },
  {
    icon: '\u{1F49A}',
    title: 'Make a Difference',
    description:
      'Track your impact, build your volunteering portfolio, and become part of a community dedicated to positive change.',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      Animated.timing(scrollX, {
        toValue: nextIndex * SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentStep, scrollX]);

  const handleSkip = useCallback(() => {
    router.replace('/(auth)/login');
  }, []);

  const handleGetStarted = useCallback(() => {
    router.replace('/(auth)/login');
  }, []);

  const isLastStep = currentStep === steps.length - 1;

  const translateX = scrollX.interpolate({
    inputRange: [0, SCREEN_WIDTH * (steps.length - 1)],
    outputRange: [0, -(SCREEN_WIDTH * (steps.length - 1))],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Skip button */}
      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + spacing.sm }]}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides container */}
      <View style={styles.slidesContainer}>
        <Animated.View
          style={[
            styles.slidesRow,
            {
              transform: [{ translateX }],
              width: SCREEN_WIDTH * steps.length,
            },
          ]}
        >
          {steps.map((step, index) => (
            <View key={index} style={[styles.slide, { width: SCREEN_WIDTH }]}>
              <View style={styles.iconWrapper}>
                <Text style={styles.iconText}>{step.icon}</Text>
              </View>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.description}>{step.description}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Dot indicators */}
      <View style={styles.dotsContainer}>
        {steps.map((_, index) => {
          const isActive = index === currentStep;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                isActive ? styles.dotActive : styles.dotInactive,
              ]}
            />
          );
        })}
      </View>

      {/* Bottom button area */}
      <View style={[styles.bottomArea, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        {isLastStep ? (
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            variant="primary"
            style={styles.nextButton}
          />
        ) : (
          <Button
            title="Next"
            onPress={handleNext}
            variant="primary"
            style={styles.nextButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.page,
  },
  skipButton: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    ...typography.headline,
    color: colors.accent.blue,
  },
  slidesContainer: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slidesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  iconWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.bg.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  iconText: {
    fontSize: 72,
  },
  title: {
    ...typography.title1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    gap: spacing.sm,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.accent.green,
  },
  dotInactive: {
    width: 6,
    backgroundColor: colors.border.light,
  },
  bottomArea: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  nextButton: {
    width: '100%',
  },
});

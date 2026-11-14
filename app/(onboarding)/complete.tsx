/**
 * UniDate — Onboarding Screen 9: Completion & Welcome
 * Displays onboarding success, verification status summary,
 * and enters the protected application tabs.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, CheckCircle2, ShieldCheck, Heart, ArrowRight } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { useAuthStore } from '../../src/stores/authStore';

export default function OnboardingCompletionScreen() {
  const store = useOnboardingStore();
  const setHasCompletedOnboarding = useAuthStore((state) => state.setHasCompletedOnboarding);

  const handleEnterApp = () => {
    // Confirm onboarding completion in authStore
    setHasCompletedOnboarding(true);
    // Enter protected app
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {/* Celebratory Icon Circle */}
          <View style={styles.celebrationCircle}>
            <View style={styles.innerCircle}>
              <CheckCircle2 size={56} color={colors.white} />
            </View>
            <View style={styles.heartSticker}>
              <Heart size={20} color={colors.accent} fill={colors.accent} />
            </View>
          </View>

          {/* Heading Message */}
          <Text style={styles.title}>Welcome to UniDate!</Text>
          <Text style={styles.subtitle}>Your campus connections start here.</Text>

          {/* Info Card */}
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <ShieldCheck size={24} color={colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Profile Activated</Text>
                <Text style={styles.infoDesc}>
                  Your verified student profile is now configured for {store.universityName || 'your university'}.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Sparkles size={24} color={colors.purpleAccent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Safe Campus Matching</Text>
                <Text style={styles.infoDesc}>
                  Explore student profiles from your faculty and discover real university connections.
                </Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <Button
            title="Start Discovering"
            onPress={handleEnterApp}
            showArrow
            style={styles.continueBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
  },
  celebrationCircle: {
    position: 'relative',
    marginBottom: 24,
  },
  innerCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  heartSticker: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  title: {
    ...typography.h1,
    fontSize: 30,
    lineHeight: 36,
    color: colors.primaryDeep,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 22,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    marginBottom: 32,
    ...shadows.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  infoTitle: {
    ...typography.label,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  infoDesc: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  continueBtn: {
    width: '100%',
  },
});


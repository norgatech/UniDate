/**
 * UniDate — Login Screen
 * Clean, modern, premium authentication screen.
 * Supports Android, iOS, and Web.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Mail, Lock, ArrowLeft, Sparkles } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows, spacing } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuthStore } from '../../src/stores/authStore';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setHasCompletedOnboarding = useAuthStore((state) => state.setHasCompletedOnboarding);

  const validate = (): boolean => {
    const errs: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!EMAIL_RE.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (isSubmitting) return; // Prevent duplicate submissions
    if (!validate()) return;

    setIsSubmitting(true);
    setGeneralError(undefined);

    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          // Provide friendly user-facing messages
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            setGeneralError('Invalid email or password. Please verify and try again.');
          } else if (error.message.toLowerCase().includes('email not confirmed')) {
            setGeneralError('Please verify your email address before logging in.');
          } else {
            setGeneralError(error.message);
          }
          setIsSubmitting(false);
          return;
        }

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || email.trim(),
            created_at: data.user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          // Fetch student profile if it exists
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profileData && profileData.is_profile_complete) {
            setProfile(profileData);
            setHasCompletedOnboarding(true);
            router.replace('/(tabs)');
          } else {
            // Profile incomplete, send to onboarding flow
            setHasCompletedOnboarding(false);
            router.push('/(onboarding)/eligibility');
          }
          return;
        }
      } else {
        // Fallback simulation when unconfigured in local development
        setUser({
          id: 'usr_' + Date.now(),
          email: email.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setHasCompletedOnboarding(true);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentWrapper}>
            {/* Top Navigation */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
                accessibilityLabel="Go back"
              >
                <ArrowLeft size={20} color={colors.primary} />
              </TouchableOpacity>

              <View style={styles.badgePill}>
                <Sparkles size={14} color={colors.purpleAccent} />
                <Text style={styles.badgePillText}>Campus Verified</Text>
              </View>
            </View>

            {/* Header branding */}
            <View style={styles.titleSection}>
              <Text style={styles.welcomeLabel}>Welcome to</Text>
              <Text style={styles.brandTitle}>UniDate</Text>
              <Text style={styles.subtitle}>
                Connect with verified students from your campus
              </Text>
            </View>

            {/* Login Card */}
            <View style={styles.card}>
              {generalError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{generalError}</Text>
                </View>
              ) : null}

              {/* Email Address */}
              <Input
                label="Email Address"
                placeholder="e.g. yourname@university.edu"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  if (generalError) setGeneralError(undefined);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
                leftIcon={<Mail size={20} color={colors.textSecondary} />}
              />

              {/* Password */}
              <Input
                label="Password"
                placeholder="Your password"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  if (generalError) setGeneralError(undefined);
                }}
                variant="password"
                autoComplete="current-password"
                error={errors.password}
                helper={!errors.password ? 'Must contain at least 8 characters' : undefined}
                leftIcon={<Lock size={20} color={colors.textSecondary} />}
              />

              {/* Forgot password */}
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => router.push('/(auth)/forgot-password')}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Log In Button */}
              <Button
                title="Log In"
                onPress={handleLogin}
                loading={isSubmitting}
                disabled={isSubmitting}
                showArrow
              />

              {/* OR Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Create Account Button */}
              <Button
                title="Create Account"
                variant="secondary"
                onPress={() => router.push('/(auth)/register')}
                disabled={isSubmitting}
              />

              {/* Footer text */}
              <View style={styles.footerLinkRow}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => {
                    // Already on login page, scroll to top or re-focus
                    setGeneralError(undefined);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.footerLinkBold}>Log in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 460,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.purpleLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  badgePillText: {
    ...typography.captionSmall,
    color: colors.purple,
    fontWeight: '700',
  },
  titleSection: {
    marginBottom: 24,
  },
  welcomeLabel: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  brandTitle: {
    ...typography.h1,
    fontSize: 32,
    lineHeight: 38,
    color: colors.primaryDeep,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 15,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  errorBanner: {
    backgroundColor: '#FDEDED',
    borderColor: '#F5C6CB',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    ...typography.captionSmall,
    color: colors.error,
    fontWeight: '600',
    lineHeight: 18,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    ...typography.supporting,
    color: colors.primary,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  footerLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: {
    ...typography.supporting,
    color: colors.textSecondary,
  },
  footerLinkBold: {
    ...typography.supporting,
    color: colors.primary,
    fontWeight: '700',
  },
});

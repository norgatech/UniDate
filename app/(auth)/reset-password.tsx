/**
 * UniDate — Reset Password Screen
 * Handles the deep-link callback from Supabase password-reset emails.
 * Route: /(auth)/reset-password
 *
 * Supabase sends the user to this URL with a token_hash + type=recovery in the
 * query string (web) or via the app's deep-link scheme (native). We call
 * supabase.auth.verifyOtp() to exchange the token for a session, then allow
 * the user to set a new password.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, CheckCircle2, ArrowLeft } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token_hash?: string; type?: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [generalError, setGeneralError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [done, setDone] = useState(false);

  /* ── Exchange the recovery token for a live session on mount ── */
  useEffect(() => {
    const tokenHash = params.token_hash;
    const type = params.type;

    if (!tokenHash || type !== 'recovery') {
      // No token — arrived here directly (e.g. developer navigation).
      // Allow the form but skip OTP exchange.
      setSessionReady(true);
      return;
    }

    if (!isSupabaseConfigured()) {
      setSessionReady(true);
      return;
    }

    setIsVerifying(true);
    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type: 'recovery' })
      .then(({ error }) => {
        if (error) {
          setGeneralError(
            'This reset link is invalid or has expired. Please request a new one.'
          );
        } else {
          setSessionReady(true);
        }
      })
      .finally(() => setIsVerifying(false));
  }, []);

  /* ── Validation ── */
  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your new password';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Submit new password ── */
  const handleReset = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setGeneralError(undefined);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          setGeneralError(error.message);
          return;
        }
        await supabase.auth.signOut(); // force fresh login for security
      }
      setDone(true);
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Success state ── */
  if (done) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.contentWrapper}>
            <View style={styles.card}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={40} color={colors.success} />
              </View>
              <Text style={styles.successTitle}>Password Updated!</Text>
              <Text style={styles.successBody}>
                Your password has been successfully changed.{'\n'}
                Please log in with your new password.
              </Text>
              <Button
                title="Go to Login"
                onPress={() => router.replace('/(auth)/login')}
                style={{ marginTop: 24 }}
                showArrow
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ── Loading / verifying token ── */
  if (isVerifying) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredLoader}>
          <Text style={styles.loaderText}>Verifying reset link…</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ── Main form ── */
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push('/(auth)/forgot-password')}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.titleSection}>
              <Text style={styles.title}>Set New Password</Text>
              <Text style={styles.subtitle}>
                Choose a strong new password for your UniDate account.
              </Text>
            </View>

            <View style={styles.card}>
              {generalError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{generalError}</Text>
                  {!sessionReady && (
                    <TouchableOpacity
                      onPress={() => router.replace('/(auth)/forgot-password')}
                      style={{ marginTop: 8 }}
                    >
                      <Text style={[styles.errorBannerText, { color: colors.primary, textDecorationLine: 'underline' }]}>
                        Request a new reset link →
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}

              <Input
                label="New Password"
                placeholder="Min. 8 characters"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setErrors((p) => ({ ...p, password: undefined }));
                }}
                variant="password"
                autoComplete="new-password"
                error={errors.password}
                helper={!errors.password ? 'Must contain at least 8 characters' : undefined}
                leftIcon={<Lock size={20} color={colors.textSecondary} />}
                editable={sessionReady}
              />

              <Input
                label="Confirm New Password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChangeText={(v) => {
                  setConfirmPassword(v);
                  setErrors((p) => ({ ...p, confirmPassword: undefined }));
                }}
                variant="password"
                autoComplete="new-password"
                error={errors.confirmPassword}
                leftIcon={<Lock size={20} color={colors.textSecondary} />}
                editable={sessionReady}
              />

              <Button
                title="Update Password"
                onPress={handleReset}
                loading={isSubmitting}
                disabled={!sessionReady || isSubmitting}
                showArrow
                style={{ marginTop: 8 }}
              />
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
  keyboardContainer: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 480,
  },
  centeredLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleSection: {
    marginBottom: 28,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 22,
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    ...typography.captionSmall,
    color: '#D32F2F',
    fontWeight: '600',
  },

  // Success
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  successTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  successBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});


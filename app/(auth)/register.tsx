/**
 * UniDate — Register Screen
 * Full registration: name, email, password, confirm password, terms acceptance.
 * Connects to Supabase Auth. Web-safe (no Alert.alert / Alert.prompt).
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
import { ArrowLeft, User, Mail, Lock, CheckSquare, Square } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuthStore } from '../../src/stores/authStore';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const setUser = useAuthStore((state) => state.setUser);

  /* ── Validation ── */
  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Please enter your full name (at least 2 characters)';
    }
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
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!termsAccepted) {
      errs.terms = 'You must accept the Terms of Service and Privacy Policy';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearFieldError = (field: keyof FormErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  /* ── Submit ── */
  const handleRegister = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setGeneralError(undefined);

    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });

        if (error) {
          setGeneralError(error.message);
          return;
        }

        if (data.user) {
          // Supabase may auto-confirm in dev mode (session present) or require email verification
          const needsEmailVerification =
            data.session === null ||
            data.user.email_confirmed_at === null ||
            data.user.email_confirmed_at === undefined;

          if (needsEmailVerification) {
            setRegisteredEmail(email.trim());
            setVerificationSent(true);
            return;
          }

          // Auto-confirmed (dev): set user and go to onboarding
          setUser({
            id: data.user.id,
            email: data.user.email || email.trim(),
            created_at: data.user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          router.push('/(onboarding)/eligibility');
        }
      } else {
        // Dev fallback — no Supabase configured
        setUser({
          id: 'usr_' + Date.now(),
          email: email.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        router.push('/(onboarding)/eligibility');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Email Verification Confirmation State ── */
  if (verificationSent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            <View style={styles.card}>
              <View style={styles.successIconCircle}>
                <Mail size={36} color={colors.primary} />
              </View>
              <Text style={styles.successTitle}>Verify your email</Text>
              <Text style={styles.successBody}>
                We sent a confirmation link to{'\n'}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  {registeredEmail}
                </Text>
                {'\n\n'}Open your email and click the link to activate your UniDate account.
                Then come back and log in.
              </Text>
              <Button
                title="Go to Login"
                onPress={() => router.replace('/(auth)/login')}
                style={{ marginTop: 24 }}
                showArrow
              />
              <TouchableOpacity
                style={styles.resendRow}
                onPress={() => setVerificationSent(false)}
              >
                <Text style={styles.resendText}>Wrong email? Go back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ── Main Registration Form ── */
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
            {/* Back */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color={colors.primary} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.titleSection}>
              <Text style={styles.welcomeLabel}>Welcome to</Text>
              <Text style={styles.brandName}>UniDate</Text>
              <Text style={styles.subtitle}>
                Create your verified student account
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              {generalError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{generalError}</Text>
                </View>
              ) : null}

              <Input
                label="Full Name"
                placeholder="e.g. Ama Owusu"
                value={fullName}
                onChangeText={(v) => {
                  setFullName(v);
                  clearFieldError('fullName');
                }}
                autoCapitalize="words"
                autoComplete="name"
                error={errors.fullName}
                leftIcon={<User size={20} color={colors.textSecondary} />}
              />

              <Input
                label="Email Address"
                placeholder="e.g. yourname@university.edu.gh"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  clearFieldError('email');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
                leftIcon={<Mail size={20} color={colors.textSecondary} />}
              />

              <Input
                label="Password"
                placeholder="Min. 8 characters"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  clearFieldError('password');
                }}
                variant="password"
                autoComplete="new-password"
                error={errors.password}
                helper={!errors.password ? 'Must contain at least 8 characters' : undefined}
                leftIcon={<Lock size={20} color={colors.textSecondary} />}
              />

              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={(v) => {
                  setConfirmPassword(v);
                  clearFieldError('confirmPassword');
                }}
                variant="password"
                autoComplete="new-password"
                error={errors.confirmPassword}
                leftIcon={<Lock size={20} color={colors.textSecondary} />}
              />

              {/* Terms checkbox */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => {
                  setTermsAccepted(!termsAccepted);
                  clearFieldError('terms');
                }}
                activeOpacity={0.75}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: termsAccepted }}
              >
                {termsAccepted ? (
                  <CheckSquare size={20} color={colors.primary} />
                ) : (
                  <Square size={20} color={errors.terms ? colors.error : colors.textSecondary} />
                )}
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
              {errors.terms ? (
                <Text style={styles.termsError}>{errors.terms}</Text>
              ) : null}

              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={isSubmitting}
                showArrow
                style={{ marginTop: 20 }}
              />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Log In Instead"
                variant="secondary"
                onPress={() => router.replace('/(auth)/login')}
              />

              <View style={styles.footerLinkRow}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
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
    paddingTop: 24,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 480,
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
    marginBottom: 24,
  },
  welcomeLabel: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '600',
  },
  brandName: {
    ...typography.h1,
    color: colors.primaryDeep,
    fontWeight: '800',
    marginTop: -4,
    marginBottom: 6,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: -4,
    marginBottom: 4,
  },
  termsText: {
    ...typography.supporting,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  termsError: {
    ...typography.captionSmall,
    color: colors.error,
    marginTop: 4,
    marginBottom: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  footerLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
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

  // Email verification state
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.pink,
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
    marginBottom: 12,
  },
  successBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    ...typography.supporting,
    color: colors.primary,
    fontWeight: '600',
  },
});


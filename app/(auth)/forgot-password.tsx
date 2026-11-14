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
import { ArrowLeft, Mail, CheckCircle2, KeyRound } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setError(undefined);
    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured()) {
        // Construct a reset redirect URL for web / mobile deep links
        const redirectUrl =
          Platform.OS === 'web' && typeof window !== 'undefined'
            ? `${window.location.origin}/(auth)/reset-password`
            : undefined;

        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: redirectUrl,
        });

        if (resetErr) {
          setError(resetErr.message);
          setIsSubmitting(false);
          return;
        }
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
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
                <KeyRound size={14} color={colors.purpleAccent} />
                <Text style={styles.badgePillText}>Account Recovery</Text>
              </View>
            </View>

            <View style={styles.titleSection}>
              <Text style={styles.welcomeLabel}>Password Recovery</Text>
              <Text style={styles.brandTitle}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your registered campus email address and we will send password recovery instructions.
              </Text>
            </View>

            <View style={styles.card}>
              {submitted ? (
                <View style={styles.successState}>
                  <View style={styles.successIconWrapper}>
                    <CheckCircle2 size={42} color={colors.success} />
                  </View>
                  <Text style={styles.successTitle}>Check Your Inbox</Text>
                  <Text style={styles.successText}>
                    We sent a password reset link to{' '}
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>
                      {email.trim()}
                    </Text>
                    .{'\n\n'}
                    Follow the instructions in the email to set a new password, then return to log in.
                  </Text>
                  <Button
                    title="Return to Login"
                    onPress={() => router.replace('/(auth)/login')}
                    style={{ marginTop: 24 }}
                    showArrow
                  />
                  <TouchableOpacity
                    style={styles.tryAnotherRow}
                    onPress={() => setSubmitted(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.tryAnotherText}>Try another email</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Input
                    label="Registered Email"
                    placeholder="e.g. yourname@university.edu"
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (error) setError(undefined);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={error}
                    leftIcon={<Mail size={20} color={colors.textSecondary} />}
                  />

                  <Button
                    title="Send Reset Link"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={{ marginTop: 8 }}
                    showArrow
                  />

                  <View style={styles.footerLinkRow}>
                    <Text style={styles.footerText}>Remember your password? </Text>
                    <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                      <Text style={styles.footerLinkBold}>Log in</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
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
  successState: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
  },
  successText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  tryAnotherRow: {
    marginTop: 16,
    paddingVertical: 4,
  },
  tryAnotherText: {
    ...typography.supporting,
    color: colors.primary,
    fontWeight: '600',
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

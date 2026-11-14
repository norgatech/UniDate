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
import { Mail, Lock } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuthStore } from '../../src/stores/authStore';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WelcomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);

  const validate = () => {
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

  const handleCreateAccount = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setGeneralError(undefined);

    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          setGeneralError(error.message);
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
          // Proceed to adult eligibility gate
          router.push('/(onboarding)/eligibility');
          return;
        }
      } else {
        // Fallback simulated signup when running without credentials
        setUser({
          id: 'usr_' + Date.now(),
          email: email.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        router.push('/(onboarding)/eligibility');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'An error occurred during account creation.');
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
            {/* Decorative Corner Accents */}
            <View style={styles.topRightGlow} />
            <View style={styles.bottomLeftGlow} />

            {/* Logo Brand Header */}
            <View style={styles.header}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                contentFit="contain"
              />
              <Text style={styles.brandTitle}>Welcome to</Text>
              <Text style={styles.brandSubtitle}>UniDate</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              {generalError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{generalError}</Text>
                </View>
              ) : null}

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

              <Input
                label="Password"
                placeholder="Min. 8 characters"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  if (generalError) setGeneralError(undefined);
                }}
                variant="password"
                autoComplete="new-password"
                error={errors.password}
                helper="Must contain at least 8 characters"
                leftIcon={<Lock size={20} color={colors.textSecondary} />}
              />

              <View style={styles.submitButtonContainer}>
                <Button
                  title="Create Account"
                  onPress={handleCreateAccount}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  showArrow
                />
              </View>

              {/* Login Link */}
              <View style={styles.footerLinkRow}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
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
    maxWidth: 460,
    position: 'relative',
  },
  topRightGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.pink,
    opacity: 0.6,
  },
  bottomLeftGlow: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent,
    opacity: 0.15,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 96,
    height: 96,
    marginBottom: 12,
  },
  brandTitle: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  brandSubtitle: {
    ...typography.h1,
    fontSize: 32,
    lineHeight: 38,
    color: colors.primaryDeep,
    fontWeight: '800',
    marginTop: -4,
  },
  formSection: {
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
  submitButtonContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  footerLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
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

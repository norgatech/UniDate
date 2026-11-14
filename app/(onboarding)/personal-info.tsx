/**
 * UniDate — Onboarding Screen 1: Personal Information
 * Validates full name, display name, gender, and enforces strict 18+ age requirement
 * calculated directly from Date of Birth.
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
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Calendar, AlertCircle, ShieldCheck, Check } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { OnboardingHeader } from '../../src/components/onboarding/OnboardingHeader';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { useAuthStore } from '../../src/stores/authStore';

const GENDERS: { value: 'female' | 'male' | 'non_binary' | 'prefer_not_to_say'; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non_binary', label: 'Non-Binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function PersonalInfoScreen() {
  const user = useAuthStore((state) => state.user);
  const store = useOnboardingStore();

  const [fullName, setFullName] = useState(store.fullName);
  const [displayName, setDisplayName] = useState(store.displayName);
  const [dob, setDob] = useState(store.dateOfBirth);
  const [gender, setGender] = useState(store.gender);

  const [errors, setErrors] = useState<{
    fullName?: string;
    displayName?: string;
    dob?: string;
  }>({});

  useEffect(() => {
    store.loadSavedDraft(user?.id);
  }, [user?.id]);

  useEffect(() => {
    if (store.fullName && !fullName) setFullName(store.fullName);
    if (store.displayName && !displayName) setDisplayName(store.displayName);
    if (store.dateOfBirth && !dob) setDob(store.dateOfBirth);
    if (store.gender) setGender(store.gender);
  }, [store.fullName, store.displayName, store.dateOfBirth, store.gender]);

  // Dynamic age calculation from YYYY-MM-DD
  const calculateAge = (birthDateStr: string): number | null => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDateStr)) return null;
    const parts = birthDateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const birthDate = new Date(year, month, day);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculatedAge = calculateAge(dob);
  const isAdult = calculatedAge !== null && calculatedAge >= 18 && calculatedAge < 100;
  const isUnderage = calculatedAge !== null && calculatedAge < 18;

  const validate = (): boolean => {
    const errs: typeof errors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Full legal name is required (min 2 characters)';
    }

    if (!displayName.trim() || displayName.trim().length < 2) {
      errs.displayName = 'Display name is required (this is shown on your profile)';
    }

    if (!dob.trim()) {
      errs.dob = 'Date of birth is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
      errs.dob = 'Please enter a valid date in YYYY-MM-DD format (e.g. 2003-05-15)';
    } else if (calculatedAge === null || calculatedAge <= 0) {
      errs.dob = 'Please enter a valid past birth date';
    } else if (calculatedAge < 18) {
      errs.dob = `UniDate is strictly restricted to students aged 18 and older. (Calculated age: ${calculatedAge})`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    if (!isAdult) return;

    store.updateData({
      fullName: fullName.trim(),
      displayName: displayName.trim(),
      dateOfBirth: dob.trim(),
      age: calculatedAge,
      gender,
    });
    store.markStepComplete(1);
    await store.saveDraft(user?.id);

    router.push('/(onboarding)/university');
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
            <OnboardingHeader
              currentStep={1}
              totalSteps={8}
              title="Personal Information"
              subtitle="Tell us your basic details to start setting up your campus profile."
            />

            <View style={styles.card}>
              {/* Full Name */}
              <Input
                label="Full Legal Name"
                placeholder="e.g. Ama Serwaa Owusu"
                value={fullName}
                onChangeText={(v) => {
                  setFullName(v);
                  if (errors.fullName) setErrors((p) => ({ ...p, fullName: undefined }));
                  if (!displayName) setDisplayName(v.split(' ')[0] || '');
                }}
                autoCapitalize="words"
                autoComplete="name"
                error={errors.fullName}
                helper="Required for student matriculation verification"
                leftIcon={<User size={18} color={colors.textSecondary} />}
              />

              {/* Preferred Display Name */}
              <Input
                label="Preferred Display Name"
                placeholder="e.g. Ama or Serwaa"
                value={displayName}
                onChangeText={(v) => {
                  setDisplayName(v);
                  if (errors.displayName) setErrors((p) => ({ ...p, displayName: undefined }));
                }}
                autoCapitalize="words"
                error={errors.displayName}
                helper="This is the name other campus members see"
                leftIcon={<User size={18} color={colors.textSecondary} />}
              />

              {/* Date of Birth */}
              <Input
                label="Date of Birth (YYYY-MM-DD)"
                placeholder="YYYY-MM-DD (e.g. 2003-08-14)"
                value={dob}
                onChangeText={(v) => {
                  setDob(v);
                  if (errors.dob) setErrors((p) => ({ ...p, dob: undefined }));
                }}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
                error={errors.dob}
                leftIcon={<Calendar size={18} color={colors.textSecondary} />}
              />

              {/* Dynamic Age Badge Indicator */}
              {calculatedAge !== null && (
                <View
                  style={[
                    styles.ageBadge,
                    isAdult ? styles.ageBadgeSuccess : styles.ageBadgeError,
                  ]}
                >
                  {isAdult ? (
                    <>
                      <ShieldCheck size={16} color={colors.success} />
                      <Text style={styles.ageBadgeSuccessText}>
                        Age: {calculatedAge} • Confirmed 18+ Adult Student
                      </Text>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} color={colors.error} />
                      <Text style={styles.ageBadgeErrorText}>
                        Age: {calculatedAge} • Under 18 years old (Ineligible)
                      </Text>
                    </>
                  )}
                </View>
              )}

              {/* Gender Selection */}
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.genderOptionsGrid}>
                {GENDERS.map((g) => {
                  const isSelected = gender === g.value;
                  return (
                    <TouchableOpacity
                      key={g.value}
                      style={[styles.genderChip, isSelected && styles.genderChipActive]}
                      onPress={() => setGender(g.value)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.genderRadio, isSelected && styles.genderRadioActive]}>
                        {isSelected && <Check size={12} color={colors.white} />}
                      </View>
                      <Text style={[styles.genderChipText, isSelected && styles.genderChipTextActive]}>
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Button
                title="Continue to University"
                onPress={handleContinue}
                disabled={!isAdult}
                showArrow
                style={{ marginTop: 24 }}
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
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 480,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 4,
  },
  ageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
    marginTop: -8,
    marginBottom: 16,
    borderWidth: 1,
  },
  ageBadgeSuccess: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  ageBadgeSuccessText: {
    ...typography.captionSmall,
    color: colors.success,
    fontWeight: '700',
  },
  ageBadgeError: {
    backgroundColor: '#FDEDED',
    borderColor: '#F5C6CB',
  },
  ageBadgeErrorText: {
    ...typography.captionSmall,
    color: colors.error,
    fontWeight: '700',
  },
  genderOptionsGrid: {
    gap: 8,
    marginBottom: 8,
  },
  genderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#FAFAFA',
  },
  genderChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.pink,
  },
  genderRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: colors.surface,
  },
  genderRadioActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  genderChipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  genderChipTextActive: {
    color: colors.primaryDeep,
    fontWeight: '700',
  },
});


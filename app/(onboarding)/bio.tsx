/**
 * UniDate — Onboarding Screen 6: Personal Bio & Intentions
 * Collects "About me", "Favourite activities", and "What I am looking for"
 * with live character counters and input validation.
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
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Activity, Compass, Check } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { OnboardingHeader } from '../../src/components/onboarding/OnboardingHeader';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { useAuthStore } from '../../src/stores/authStore';
import { CONNECTION_INTENTIONS, ConnectionIntention } from '../../src/types';

const BIO_MAX_LENGTH = 300;
const ACTIVITIES_MAX_LENGTH = 150;

export default function PersonalBioScreen() {
  const user = useAuthStore((state) => state.user);
  const store = useOnboardingStore();

  const [bio, setBio] = useState(store.bio || '');
  const [favouriteActivities, setFavouriteActivities] = useState(store.favouriteActivities || '');
  const [intention, setIntention] = useState<ConnectionIntention>(
    store.connectionIntention || 'serious_relationship'
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!bio.trim() || bio.trim().length < 10) {
      setErrorMsg('Please write at least 10 characters in your bio.');
      return false;
    }
    return true;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    store.updateData({
      bio: bio.trim(),
      favouriteActivities: favouriteActivities.trim(),
      connectionIntention: intention,
    });
    store.markStepComplete(6);
    await store.saveDraft(user?.id);

    router.push('/(onboarding)/verification');
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
              currentStep={6}
              totalSteps={8}
              title="Personal Bio"
              subtitle="Introduce yourself to fellow students and share what kind of connections you seek."
            />

            <View style={styles.card}>
              {errorMsg ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* 1. About Me */}
              <View style={styles.fieldSection}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>About Me</Text>
                  <Text style={styles.charCounter}>
                    {bio.length}/{BIO_MAX_LENGTH}
                  </Text>
                </View>

                <TextInput
                  style={styles.textArea}
                  placeholder="Share a little about who you are, what you study, and your campus passions..."
                  placeholderTextColor={colors.textSecondary}
                  value={bio}
                  onChangeText={(text) => {
                    if (text.length <= BIO_MAX_LENGTH) {
                      setBio(text);
                      if (errorMsg) setErrorMsg(null);
                    }
                  }}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* 2. Favourite Activities */}
              <View style={styles.fieldSection}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Favourite Campus Activities</Text>
                  <Text style={styles.charCounter}>
                    {favouriteActivities.length}/{ACTIVITIES_MAX_LENGTH}
                  </Text>
                </View>

                <TextInput
                  style={[styles.textArea, { minHeight: 70 }]}
                  placeholder="e.g. Debate club, evening campus runs, studying at Balme library..."
                  placeholderTextColor={colors.textSecondary}
                  value={favouriteActivities}
                  onChangeText={(text) => {
                    if (text.length <= ACTIVITIES_MAX_LENGTH) {
                      setFavouriteActivities(text);
                    }
                  }}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>

              {/* 3. Connection Intention ("What I am looking for") */}
              <View style={styles.fieldSection}>
                <Text style={styles.label}>What I Am Looking For</Text>
                <View style={styles.intentionsGrid}>
                  {CONNECTION_INTENTIONS.map((item) => {
                    const isSelected = intention === item.value;
                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[styles.intentionCard, isSelected && styles.intentionCardActive]}
                        onPress={() => setIntention(item.value)}
                        activeOpacity={0.75}
                      >
                        <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                          {isSelected && <Check size={12} color={colors.white} />}
                        </View>
                        <Text style={[styles.intentionLabel, isSelected && styles.intentionLabelActive]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <Button
                title="Continue to Student Verification"
                onPress={handleContinue}
                showArrow
                style={{ marginTop: 20 }}
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
    color: colors.error,
    fontWeight: '600',
  },
  fieldSection: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  charCounter: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#FAFAFA',
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
    minHeight: 100,
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  intentionsGrid: {
    gap: 8,
    marginTop: 8,
  },
  intentionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#FAFAFA',
  },
  intentionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.pink,
  },
  radioCircle: {
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
  radioCircleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  intentionLabel: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  intentionLabelActive: {
    color: colors.primaryDeep,
    fontWeight: '700',
  },
});


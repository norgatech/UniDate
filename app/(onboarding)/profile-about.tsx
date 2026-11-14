import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Calendar, FileText } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radii } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';

export default function ProfileAboutScreen() {
  const params = useLocalSearchParams();

  const [displayName, setDisplayName] = useState((params.fullName as string) || 'Sarah');
  const [dob, setDob] = useState('2003-05-15');
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [bio, setBio] = useState(
    'Love books, Coffee, and deep conversations. Passionate about arts and psychology!'
  );
  const [errors, setErrors] = useState<{ displayName?: string; dob?: string }>({});

  const validate = () => {
    const errs: { displayName?: string; dob?: string } = {};
    if (!displayName.trim()) errs.displayName = 'Display name is required';

    // Age calculation
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (isNaN(birthDate.getTime()) || age < 18) {
      errs.dob = 'You must be at least 18 years old to join';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;

    router.push({
      pathname: '/(onboarding)/profile-interests',
      params: {
        ...params,
        displayName: displayName.trim(),
        dob,
        gender,
        bio: bio.trim(),
      },
    });
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
            {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.titleSection}>
            <Text style={styles.title}>Tell Us About You</Text>
            <Text style={styles.subtitle}>Help your campus peers get to know the real you</Text>
          </View>

          <View style={styles.card}>
            <Input
              label="Display Name"
              placeholder="First name or nickname"
              value={displayName}
              onChangeText={(val) => {
                setDisplayName(val);
                if (errors.displayName) setErrors((prev) => ({ ...prev, displayName: undefined }));
              }}
              error={errors.displayName}
              leftIcon={<User size={18} color={colors.textSecondary} />}
            />

            <Input
              label="Date of Birth"
              placeholder="YYYY-MM-DD (e.g. 2003-05-15)"
              value={dob}
              onChangeText={(val) => {
                setDob(val);
                if (errors.dob) setErrors((prev) => ({ ...prev, dob: undefined }));
              }}
              error={errors.dob}
              helper="Must be 18 or older. Age is shown on your card."
              leftIcon={<Calendar size={18} color={colors.textSecondary} />}
            />

            {/* Gender Selector matching reference */}
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderPill, gender === 'male' && styles.genderPillSelected]}
                onPress={() => setGender('male')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.genderPillText,
                    gender === 'male' && styles.genderPillTextSelected,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.genderPill, gender === 'female' && styles.genderPillSelected]}
                onPress={() => setGender('female')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.genderPillText,
                    gender === 'female' && styles.genderPillTextSelected,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>

            {/* About Me */}
            <Input
              label="About Me"
              placeholder="Write about yourself, hobbies, or what makes you smile..."
              value={bio}
              onChangeText={setBio}
              variant="textarea"
              helper="Max 300 characters"
              leftIcon={<FileText size={18} color={colors.textSecondary} />}
            />

            <View style={styles.actionContainer}>
              <Button
                title="Continue"
                onPress={handleContinue}
                showArrow
              />
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
    paddingTop: 12,
    paddingBottom: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 22,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  genderPill: {
    flex: 1,
    height: 48,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderPillText: {
    ...typography.buttonSmall,
    color: colors.textPrimary,
  },
  genderPillTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  actionContainer: {
    marginTop: 12,
  },
});


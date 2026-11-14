import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldAlert, Check, ArrowRight } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radii } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/stores/authStore';

export default function EligibilityScreen() {
  const [isAdult, setIsAdult] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [agreedGuidelines, setAgreedGuidelines] = useState(false);

  const setIsEligible = useAuthStore((state) => state.setIsEligible);

  const canProceed = isAdult && isStudent && agreedGuidelines;

  const handleContinue = () => {
    if (!canProceed) return;
    setIsEligible(true);
    router.push('/(onboarding)/personal-info');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {/* Shield Icon Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <ShieldAlert size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>18+ Community Gate</Text>
            <Text style={styles.subtitle}>
              UniDate is exclusively for verified adult university students.
            </Text>
          </View>

          {/* Requirements Card */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Strict Safety & Verification Policy</Text>
            <Text style={styles.cardNotice}>
              To protect our collegiate community, every member must meet our age and university verification requirements before accessing matching or messaging.
            </Text>

            {/* Checkbox 1: 18+ */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsAdult(!isAdult)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, isAdult && styles.checkboxActive]}>
                {isAdult && <Check size={16} color={colors.white} />}
              </View>
              <View style={styles.checkboxLabelContainer}>
                <Text style={styles.checkboxTitle}>I am at least 18 years of age</Text>
                <Text style={styles.checkboxDesc}>
                  I understand minors are strictly prohibited from using UniDate.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Checkbox 2: Currently Enrolled */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsStudent(!isStudent)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, isStudent && styles.checkboxActive]}>
                {isStudent && <Check size={16} color={colors.white} />}
              </View>
              <View style={styles.checkboxLabelContainer}>
                <Text style={styles.checkboxTitle}>I am an active university student</Text>
                <Text style={styles.checkboxDesc}>
                  I have a valid student matriculation number or institutional email.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Checkbox 3: Community Guidelines */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreedGuidelines(!agreedGuidelines)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreedGuidelines && styles.checkboxActive]}>
                {agreedGuidelines && <Check size={16} color={colors.white} />}
              </View>
              <View style={styles.checkboxLabelContainer}>
                <Text style={styles.checkboxTitle}>I agree to the Community Guidelines</Text>
                <Text style={styles.checkboxDesc}>
                  Zero tolerance for harassment, fake profiles, unsolicited content, or impersonation.
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Confirm & Continue"
              onPress={handleContinue}
              disabled={!canProceed}
              showArrow
            />
          </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
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
    marginVertical: 12,
  },
  cardHeading: {
    ...typography.h3,
    color: colors.primaryDeep,
    marginBottom: 8,
  },
  cardNotice: {
    ...typography.supporting,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
    backgroundColor: colors.surface,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabelContainer: {
    flex: 1,
  },
  checkboxTitle: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  checkboxDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
});


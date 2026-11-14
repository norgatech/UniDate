import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radii } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { VerifiedBadge } from '../../src/components/ui/VerifiedBadge';

export default function VerificationStatusScreen() {
  const params = useLocalSearchParams<{
    status?: string;
    fullName?: string;
    matricNumber?: string;
    uniName?: string;
    faculty?: string;
    department?: string;
    level?: string;
  }>();

  const status = (params.status as 'pending' | 'verified' | 'rejected') || 'pending';
  const fullName = params.fullName || 'Student';
  const uniName = params.uniName || 'University of Ghana';
  const level = params.level || '300';
  const faculty = params.faculty || 'Science';

  const handleContinueToProfile = () => {
    router.push({
      pathname: '/(onboarding)/profile-photos',
      params: {
        fullName,
        uniName,
        faculty,
        level,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {/* Status Illustration */}
        <View style={styles.statusBox}>
          {status === 'verified' ? (
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
              <CheckCircle2 size={54} color={colors.success} />
            </View>
          ) : (
            <View style={[styles.iconCircle, { backgroundColor: '#FFF3E0' }]}>
              <Clock size={54} color={colors.warning} />
            </View>
          )}

          <Text style={styles.statusHeading}>
            {status === 'verified' ? 'Student ID Verified!' : 'Verification Under Review'}
          </Text>

          <Text style={styles.statusMessage}>
            {status === 'verified'
              ? 'Congratulations! Your student credentials have been confirmed. You now have full access to UniDate.'
              : 'Your student documents were submitted securely. Our review team typically verifies credentials in under 15 minutes.'}
          </Text>
        </View>

        {/* Verification Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Submitted Credentials</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Student Name</Text>
            <Text style={styles.infoValue}>{fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>University</Text>
            <Text style={styles.infoValue}>{uniName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Faculty</Text>
            <Text style={styles.infoValue}>{faculty}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Level</Text>
            <Text style={styles.infoValue}>{level}L</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Review Status</Text>
            <View style={styles.badgePill}>
              {status === 'verified' ? (
                <VerifiedBadge size={14} />
              ) : (
                <ShieldCheck size={12} color={colors.warning} />
              )}
              <Text
                style={[
                  styles.badgePillText,
                  { color: status === 'verified' ? colors.verifiedText : colors.warning },
                ]}
              >
                {status === 'verified' ? 'Verified Student' : 'Pending Verification'}
              </Text>
            </View>
          </View>
        </View>

        {/* Notice Card */}
        <View style={styles.helperCard}>
          <Text style={styles.helperTitle}>What's next?</Text>
          <Text style={styles.helperText}>
            You can set up your dating profile, photos, and interests right now while verification finishes in the background.
          </Text>
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Create Student Profile"
            onPress={handleContinueToProfile}
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
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 480,
  },
  statusBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  statusHeading: {
    ...typography.h1,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  statusMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginVertical: 12,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.primaryDeep,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.supporting,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.supporting,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  badgePillText: {
    ...typography.captionSmall,
    fontWeight: '700',
  },
  helperCard: {
    backgroundColor: colors.pink,
    padding: 16,
    borderRadius: radii.xl,
    marginVertical: 8,
  },
  helperTitle: {
    ...typography.label,
    color: colors.primaryDeep,
    fontWeight: '700',
    marginBottom: 4,
  },
  helperText: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: 20,
  },
});


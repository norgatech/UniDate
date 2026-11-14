import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ShieldAlert, Check } from 'lucide-react-native';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing, radii } from '../src/theme/spacing';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { ReportReason } from '../src/types';
import { safetyService } from '../src/services/safetyService';

const REPORT_REASONS: { id: ReportReason; label: string; desc: string }[] = [
  { id: 'fake_profile', label: 'Fake Profile / Impersonation', desc: 'Not a real student or using stolen photos' },
  { id: 'harassment', label: 'Harassment / Abusive Messages', desc: 'Threats, offensive language, or bullying' },
  { id: 'inappropriate_content', label: 'Inappropriate Content', desc: 'Explicit photos or unacceptable bio content' },
  { id: 'underage', label: 'Under 18 / Not a Student', desc: 'Suspected minor or non-university individual' },
  { id: 'spam', label: 'Spam / Commercial Promotion', desc: 'Advertising, links, or automated behavior' },
  { id: 'other', label: 'Other Safety Concern', desc: 'Any other violation of our community standards' },
];

export default function ReportUserScreen() {
  const { reportedUserId, reportedUserName } = useLocalSearchParams<{
    reportedUserId?: string;
    reportedUserName?: string;
  }>();

  const [selectedReason, setSelectedReason] = useState<ReportReason>('fake_profile');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (reportedUserId) {
        await safetyService.reportUser(reportedUserId, selectedReason, details);
      }
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
      Alert.alert(
        'Report Submitted',
        'Thank you for helping keep our campus safe. Our student moderation team will review this report immediately.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <X size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report Profile</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.noticeBox}>
            <ShieldAlert size={22} color={colors.warning} />
            <Text style={styles.noticeText}>
              Reports are confidential. {reportedUserName || 'The user'} will not know you reported them.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Why are you reporting this user?</Text>

          {/* Reasons List */}
          <View style={styles.reasonsList}>
            {REPORT_REASONS.map((item) => {
              const isSelected = selectedReason === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.reasonRow, isSelected && styles.reasonRowSelected]}
                  onPress={() => setSelectedReason(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reasonLabel, isSelected && styles.reasonLabelSelected]}>
                      {item.label}
                    </Text>
                    <Text style={styles.reasonDesc}>{item.desc}</Text>
                  </View>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <Check size={12} color={colors.white} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Additional details */}
          <Input
            label="Additional Details (Optional)"
            placeholder="Tell us more about what happened..."
            value={details}
            onChangeText={setDetails}
            variant="textarea"
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Submit Report"
              variant="destructive"
              onPress={handleSubmit}
              loading={isSubmitting}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEB',
    padding: 14,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  noticeText: {
    ...typography.caption,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primaryDeep,
    fontWeight: '700',
    marginBottom: 12,
  },
  reasonsList: {
    gap: 10,
    marginBottom: 20,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  reasonRowSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF7F7',
  },
  reasonLabel: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  reasonLabelSelected: {
    color: colors.primary,
  },
  reasonDesc: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  radioCircleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonContainer: {
    marginTop: 8,
  },
});


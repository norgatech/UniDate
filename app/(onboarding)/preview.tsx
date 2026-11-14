/**
 * UniDate — Onboarding Screen 8: Profile Preview
 * Previews the completed profile card before final publication.
 * Allows inline editing shortcuts and commits final data to Supabase.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  School,
  Sparkles,
  Edit3,
  Heart,
  BookOpen,
  Compass,
  CheckCircle2,
  Clock,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { OnboardingHeader } from '../../src/components/onboarding/OnboardingHeader';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { useAuthStore } from '../../src/stores/authStore';
import { VerifiedBadge } from '../../src/components/ui/VerifiedBadge';
import { supabase } from '../../src/lib/supabase';

export default function ProfilePreviewScreen() {
  const user = useAuthStore((state) => state.user);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setHasCompletedOnboarding = useAuthStore((state) => state.setHasCompletedOnboarding);

  const store = useOnboardingStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const photo =
    store.primaryPhotoUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500';

  const handlePublish = async () => {
    setIsPublishing(true);
    setErrorMsg(null);

    let uid = user?.id;
    if (!uid) {
      const { data: authData } = await supabase.auth.getUser();
      uid = authData?.user?.id;
    }
    uid = uid || 'usr_demo';

    try {
      const res = await store.saveFinalProfileToSupabase(uid);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to save profile. Please try again.');
        setIsPublishing(false);
        return;
      }

      // Update authStore
      setHasCompletedOnboarding(true);
      await useAuthStore.getState().refreshProfile();

      // Navigate to Screen 9: Completion
      router.push('/(onboarding)/complete');
    } catch (e: any) {
      setErrorMsg(e.message || 'An unexpected error occurred.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          <OnboardingHeader
            currentStep={8}
            totalSteps={8}
            title="Profile Preview"
            subtitle="Review your campus profile before launching. You can edit any section anytime."
          />

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Profile Card Preview */}
          <View style={styles.card}>
            {/* Main Photo Banner */}
            <View style={styles.imageBox}>
              <Image source={{ uri: photo }} style={styles.profileImage} contentFit="cover" />

              {/* Status floating badge */}
              <View style={styles.floatingStatusBadge}>
                {store.verificationStatus === 'verified' ? (
                  <>
                    <VerifiedBadge size={14} />
                    <Text style={[styles.statusText, { color: colors.verifiedText }]}>Verified Student</Text>
                  </>
                ) : (
                  <>
                    <Clock size={14} color="#B45309" />
                    <Text style={[styles.statusText, { color: '#B45309' }]}>Verification Pending</Text>
                  </>
                )}
              </View>

              {/* Photo Edit Button */}
              <TouchableOpacity
                style={styles.editPhotoIcon}
                onPress={() => router.push('/(onboarding)/photo')}
                activeOpacity={0.8}
              >
                <Edit3 size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Profile Info Details */}
            <View style={styles.infoSection}>
              {/* Name & Age Row */}
              <View style={styles.nameHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nameText}>
                    {store.displayName || 'Sarah'}, {store.age || 21}
                  </Text>
                  <Text style={styles.academicSubtitle}>
                    {store.facultyName || 'Science'} • {store.departmentName || 'Computer Science'} ({store.level || '200'}L)
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.editSectionBtn}
                  onPress={() => router.push('/(onboarding)/personal-info')}
                  activeOpacity={0.7}
                >
                  <Edit3 size={15} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* University Location */}
              <View style={styles.metaRow}>
                <School size={16} color={colors.primary} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {store.universityName || 'University of Ghana'}
                </Text>
                <TouchableOpacity
                  style={{ marginLeft: 'auto' }}
                  onPress={() => router.push('/(onboarding)/university')}
                >
                  <Edit3 size={13} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Bio */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionLabelRow}>
                  <Text style={styles.sectionLabel}>About Me</Text>
                  <TouchableOpacity onPress={() => router.push('/(onboarding)/bio')}>
                    <Text style={styles.editLink}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.bioText}>
                  {store.bio || 'Excited to connect with ambitious campus students, exchange ideas, and explore university events.'}
                </Text>
              </View>

              {/* Interests Chips */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionLabelRow}>
                  <Text style={styles.sectionLabel}>Interests & Passions</Text>
                  <TouchableOpacity onPress={() => router.push('/(onboarding)/interests')}>
                    <Text style={styles.editLink}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.chipsRow}>
                  {(store.interests.length > 0 ? store.interests : ['Reading', 'Music', 'Tech']).map((item) => (
                    <View key={item} style={styles.chip}>
                      <Text style={styles.chipText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Final Confirmation Button */}
            <Button
              title="Confirm & Complete Profile"
              onPress={handlePublish}
              loading={isPublishing}
              disabled={isPublishing}
              showArrow
              style={{ marginTop: 14 }}
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
    padding: 16,
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
    width: '100%',
  },
  errorBannerText: {
    ...typography.captionSmall,
    color: colors.error,
    fontWeight: '600',
  },
  imageBox: {
    width: '100%',
    height: 320,
    borderRadius: radii.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.pink,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  floatingStatusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    ...shadows.sm,
  },
  statusText: {
    ...typography.captionSmall,
    fontWeight: '700',
  },
  editPhotoIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  infoSection: {
    paddingVertical: 14,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nameText: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  academicSubtitle: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  editSectionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 12,
  },
  metaText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  sectionBlock: {
    marginBottom: 14,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionLabel: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editLink: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '700',
  },
  bioText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: colors.pink,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  chipText: {
    ...typography.captionSmall,
    color: colors.primaryDeep,
    fontWeight: '600',
  },
});


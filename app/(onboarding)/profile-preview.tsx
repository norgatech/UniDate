import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ArrowLeft, ShieldCheck, Heart, Sparkles, School } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radii } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/stores/authStore';
import { StudentProfile } from '../../src/types';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';
import { uploadImageToSupabase } from '../../src/lib/storage';
import { VerifiedBadge } from '../../src/components/ui/VerifiedBadge';

export default function ProfilePreviewScreen() {
  const params = useLocalSearchParams();
  const [isPublishing, setIsPublishing] = React.useState(false);

  const currentUser = useAuthStore((state) => state.user);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setHasCompletedOnboarding = useAuthStore((state) => state.setHasCompletedOnboarding);

  const displayName = (params.displayName as string) || 'Sarah';
  const age = 21;
  const faculty = (params.faculty as string) || 'Science';
  const level = (params.level as string) || '300';
  const bio = (params.bio as string) || 'Love books, Coffee, and deep conversations...';
  const photo =
    (params.primaryPhoto as string) ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500';

  let interests: string[] = ['Reading', 'Coffee', 'Music'];
  try {
    if (params.interests) {
      interests = JSON.parse(params.interests as string);
    }
  } catch (e) {
    // fallback
  }

  let photosList: string[] = [photo];
  try {
    if (params.photosJson) {
      const parsed = JSON.parse(params.photosJson as string);
      if (Array.isArray(parsed) && parsed.length > 0) {
        photosList = parsed;
      }
    }
  } catch (e) {
    // fallback
  }

  const handleLaunchApp = async () => {
    setIsPublishing(true);
    const userId = currentUser?.id || 'usr_me';

    // Prepare and upload photos to Supabase storage if authenticated
    const uploadedPhotos: { id: string; url: string; is_primary: boolean; order: number }[] = [];
    for (let i = 0; i < photosList.length; i++) {
      const pUri = photosList[i];
      let finalUrl = pUri;

      if (isSupabaseConfigured() && currentUser?.id && !currentUser.id.startsWith('usr_')) {
        if (pUri.startsWith('file:') || pUri.startsWith('blob:') || pUri.startsWith('data:')) {
          const upRes = await uploadImageToSupabase(
            'profile-photos',
            `${currentUser.id}/photo_${i}_${Date.now()}.jpg`,
            pUri
          );
          if (upRes.publicUrl) finalUrl = upRes.publicUrl;
        }
      }

      uploadedPhotos.push({
        id: 'p' + (i + 1),
        url: finalUrl,
        is_primary: i === 0,
        order: i,
      });
    }

    const newProfile: StudentProfile = {
      id: userId.startsWith('usr_') ? 'prof_' + Date.now() : userId,
      user_id: userId,
      display_name: displayName,
      date_of_birth: (params.dob as string) || '2003-05-15',
      age,
      gender: (params.gender as any) || 'female',
      bio,
      university_id: '97d63bbb-1083-5226-a62c-59d35feb6e2e',
      university_name: (params.uniName as string) || 'University of Ghana',
      faculty,
      department: (params.department as string) || 'Computer Science',
      level,
      photos: uploadedPhotos,
      interests,
      campus_activities: [(params.campusActivities as string) || 'Rotaract Club'],
      connection_intention: (params.selectedIntention as any) || 'serious_relationship',
      verification_status: 'pending',
      is_profile_complete: true,
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && currentUser?.id && !currentUser.id.startsWith('usr_')) {
      try {
        await supabase.from('profiles').upsert({
          id: currentUser.id,
          display_name: displayName,
          date_of_birth: (params.dob as string) || '2003-05-15',
          gender: (params.gender as any) || 'female',
          bio,
          university_name: (params.uniName as string) || 'University of Ghana',
          faculty,
          department: (params.department as string) || 'Computer Science',
          academic_level: level,
          photos: uploadedPhotos,
          interests,
          campus_activities: [(params.campusActivities as string) || 'Rotaract Club'],
          connection_intention: (params.selectedIntention as any) || 'serious_relationship',
          is_profile_complete: true,
          is_visible: true,
        });
      } catch (err) {
        console.warn('Profile sync to Supabase error:', err);
      }
    }

    setProfile(newProfile);
    setHasCompletedOnboarding(true);
    setIsPublishing(false);
    router.replace('/(onboarding)/complete');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {/* Navigation */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.verifiedPreviewBadge}>
              <VerifiedBadge size={14} />
              <Text style={styles.verifiedPreviewText}>Ready for Discovery</Text>
            </View>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.title}>Profile Preview</Text>
            <Text style={styles.subtitle}>
              This is how other verified students will see you in the discovery feed.
            </Text>
          </View>

          {/* Profile Card Mockup */}
          <View style={styles.cardContainer}>
            <View style={styles.cardImageContainer}>
              <Image source={{ uri: photo }} style={styles.cardImage} contentFit="cover" />
              <View style={styles.statusChip}>
                <VerifiedBadge size={14} />
                <Text style={styles.statusChipText}>Verified Student</Text>
              </View>
            </View>

            <View style={styles.cardDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{displayName}, {age}</Text>
                <VerifiedBadge size={18} style={{ marginLeft: 6 }} />
              </View>

              <View style={styles.academicRow}>
                <School size={14} color={colors.primary} />
                <Text style={styles.academicText}>{faculty} • {level} Level</Text>
              </View>

              <Text style={styles.bioText}>{bio}</Text>

              {/* Interest Chips */}
              <View style={styles.chipsRow}>
                {interests.map((int) => (
                  <View key={int} style={styles.chip}>
                    <Text style={styles.chipText}>{int}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Launch Button */}
          <View style={styles.actionContainer}>
            <Button
              title="Publish & Start Matching"
              onPress={handleLaunchApp}
              loading={isPublishing}
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
    paddingTop: 12,
    paddingBottom: 36,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 480,
    flex: 1,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  verifiedPreviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F9FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  verifiedPreviewText: {
    ...typography.captionSmall,
    color: colors.verifiedText,
    fontWeight: '700',
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
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24,
  },
  cardImageContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  statusChip: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  statusChipText: {
    ...typography.captionSmall,
    color: colors.verifiedText,
    fontWeight: '700',
  },
  cardDetails: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  academicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  academicText: {
    ...typography.supporting,
    color: colors.primary,
    fontWeight: '600',
  },
  bioText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.pink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  chipText: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 'auto',
  },
});


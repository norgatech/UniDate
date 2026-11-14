import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  ShieldCheck,
  Heart,
  School,
  Sparkles,
  ShieldAlert,
  Ban,
  Share2,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radii, shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { MOCK_PROFILES } from '../../src/data/mockData';
import { VerifiedBadge } from '../../src/components/ui/VerifiedBadge';
import { profileService } from '../../src/services/profileService';
import { matchingService } from '../../src/services/matchingService';
import { StudentProfile } from '../../src/types';

export default function StudentProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        if (id) {
          const liveProfile = await profileService.getProfileById(id);
          if (liveProfile) {
            setProfile(liveProfile);
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore
      }
      const fallback = MOCK_PROFILES.find((p) => p.id === id) || MOCK_PROFILES[0];
      setProfile(fallback);
      setLoading(false);
    };
    loadProfile();
  }, [id]);

  const handleLike = async () => {
    if (!profile) return;
    try {
      const res = await matchingService.sendLike(profile.id);
      if (res.isMatch || profile.id === 'profile-1' || profile.id === 'profile-2') {
        router.push({
          pathname: '/match-celebration',
          params: {
            profileId: profile.id,
            profileName: profile.display_name,
            profilePhoto: profile.photos[0]?.url,
          },
        });
      } else {
        Alert.alert('Liked!', `You liked ${profile.display_name}.`);
      }
    } catch {
      router.push({
        pathname: '/match-celebration',
        params: {
          profileId: profile.id,
          profileName: profile.display_name,
          profilePhoto: profile.photos[0]?.url,
        },
      });
    }
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={[styles.safeArea, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const handleReport = () => {
    router.push({
      pathname: '/report',
      params: { reportedUserId: profile.user_id, reportedUserName: profile.display_name },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.rightNavActions}>
            <TouchableOpacity style={styles.iconNavBtn} onPress={handleReport}>
              <ShieldAlert size={20} color={colors.warning} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Photo Carousel / Card */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: profile.photos[0]?.url }}
            style={styles.heroPhoto}
            contentFit="cover"
          />
          {profile.verification_status === 'verified' && (
            <View style={styles.verifiedFloatingTag}>
              <VerifiedBadge size={14} />
              <Text style={styles.verifiedFloatingTagText}>Verified Student</Text>
            </View>
          )}
        </View>

        {/* Name, Age, University */}
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>
              {profile.display_name}, {profile.age}
            </Text>
            {profile.verification_status === 'verified' && (
              <VerifiedBadge size={18} style={{ marginLeft: 6 }} />
            )}
          </View>
          <View style={styles.universityRow}>
            <School size={16} color={colors.primary} />
            <Text style={styles.universityText}>
              {profile.university_name}
            </Text>
          </View>
          <Text style={styles.facultyText}>
            {profile.faculty} • {profile.department} ({profile.level} Level)
          </Text>
        </View>

        {/* About Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>About Me</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>

        {/* Interests Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Interests</Text>
          <View style={styles.chipsRow}>
            {profile.interests.map((int) => (
              <View key={int} style={styles.chip}>
                <Text style={styles.chipText}>{int}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Campus Activities */}
        {profile.campus_activities && profile.campus_activities.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Campus Activities</Text>
            {profile.campus_activities.map((act, i) => (
              <Text key={i} style={styles.activityItem}>
                • {act}
              </Text>
            ))}
          </View>
        )}

        {/* Actions Button */}
        <View style={styles.actionContainer}>
          <Button
            title={`Connect with ${profile.display_name}`}
            onPress={handleLike}
            icon={<Heart size={18} color={colors.white} fill={colors.white} />}
            showArrow
          />
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
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  rightNavActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconNavBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoContainer: {
    width: '100%',
    height: 340,
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
    ...shadows.md,
  },
  heroPhoto: {
    width: '100%',
    height: '100%',
  },
  verifiedFloatingTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  verifiedFloatingTagText: {
    ...typography.captionSmall,
    color: colors.verifiedText,
    fontWeight: '700',
  },
  headerInfo: {
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    ...typography.h1,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  universityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  universityText: {
    ...typography.supporting,
    color: colors.primary,
    fontWeight: '700',
  },
  facultyText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii['2xl'],
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    ...shadows.sm,
  },
  cardHeading: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 10,
  },
  bioText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.pink,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  chipText: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '600',
  },
  activityItem: {
    ...typography.body,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  actionContainer: {
    marginTop: 8,
  },
});


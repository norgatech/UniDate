import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  Heart,
  Eye,
  ShieldCheck,
  ChevronRight,
  User,
  Shield,
  Settings,
  Sparkles,
  Crown,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radii, shadows } from '../../src/theme/spacing';
import { useAuthStore } from '../../src/stores/authStore';
import { AppHeader } from '../../src/components/navigation/AppHeader';
import { VerifiedBadge } from '../../src/components/ui/VerifiedBadge';
import { matchingService } from '../../src/services/matchingService';

export default function UserProfileScreen() {
  const profile = useAuthStore((state) => state.profile);
  const [matchCount, setMatchCount] = useState<number>(4);
  const [likesCount, setLikesCount] = useState<number>(12);

  useEffect(() => {
    useAuthStore.getState().refreshProfile();

    const fetchCounts = async () => {
      try {
        const [matches, likes] = await Promise.all([
          matchingService.getMatches(),
          matchingService.getIncomingLikes(),
        ]);
        if (matches) setMatchCount(matches.length);
        if (likes) setLikesCount(likes.length);
      } catch {
        // ignore
      }
    };
    fetchCounts();
  }, []);

  const displayName = profile?.display_name || 'Student Profile';
  const faculty = profile?.faculty || 'Campus';
  const level = profile?.level || '100';
  const photo =
    profile?.photos?.[0]?.url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader title="My Profile" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar and Heart Sticker matching reference */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: photo }} style={styles.avatar} contentFit="cover" />
            <View style={styles.heartBalloon}>
              <Heart size={20} color={colors.white} fill={colors.white} />
            </View>
          </View>

          <View style={styles.nameHeaderRow}>
            <Text style={styles.nameText}>{displayName}</Text>
            <VerifiedBadge size={20} style={{ marginLeft: 6 }} />
          </View>
          <Text style={styles.courseText}>{faculty} {level} Level</Text>
        </View>

        {/* Stats Row matching reference */}
        <View style={styles.statsCardRow}>
          {/* Matches Box */}
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {matchCount < 10 ? `0${matchCount}` : matchCount}
            </Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>

          {/* Likes Box */}
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {likesCount < 10 ? `0${likesCount}` : likesCount}
            </Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
        </View>

        {/* Upgrade Banner */}
        <TouchableOpacity
          style={styles.upgradeCard}
          onPress={() => router.push('/premium')}
          activeOpacity={0.85}
        >
          <Crown size={22} color="#D97706" />
          <View style={styles.upgradeTextContainer}>
            <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
            <Text style={styles.upgradeSubtitle}>Unlimited likes & profile boosts</Text>
          </View>
          <ChevronRight size={18} color="#D97706" />
        </TouchableOpacity>

        {/* Menu Navigation List matching reference */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/edit-profile')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuLabel}>Edit Profile</Text>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/privacy-safety')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuLabel}>Privacy & Safety</Text>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuLabel}>Settings</Text>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Student Verification Status Box */}
        <View style={styles.verificationNoticeCard}>
          <VerifiedBadge size={22} />
          <View style={styles.verificationNoticeText}>
            <Text style={styles.verificationTitle}>Verified University Student</Text>
            <Text style={styles.verificationSubtitle}>
              University of Ghana • Identity confirmed through private student credential review.
            </Text>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  heartBalloon: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    ...shadows.sm,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  courseText: {
    ...typography.supporting,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsCardRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  statNumber: {
    ...typography.h1,
    fontSize: 32,
    lineHeight: 38,
    color: colors.primary,
    fontWeight: '800',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
    gap: 12,
  },
  upgradeTextContainer: {
    flex: 1,
  },
  upgradeTitle: {
    ...typography.label,
    color: '#92400E',
    fontWeight: '700',
  },
  upgradeSubtitle: {
    ...typography.captionSmall,
    color: '#B45309',
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    ...shadows.sm,
    marginBottom: 24,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  verificationNoticeCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    gap: 12,
  },
  verificationNoticeText: {
    flex: 1,
  },
  verificationTitle: {
    ...typography.label,
    color: colors.success,
    fontWeight: '700',
    marginBottom: 2,
  },
  verificationSubtitle: {
    ...typography.captionSmall,
    color: '#2E7D32',
    lineHeight: 16,
  },
});


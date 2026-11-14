import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Heart, Sparkles, Crown, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radii, shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { MOCK_PROFILES } from '../../src/data/mockData';
import { StudentProfile } from '../../src/types';
import { AppHeader } from '../../src/components/navigation/AppHeader';
import { VerifiedBadge } from '../../src/components/ui/VerifiedBadge';
import { matchingService } from '../../src/services/matchingService';
import { EmptyState } from '../../src/components/ui/StateViews';

export default function LikesScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Responsive layout breakpoints
  const isDesktop = (containerWidth || windowWidth) >= 1024;
  const isTablet = (containerWidth || windowWidth) >= 680 && (containerWidth || windowWidth) < 1024;
  const numColumns = isDesktop ? 4 : isTablet ? 3 : 2;

  // Responsive card dimension calculations
  const effectiveContainerWidth = containerWidth > 0
    ? containerWidth
    : Math.min(windowWidth - (isDesktop ? 260 : isTablet ? 80 : 0), 1120);

  // Subtract container horizontal padding (20px left + 20px right = 40px)
  const safeInnerWidth = Math.max(280, effectiveContainerWidth - 40);
  const gap = 16;
  const cardWidth = Math.floor((safeInnerWidth - (numColumns - 1) * gap) / numColumns);
  const cardHeight = Math.round(cardWidth * 1.38);

  const [likesList, setLikesList] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLikes = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const incoming = await matchingService.getIncomingLikes();
      if (incoming && incoming.length > 0) {
        setLikesList(incoming);
      } else {
        // Fallback to sample mock likes in offline/demo mode
        setLikesList(MOCK_PROFILES.slice(1, 5));
      }
    } catch {
      setLikesList(MOCK_PROFILES.slice(1, 5));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLikes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadLikes(false);
  };

  const handleLikeBack = async (profile: StudentProfile) => {
    try {
      await matchingService.sendLike(profile.id);
    } catch (err) {
      console.warn('Error liking back:', err);
    }

    // Navigate to Match Celebration
    router.push({
      pathname: '/match-celebration',
      params: {
        profileId: profile.id,
        profileName: profile.display_name,
        profilePhoto: profile.photos[0]?.url,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Likes"
        rightAction={
          <View style={styles.likeCountBadge}>
            <Heart size={14} color={colors.white} fill={colors.white} />
            <Text style={styles.likeCountText}>{likesList.length} Likes</Text>
          </View>
        }
      />
      <View
        style={styles.container}
        onLayout={(e) => {
          const w = Math.round(e.nativeEvent.layout.width);
          if (w > 0 && Math.abs(w - containerWidth) > 1) {
            setContainerWidth(w);
          }
        }}
      >

        {/* Premium Upgrade Banner matching reference */}
        <TouchableOpacity
          style={styles.premiumBanner}
          onPress={() => router.push('/premium')}
          activeOpacity={0.85}
        >
          <View style={styles.crownIconBox}>
            <Crown size={24} color="#D97706" />
          </View>
          <View style={styles.premiumTextContainer}>
            <Text style={styles.premiumTitle}>See Who Liked You</Text>
            <Text style={styles.premiumDesc}>
              Upgrade to UniDate Gold to instantly see and match with everyone who liked your profile.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Likes Grid */}
        <FlatList
          key={`likes-grid-${numColumns}`}
          data={likesList}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 12, color: colors.textSecondary }}>
                  Checking who liked your profile...
                </Text>
              </View>
            ) : (
              <EmptyState
                icon="heart"
                title="No likes yet"
                message="Start discovering profiles to make meaningful campus connections!"
                actionLabel="Discover Students"
                onAction={() => router.push('/(tabs)')}
              />
            )
          }
          renderItem={({ item, index }) => {
            const isFirst = index === 0; // First one visible for demo excitement
            return (
              <View style={[styles.likeCard, { width: cardWidth, height: cardHeight }]}>
                <Image
                  source={{ uri: item.photos[0]?.url }}
                  style={[styles.likeCardImage, !isFirst && styles.blurredImage]}
                  contentFit="cover"
                  blurRadius={isFirst ? 0 : 18}
                />

                <View style={styles.likeCardOverlay}>
                  <View style={styles.cardHeader}>
                    {item.verification_status === 'verified' && (
                      <VerifiedBadge size={16} withBorder />
                    )}
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.likeCardName} numberOfLines={1}>
                      {isFirst ? `${item.display_name}, ${item.age}` : 'Someone, 21'}
                    </Text>
                    <Text style={styles.likeCardFaculty} numberOfLines={1}>
                      {isFirst ? `${item.faculty}` : 'Faculty of Science'}
                    </Text>

                    <TouchableOpacity
                      style={styles.likeBackBtn}
                      onPress={() => handleLikeBack(item)}
                      activeOpacity={0.8}
                    >
                      <Heart size={14} color={colors.white} fill={colors.white} />
                      <Text style={styles.likeBackBtnText}>Like Back</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
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
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '800',
  },
  likeCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  likeCountText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '700',
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: radii['2xl'],
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginBottom: 20,
    gap: 14,
    width: '100%',
    maxWidth: 1080,
    alignSelf: 'center',
    ...shadows.sm,
  },
  crownIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTitle: {
    ...typography.label,
    color: '#92400E',
    fontWeight: '700',
  },
  premiumDesc: {
    ...typography.captionSmall,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  columnWrapper: {
    gap: 16,
    marginBottom: 16,
  },
  likeCard: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  likeCardImage: {
    width: '100%',
    height: '100%',
  },
  blurredImage: {
    opacity: 0.9,
    transform: [{ scale: 1.15 }],
  },
  likeCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  verifiedMiniBadge: {
    backgroundColor: colors.surface,
    padding: 4,
    borderRadius: radii.full,
  },
  cardFooter: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: radii.lg,
  },
  likeCardName: {
    ...typography.label,
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  likeCardFaculty: {
    ...typography.captionSmall,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  likeBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    width: '100%',
    justifyContent: 'center',
  },
  likeBackBtnText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '700',
  },
});

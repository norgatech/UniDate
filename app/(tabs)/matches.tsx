import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  Search,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  User,
  Heart,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { AppHeader } from '../../src/components/navigation/AppHeader';
import { EmptyState } from '../../src/components/ui/StateViews';
import { MOCK_MATCHES } from '../../src/data/mockData';
import { Match } from '../../src/types';
import { VerifiedBadge } from '../../src/components/ui/VerifiedBadge';
import { matchingService } from '../../src/services/matchingService';

export default function MatchesScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const numColumns = isDesktop ? 3 : isTablet ? 3 : 2;
  const contentWidth = isDesktop ? Math.min(width - 280, 1100) : width;
  const cardWidth = Math.floor((contentWidth - (numColumns + 1) * 16) / numColumns);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'verified'>('all');
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const liveMatches = await matchingService.getMatches();
      if (liveMatches && liveMatches.length > 0) {
        setMatches(liveMatches);
      } else {
        // Fallback to sample mock matches in demo mode
        setMatches(MOCK_MATCHES);
      }
    } catch {
      setMatches(MOCK_MATCHES);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadMatches(false);
  };

  const filteredMatches = matches.filter((m) => {
    if (!m.other_profile) return false;
    const nameMatch = m.other_profile.display_name.toLowerCase().includes(search.toLowerCase()) ||
      m.other_profile.faculty.toLowerCase().includes(search.toLowerCase());
    if (filterType === 'verified') {
      return nameMatch && m.other_profile.verification_status === 'verified';
    }
    return nameMatch;
  });

  const handleOpenChat = (match: Match) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id: match.id },
    });
  };

  const handleViewProfile = (match: Match) => {
    if (!match.other_profile) return;
    router.push({
      pathname: '/profile/[id]',
      params: { id: match.other_profile.id },
    });
  };

  const handleWave = (match: Match) => {
    if (!match.other_profile) return;
    Alert.alert('Wave Sent! 👋', `You waved at ${match.other_profile.display_name}!`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader title="Matches" />

      <View style={styles.container}>
        {/* Search and Filters */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputWrapper}>
            <Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your matches by name or faculty..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Filter Pills */}
          <View style={styles.filterPillsRow}>
            <TouchableOpacity
              style={[styles.pill, filterType === 'all' && styles.pillActive]}
              onPress={() => setFilterType('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, filterType === 'all' && styles.pillTextActive]}>
                All Matches ({matches.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pill, filterType === 'verified' && styles.pillActive]}
              onPress={() => setFilterType('verified')}
              activeOpacity={0.7}
            >
              <VerifiedBadge size={14} style={{ marginRight: 6 }} />
              <Text style={[styles.pillText, filterType === 'verified' && styles.pillTextActive]}>
                Verified Students
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Matches Grid */}
        <FlatList
          key={`grid-${numColumns}`}
          data={filteredMatches}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
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
                  Loading your campus matches...
                </Text>
              </View>
            ) : (
              <EmptyState
                icon="heart"
                title="No matches found"
                message="Keep exploring student profiles in the Discover deck to make mutual connections!"
                actionLabel="Go to Discover"
                onAction={() => router.push('/(tabs)')}
              />
            )
          }
          renderItem={({ item }) => {
            const profile = item.other_profile;
            if (!profile) return null;
            return (
              <View style={[styles.matchCard, { width: cardWidth }]}>
                {/* Photo with badges */}
                <TouchableOpacity
                  style={styles.photoContainer}
                  onPress={() => handleViewProfile(item)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: profile.photos[0]?.url }}
                    style={styles.cardImage}
                    contentFit="cover"
                  />

                  {profile.verification_status === 'verified' && (
                    <View style={styles.verifiedBadge}>
                      <VerifiedBadge size={13} />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}

                  <View style={styles.matchDateBadge}>
                    <Text style={styles.matchDateText}>Matched 2d ago</Text>
                  </View>
                </TouchableOpacity>

                {/* Profile info */}
                <View style={styles.cardInfo}>
                  <TouchableOpacity onPress={() => handleViewProfile(item)}>
                    <View style={styles.cardNameRow}>
                      <Text style={styles.cardName} numberOfLines={1}>
                        {profile.display_name}, {profile.age}
                      </Text>
                      {profile.verification_status === 'verified' && (
                        <VerifiedBadge size={14} style={{ marginLeft: 4 }} />
                      )}
                    </View>
                    <Text style={styles.cardSub} numberOfLines={1}>
                      {profile.faculty} • {profile.level}L
                    </Text>
                  </TouchableOpacity>

                  {/* Actions */}
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.actionBtnMessage}
                      onPress={() => handleOpenChat(item)}
                      activeOpacity={0.8}
                    >
                      <MessageCircle size={16} color={colors.white} style={{ marginRight: 4 }} />
                      <Text style={styles.actionBtnMessageText}>Chat</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnWave}
                      onPress={() => handleWave(item)}
                      activeOpacity={0.8}
                      accessibilityLabel="Wave"
                    >
                      <Sparkles size={16} color={colors.primary} />
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
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBarContainer: {
    marginBottom: 16,
    gap: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
  columnWrapper: {
    gap: 16,
    marginBottom: 16,
  },
  matchCard: {
    backgroundColor: colors.surface,
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  photoContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  verifiedText: {
    ...typography.captionSmall,
    color: colors.verifiedText,
    fontSize: 11,
    fontWeight: '700',
  },
  matchDateBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  matchDateText: {
    ...typography.captionSmall,
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  cardInfo: {
    padding: 12,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardName: {
    ...typography.label,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  cardSub: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionBtnMessage: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 38,
    borderRadius: radii.full,
  },
  actionBtnMessageText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '700',
  },
  actionBtnWave: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});

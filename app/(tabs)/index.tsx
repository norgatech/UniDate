import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  Search,
  Heart,
  X,
  Sparkles,
  Check,
  RotateCcw,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { EmptyState } from '../../src/components/ui/StateViews';
import { MOCK_PROFILES } from '../../src/data/mockData';
import { StudentProfile } from '../../src/types';
import { AppHeader } from '../../src/components/navigation/AppHeader';
import { VerifiedBadge } from '../../src/components/ui/VerifiedBadge';
import { profileService } from '../../src/services/profileService';
import { matchingService } from '../../src/services/matchingService';
import { RefreshControl, ActivityIndicator } from 'react-native';

export default function DiscoverScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Responsive breakpoints — identical to Likes screen
  const isDesktop = (containerWidth || windowWidth) >= 1024;
  const isTablet =
    (containerWidth || windowWidth) >= 680 &&
    (containerWidth || windowWidth) < 1024;
  const numColumns = isDesktop ? 4 : isTablet ? 3 : 2;

  const effectiveContainerWidth =
    containerWidth > 0
      ? containerWidth
      : Math.min(windowWidth - (isDesktop ? 260 : isTablet ? 80 : 0), 1120);
  const safeInnerWidth = Math.max(280, effectiveContainerWidth - 40);
  const gap = 16;
  const cardWidth = Math.floor((safeInnerWidth - (numColumns - 1) * gap) / numColumns);
  // Photo section height only (not full card — card auto-sizes)
  const photoHeight = Math.round(cardWidth * 1.1);

  // Deck / filter state
  const [search, setSearch] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState('All');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('All');
  const [deck, setDeck] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Track liked & waved profiles for visual feedback
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [wavedIds, setWavedIds] = useState<Set<string>>(new Set());

  // Load profiles from Supabase
  const loadDiscoveryProfiles = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [profiles, sentLikes] = await Promise.all([
        profileService.getDiscoveryProfiles(),
        matchingService.getSentLikedIds(),
      ]);

      if (profiles && profiles.length > 0) {
        setDeck(profiles);
      } else {
        // Fallback to sample mock profiles if database has no other registered users yet
        setDeck(MOCK_PROFILES);
      }
      setLikedIds(sentLikes);
    } catch {
      setDeck(MOCK_PROFILES);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDiscoveryProfiles();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDiscoveryProfiles(false);
  };

  /* ── Handlers ── */
  const handleLike = async (profile: StudentProfile) => {
    const alreadyLiked = likedIds.has(profile.id);
    if (alreadyLiked) return; // already liked — ignore tap

    // Optimistically mark as liked
    setLikedIds((prev) => new Set(prev).add(profile.id));

    try {
      const res = await matchingService.sendLike(profile.id);

      // Mutual match triggered either from live DB trigger or demo profiles
      const isDemoMatch = profile.id === 'profile-1' || profile.id === 'profile-2';
      if (res.isMatch || isDemoMatch) {
        router.push({
          pathname: '/match-celebration',
          params: {
            profileId: profile.id,
            profileName: profile.display_name,
            profilePhoto: profile.photos[0]?.url,
          },
        });
      }
    } catch (err) {
      console.warn('Error liking profile:', err);
    }
  };

  const handleWave = (profile: StudentProfile) => {
    setWavedIds((prev) => new Set(prev).add(profile.id));
  };

  const handleViewProfile = (profile: StudentProfile) => {
    router.push({
      pathname: '/profile/[id]',
      params: { id: profile.id },
    });
  };

  /* ── Filters ── */
  const applyFilters = () => {
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setVerifiedOnly(false);
    setSelectedFacultyFilter('All');
    setSelectedLevelFilter('All');
    setFilterModalVisible(false);
  };

  const filteredDeck = deck.filter((p) => {
    if (verifiedOnly && p.verification_status !== 'verified') return false;
    if (
      selectedFacultyFilter !== 'All' &&
      !p.faculty.toLowerCase().includes(selectedFacultyFilter.toLowerCase())
    ) {
      return false;
    }
    if (selectedLevelFilter !== 'All' && p.level !== selectedLevelFilter) {
      return false;
    }
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.display_name.toLowerCase().includes(q) ||
      p.faculty.toLowerCase().includes(q)
    );
  });

  const activeFilterCount = [
    verifiedOnly,
    selectedFacultyFilter !== 'All',
    selectedLevelFilter !== 'All',
  ].filter(Boolean).length;

  /* ── Render ── */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Discover"
        showFilter
        onFilterPress={() => setFilterModalVisible(true)}
      />

      <View
        style={styles.container}
        onLayout={(e) => {
          const w = Math.round(e.nativeEvent.layout.width);
          if (w > 0 && Math.abs(w - containerWidth) > 1) setContainerWidth(w);
        }}
      >
        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or faculty..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {activeFilterCount > 0 && (
            <TouchableOpacity
              style={styles.activeFilterBadge}
              onPress={() => setFilterModalVisible(true)}
            >
              <Text style={styles.activeFilterBadgeText}>
                {activeFilterCount} Filter{activeFilterCount > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick-filter pills */}
        <View style={styles.pillsRow}>
          <TouchableOpacity
            style={[
              styles.pill,
              !verifiedOnly &&
                selectedFacultyFilter === 'All' &&
                selectedLevelFilter === 'All' &&
                styles.pillActive,
            ]}
            onPress={resetFilters}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.pillText,
                !verifiedOnly &&
                  selectedFacultyFilter === 'All' &&
                  selectedLevelFilter === 'All' &&
                  styles.pillTextActive,
              ]}
            >
              All Students ({MOCK_PROFILES.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, verifiedOnly && styles.pillActive]}
            onPress={() => {
              const next = !verifiedOnly;
              setVerifiedOnly(next);
              setDeck(
                next
                  ? MOCK_PROFILES.filter((p) => p.verification_status === 'verified')
                  : MOCK_PROFILES
              );
            }}
            activeOpacity={0.75}
          >
            <VerifiedBadge size={13} style={{ marginRight: 5 }} />
            <Text style={[styles.pillText, verifiedOnly && styles.pillTextActive]}>
              Verified
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pill}
            onPress={() => setFilterModalVisible(true)}
            activeOpacity={0.75}
          >
            <Sparkles size={13} color={colors.primary} style={{ marginRight: 5 }} />
            <Text style={[styles.pillText, { color: colors.primary }]}>Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Discovery Grid */}
        <FlatList
          key={`discover-grid-${numColumns}`}
          data={filteredDeck}
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
                  Finding students on your campus...
                </Text>
              </View>
            ) : (
              <EmptyState
                icon="search"
                title="No students found"
                message="Try adjusting your filters or search term."
                actionLabel="Reset Filters"
                onAction={resetFilters}
              />
            )
          }
          renderItem={({ item }) => {
            const isLiked = likedIds.has(item.id);
            const isWaved = wavedIds.has(item.id);

            return (
              <View style={[styles.discoverCard, { width: cardWidth }]}>
                {/* ── Photo section — SEPARATE touchable, does NOT cover buttons ── */}
                <TouchableOpacity
                  style={[styles.photoSection, { height: photoHeight }]}
                  onPress={() => handleViewProfile(item)}
                  activeOpacity={0.88}
                >
                  <Image
                    source={{ uri: item.photos[0]?.url }}
                    style={styles.cardImage}
                    contentFit="cover"
                    contentPosition="top center"
                  />

                  {/* Verified badge */}
                  {item.verification_status === 'verified' && (
                    <View style={styles.verifiedBadge}>
                      <VerifiedBadge size={12} />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}

                  {/* Liked overlay flash */}
                  {isLiked && (
                    <View style={styles.likedOverlay}>
                      <Heart size={40} color={colors.white} fill={colors.white} />
                    </View>
                  )}
                </TouchableOpacity>

                {/* ── Info + Actions — always interactive ── */}
                <View style={styles.cardInfo}>
                  <TouchableOpacity onPress={() => handleViewProfile(item)} activeOpacity={0.7}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {item.display_name}, {item.age}
                    </Text>
                    <Text style={styles.cardSub} numberOfLines={1}>
                      {item.faculty} • {item.level}L
                    </Text>
                  </TouchableOpacity>

                  {/* Interest chips */}
                  {item.interests?.length > 0 && (
                    <View style={styles.interestChips}>
                      {item.interests.slice(0, 2).map((interest) => (
                        <View key={interest} style={styles.interestChip}>
                          <Text style={styles.interestChipText}>{interest}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Action buttons */}
                  <View style={styles.cardActions}>
                    {/* Wave */}
                    <TouchableOpacity
                      style={[styles.waveBtn, isWaved && styles.waveBtnActive]}
                      onPress={() => handleWave(item)}
                      activeOpacity={0.75}
                      accessibilityLabel={`Wave at ${item.display_name}`}
                    >
                      <Sparkles
                        size={15}
                        color={isWaved ? colors.white : colors.primary}
                      />
                    </TouchableOpacity>

                    {/* Like */}
                    <TouchableOpacity
                      style={[styles.likeBtn, isLiked && styles.likeBtnLiked]}
                      onPress={() => handleLike(item)}
                      activeOpacity={0.8}
                      accessibilityLabel={`Like ${item.display_name}`}
                    >
                      <Heart
                        size={15}
                        color={colors.white}
                        fill={isLiked ? colors.white : 'none'}
                      />
                      <Text style={styles.likeBtnText}>
                        {isLiked ? 'Liked!' : 'Like'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      </View>

      {/* ── Filter Bottom Sheet ── */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Faculty */}
              <Text style={styles.filterLabel}>Faculty</Text>
              <View style={styles.chipsFilterRow}>
                {[
                  'All', 'Science', 'Arts', 'Education',
                  'Technology', 'Social Sciences', 'Law', 'Pharmacy',
                ].map((fac) => {
                  const isSelected = selectedFacultyFilter === fac;
                  return (
                    <TouchableOpacity
                      key={fac}
                      style={[styles.filterChip, isSelected && styles.filterChipActive]}
                      onPress={() => setSelectedFacultyFilter(fac)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isSelected && styles.filterChipTextActive,
                        ]}
                      >
                        {fac}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Academic Level */}
              <Text style={styles.filterLabel}>Academic Level</Text>
              <View style={styles.chipsFilterRow}>
                {['All', '100', '200', '300', '400', '500', '600'].map((lvl) => {
                  const isSelected = selectedLevelFilter === lvl;
                  return (
                    <TouchableOpacity
                      key={lvl}
                      style={[styles.filterChip, isSelected && styles.filterChipActive]}
                      onPress={() => setSelectedLevelFilter(lvl)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isSelected && styles.filterChipTextActive,
                        ]}
                      >
                        {lvl === 'All' ? 'All' : `${lvl}L`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Verified toggle */}
              <TouchableOpacity
                style={styles.verifiedFilterToggle}
                onPress={() => setVerifiedOnly(!verifiedOnly)}
              >
                <View>
                  <Text style={styles.verifiedToggleTitle}>Verified Students Only</Text>
                  <Text style={styles.verifiedToggleSubtitle}>
                    Show only verified student accounts
                  </Text>
                </View>
                <View style={[styles.toggleBox, verifiedOnly && styles.toggleBoxActive]}>
                  {verifiedOnly && <Check size={16} color={colors.white} />}
                </View>
              </TouchableOpacity>

              {/* Buttons */}
              <View style={styles.sheetBtnsRow}>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={resetFilters}
                  activeOpacity={0.8}
                >
                  <RotateCcw
                    size={15}
                    color={colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.resetBtnText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={applyFilters}
                  activeOpacity={0.85}
                >
                  <Text style={styles.applyBtnText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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

  // ── Search ──────────────────────────────────────────
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  searchInputWrapper: {
    flex: 1,
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
  activeFilterBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  activeFilterBadgeText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '700',
  },

  // ── Pills ────────────────────────────────────────────
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
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

  // ── Grid ─────────────────────────────────────────────
  listContent: {
    paddingBottom: 24,
  },
  columnWrapper: {
    gap: 16,
    marginBottom: 16,
  },

  // ── Card ─────────────────────────────────────────────
  discoverCard: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },

  // Photo — its own block, NOT covering the card footer
  photoSection: {
    width: '100%',
    position: 'relative',
    backgroundColor: colors.pink,
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
    backgroundColor: 'rgba(255,255,255,0.93)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  verifiedText: {
    ...typography.captionSmall,
    color: colors.verifiedText,
    fontSize: 10,
    fontWeight: '700',
  },
  likedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(220, 38, 38, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info section below the photo — always receives touch events
  cardInfo: {
    padding: 10,
    backgroundColor: colors.surface,
  },
  cardName: {
    ...typography.label,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  cardSub: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: 1,
    marginBottom: 6,
  },
  interestChips: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  interestChip: {
    backgroundColor: colors.pink,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  interestChipText: {
    ...typography.captionSmall,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  waveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  waveBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  likeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 36,
    borderRadius: radii.full,
    gap: 5,
  },
  likeBtnLiked: {
    backgroundColor: '#9B1C1C', // darker red when liked
  },
  likeBtnText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '700',
  },

  // ── Filter Modal ──────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  filterSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    padding: 24,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  filterLabel: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  chipsFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F9F9F9',
  },
  filterChipActive: {
    backgroundColor: colors.pink,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  verifiedFilterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
  },
  verifiedToggleTitle: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  verifiedToggleSubtitle: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toggleBox: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  toggleBoxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sheetBtnsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: 48,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  resetBtnText: {
    ...typography.label,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  applyBtnText: {
    ...typography.label,
    color: colors.white,
    fontWeight: '700',
  },
});

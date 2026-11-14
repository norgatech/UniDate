/**
 * UniDate — Onboarding Screen 5: Interests and Hobbies
 * Visually engaging category-filtered multi-selection (min 3, max 10)
 * loaded from Supabase interests catalog.
 */
import React, { useState, useEffect } from 'react';
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
import { Sparkles, Check, AlertCircle } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { OnboardingHeader } from '../../src/components/onboarding/OnboardingHeader';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { useAuthStore } from '../../src/stores/authStore';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';
import { INTERESTS } from '../../src/types';

interface InterestRecord {
  id: string;
  name: string;
  category: string;
}

const CATEGORIES = ['All', 'Creative', 'Active', 'Intellectual', 'Entertainment', 'Lifestyle', 'Social'];

export default function InterestsScreen() {
  const user = useAuthStore((state) => state.user);
  const store = useOnboardingStore();

  const [interestsList, setInterestsList] = useState<InterestRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNames, setSelectedNames] = useState<string[]>(store.interests || ['Music', 'Reading', 'Travel']);
  const [selectedIds, setSelectedIds] = useState<string[]>(store.interestIds || []);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load interests from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadInterests() {
      try {
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('interests')
            .select('id, name, category')
            .order('name');

          if (!error && data && data.length > 0 && isMounted) {
            setInterestsList(data);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not load interests from Supabase, using local catalog:', e);
      }

      if (isMounted) {
        // Fallback catalog
        const fallback: InterestRecord[] = INTERESTS.map((name, idx) => ({
          id: `int-${idx + 1}`,
          name,
          category: ['Creative', 'Active', 'Intellectual', 'Entertainment', 'Lifestyle'][idx % 5],
        }));
        setInterestsList(fallback);
        setLoading(false);
      }
    }

    loadInterests();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleInterest = (item: InterestRecord) => {
    setErrorMsg(null);
    const isSelected = selectedNames.includes(item.name);

    if (isSelected) {
      setSelectedNames((prev) => prev.filter((n) => n !== item.name));
      setSelectedIds((prev) => prev.filter((id) => id !== item.id));
    } else {
      if (selectedNames.length >= 10) {
        setErrorMsg('You can select a maximum of 10 interests.');
        return;
      }
      setSelectedNames((prev) => [...prev, item.name]);
      setSelectedIds((prev) => [...prev, item.id]);
    }
  };

  const filteredInterests = interestsList.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const canProceed = selectedNames.length >= 3 && selectedNames.length <= 10;

  const handleContinue = async () => {
    if (!canProceed) {
      setErrorMsg('Please select at least 3 interests to help us match you.');
      return;
    }

    store.updateData({
      interests: selectedNames,
      interestIds: selectedIds,
    });
    store.markStepComplete(5);
    await store.saveDraft(user?.id);

    router.push('/(onboarding)/bio');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          <OnboardingHeader
            currentStep={5}
            totalSteps={8}
            title="Interests & Passions"
            subtitle="Pick 3 to 10 interests to discover classmates who share what you love."
          />

          <View style={styles.card}>
            {/* Live Counter & Status */}
            <View style={styles.counterRow}>
              <View style={styles.counterBadge}>
                <Sparkles size={14} color={colors.primary} />
                <Text style={styles.counterText}>
                  {selectedNames.length}/10 Selected
                </Text>
              </View>
              {selectedNames.length < 3 && (
                <Text style={styles.minWarningText}>
                  (Select {3 - selectedNames.length} more)
                </Text>
              )}
            </View>

            {errorMsg ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={14} color={colors.error} />
                <Text style={styles.errorBannerText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Category Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                    onPress={() => setSelectedCategory(cat)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Interests Chips Grid */}
            {loading ? (
              <View style={styles.loaderBox}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loaderText}>Loading interests…</Text>
              </View>
            ) : (
              <View style={styles.chipsGrid}>
                {filteredInterests.map((item) => {
                  const isSelected = selectedNames.includes(item.name);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.interestChip, isSelected && styles.interestChipActive]}
                      onPress={() => toggleInterest(item)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.interestChipText, isSelected && styles.interestChipTextActive]}>
                        {item.name}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkIconWrapper}>
                          <Check size={12} color={colors.white} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <Button
              title="Continue to Bio"
              onPress={handleContinue}
              disabled={!canProceed}
              showArrow
              style={{ marginTop: 24 }}
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
    maxWidth: 520,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 22,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.pink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  counterText: {
    ...typography.captionSmall,
    color: colors.primaryDeep,
    fontWeight: '700',
  },
  minWarningText: {
    ...typography.captionSmall,
    color: colors.error,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDEDED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    marginBottom: 12,
  },
  errorBannerText: {
    ...typography.captionSmall,
    color: colors.error,
    fontWeight: '600',
    flex: 1,
  },
  categoriesScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FAFAFA',
  },
  categoryPillActive: {
    borderColor: colors.purpleAccent,
    backgroundColor: colors.purpleLight,
  },
  categoryPillText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: colors.purple,
    fontWeight: '700',
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 4,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#FAFAFA',
  },
  interestChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.pink,
  },
  interestChipText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  interestChipTextActive: {
    color: colors.primaryDeep,
    fontWeight: '700',
  },
  checkIconWrapper: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  loaderText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: 8,
  },
});


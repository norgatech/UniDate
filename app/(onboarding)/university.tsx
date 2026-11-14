/**
 * UniDate — Onboarding Screen 2: University Selection
 * Searchable university selection loaded dynamically from Supabase universities catalog.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, School, Check, MapPin, Globe } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { OnboardingHeader } from '../../src/components/onboarding/OnboardingHeader';
import { useOnboardingStore, MOCK_TO_UUID_MAP } from '../../src/stores/onboardingStore';
import { useAuthStore } from '../../src/stores/authStore';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';
import { MOCK_UNIVERSITIES } from '../../src/data/mockData';
import type { University } from '../../src/types';

export default function UniversitySelectionScreen() {
  const user = useAuthStore((state) => state.user);
  const store = useOnboardingStore();

  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUni, setSelectedUni] = useState<{
    id: string;
    name: string;
    short_name: string;
    city: string;
    country: string;
  } | null>(null);

  // Load universities from Supabase
  useEffect(() => {
    let isMounted = true;
    async function fetchUniversities() {
      try {
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('universities')
            .select('*')
            .order('name', { ascending: true });

          if (!error && data && data.length > 0 && isMounted) {
            setUniversities(data as University[]);
            // Pre-select if stored
            if (store.universityId) {
              const matched = data.find((u: any) => u.id === store.universityId);
              if (matched) setSelectedUni(matched);
            }
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not load universities from Supabase, falling back to mock data:', err);
      }

      // Fallback to seeded catalog
      if (isMounted) {
        setUniversities(MOCK_UNIVERSITIES);
        if (store.universityId) {
          const matched = MOCK_UNIVERSITIES.find((u) => u.id === store.universityId);
          if (matched) setSelectedUni(matched);
        } else if (!selectedUni && MOCK_UNIVERSITIES.length > 0) {
          setSelectedUni(MOCK_UNIVERSITIES[0]);
        }
        setLoading(false);
      }
    }

    fetchUniversities();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = universities.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.short_name.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q)
    );
  });

  const handleSelect = (uni: any) => {
    setSelectedUni(uni);
  };

  const handleContinue = async () => {
    if (!selectedUni) return;

    const realId = MOCK_TO_UUID_MAP[selectedUni.id] || selectedUni.id;

    store.updateData({
      universityId: realId,
      universityName: selectedUni.name,
      universityShortName: selectedUni.short_name,
      universityCity: selectedUni.city,
    });
    store.markStepComplete(2);
    await store.saveDraft(user?.id);

    router.push('/(onboarding)/academic');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <OnboardingHeader
            currentStep={2}
            totalSteps={8}
            title="Select Your Campus"
            subtitle="Choose your university to connect with adult students in your academic institution."
          />

          <Input
            placeholder="Search university by name, acronym or city..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search size={18} color={colors.textSecondary} />}
            containerStyle={{ marginBottom: 12 }}
          />

          {/* Currently Selected Pill */}
          {selectedUni && (
            <View style={styles.selectedPill}>
              <School size={16} color={colors.primary} />
              <Text style={styles.selectedPillText} numberOfLines={1}>
                Selected: <Text style={{ fontWeight: '700' }}>{selectedUni.name} ({selectedUni.short_name})</Text>
              </Text>
            </View>
          )}
        </View>

        {/* List of Universities */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading university directory…</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selectedUni?.id === item.id;
              return (
                <TouchableOpacity
                  style={[styles.uniCard, isSelected && styles.uniCardActive]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.uniIconBox, isSelected && styles.uniIconBoxActive]}>
                    <School size={22} color={isSelected ? colors.white : colors.primary} />
                  </View>

                  <View style={styles.uniInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.uniName, isSelected && styles.uniNameActive]}>
                        {item.name}
                      </Text>
                    </View>
                    <View style={styles.locationRow}>
                      <MapPin size={13} color={colors.textSecondary} />
                      <Text style={styles.locationText}>
                        {item.city}, {item.country} • {item.short_name}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
                    {isSelected && <Check size={14} color={colors.white} />}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}

        <View style={styles.footerContainer}>
          <Button
            title="Continue to Academic Details"
            onPress={handleContinue}
            disabled={!selectedUni}
            showArrow
          />
        </View>
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
    paddingTop: 16,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  headerWrapper: {
    marginBottom: 4,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.pink,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#F5C6CB',
    marginBottom: 8,
  },
  selectedPillText: {
    ...typography.captionSmall,
    color: colors.primaryDeep,
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  uniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 10,
    ...shadows.sm,
  },
  uniCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF9F9',
  },
  uniIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  uniIconBoxActive: {
    backgroundColor: colors.primary,
  },
  uniInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uniName: {
    ...typography.label,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  uniNameActive: {
    color: colors.primaryDeep,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 12,
  },
  footerContainer: {
    paddingVertical: 14,
    backgroundColor: colors.background,
  },
});

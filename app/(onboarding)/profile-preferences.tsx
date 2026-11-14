import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sliders, HeartHandshake } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radii } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { CONNECTION_INTENTIONS } from '../../src/types';

const FACULTIES = ['Any Faculty', 'Science', 'Arts', 'Social Sciences', 'Engineering', 'Law', 'Medicine'];

export default function ProfilePreferencesScreen() {
  const params = useLocalSearchParams();

  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(25);
  const [selectedFaculty, setSelectedFaculty] = useState('Any Faculty');
  const [selectedIntention, setSelectedIntention] = useState('serious_relationship');

  const handleCompleteSetup = () => {
    router.push({
      pathname: '/(onboarding)/profile-preview',
      params: {
        ...params,
        minAge: String(minAge),
        maxAge: String(maxAge),
        selectedFaculty,
        selectedIntention,
      },
    });
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
          <Text style={styles.stepIndicator}>Final Step</Text>
        </View>

        {/* Heading matching reference */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Who Are You Looking For</Text>
          <Text style={styles.subtitle}>Customize your discovery deck to find the ideal match</Text>
        </View>

        {/* Preferences Card */}
        <View style={styles.card}>
          {/* Age Range */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Age Range</Text>
              <Text style={styles.ageValue}>{minAge} - {maxAge} years</Text>
            </View>

            {/* Custom Interactive Range Bar */}
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { left: '0%', width: '60%' }]} />
              <View style={[styles.sliderThumb, { left: '58%' }]} />
            </View>
            <View style={styles.ageRangeLabels}>
              <TouchableOpacity onPress={() => { setMinAge(18); setMaxAge(22); }}>
                <Text style={[styles.agePreset, maxAge === 22 && styles.agePresetActive]}>18-22</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMinAge(18); setMaxAge(25); }}>
                <Text style={[styles.agePreset, maxAge === 25 && styles.agePresetActive]}>18-25</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMinAge(20); setMaxAge(28); }}>
                <Text style={[styles.agePreset, maxAge === 28 && styles.agePresetActive]}>20-28</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMinAge(18); setMaxAge(32); }}>
                <Text style={[styles.agePreset, maxAge === 32 && styles.agePresetActive]}>All Ages</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Faculty Preference */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Faculty Preference</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalChips}>
              {FACULTIES.map((fac) => {
                const isSelected = selectedFaculty === fac;
                return (
                  <TouchableOpacity
                    key={fac}
                    style={[styles.prefChip, isSelected && styles.prefChipSelected]}
                    onPress={() => setSelectedFaculty(fac)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.prefChipText, isSelected && styles.prefChipTextSelected]}>
                      {fac}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Connection Intention matching reference */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Looking For</Text>
              <HeartHandshake size={18} color={colors.primary} />
            </View>
            <View style={styles.intentionsGrid}>
              {CONNECTION_INTENTIONS.map((item) => {
                const isSelected = selectedIntention === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.intentionChip, isSelected && styles.intentionChipSelected]}
                    onPress={() => setSelectedIntention(item.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.intentionChipText,
                        isSelected && styles.intentionChipTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Complete Setup button matching reference */}
        <View style={styles.actionContainer}>
          <Button
            title="Complete Setup"
            onPress={handleCompleteSetup}
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
    justifyContent: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 480,
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
  stepIndicator: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    backgroundColor: colors.pink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
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
  card: {
    backgroundColor: colors.surface,
    padding: 22,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  ageValue: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#F0EAEA',
    borderRadius: radii.full,
    position: 'relative',
    marginVertical: 12,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    position: 'absolute',
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: -7,
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  ageRangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  agePreset: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  agePresetActive: {
    color: colors.primary,
    fontWeight: '700',
    backgroundColor: colors.pink,
  },
  horizontalChips: {
    gap: 8,
    paddingVertical: 4,
  },
  prefChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F8F8F9',
  },
  prefChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  prefChipText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  prefChipTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  intentionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  intentionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F8F8F9',
  },
  intentionChipSelected: {
    backgroundColor: colors.pink,
    borderColor: colors.primary,
  },
  intentionChipText: {
    ...typography.supportingSmall,
    color: colors.textPrimary,
  },
  intentionChipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  actionContainer: {
    marginTop: 'auto',
  },
});


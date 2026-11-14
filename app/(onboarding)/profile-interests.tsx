import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sparkles, Plus } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radii } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { INTERESTS } from '../../src/types';

export default function ProfileInterestsScreen() {
  const params = useLocalSearchParams();

  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Reading',
    'Coffee',
    'Music',
    'Movies',
  ]);
  const [campusActivity, setCampusActivity] = useState('Rotaract Club, Psychology Society');

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests((prev) => prev.filter((i) => i !== interest));
    } else {
      if (selectedInterests.length >= 8) {
        Alert.alert('Maximum Reached', 'You can select up to 8 interests.');
        return;
      }
      setSelectedInterests((prev) => [...prev, interest]);
    }
  };

  const handleContinue = () => {
    if (selectedInterests.length < 3) {
      Alert.alert('Select Interests', 'Please select at least 3 interests to help us match you.');
      return;
    }

    router.push({
      pathname: '/(onboarding)/profile-preferences',
      params: {
        ...params,
        interests: JSON.stringify(selectedInterests),
        campusActivities: campusActivity.trim(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {/* Back navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.counter}>{selectedInterests.length}/8 selected</Text>
        </View>

        {/* Heading matching reference */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Your Interests</Text>
          <Text style={styles.pageSubtitle}>Select your passions and campus activities</Text>
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeading}>Select Your Interests</Text>
            <Sparkles size={18} color={colors.primary} />
          </View>

          {/* Chips Grid matching reference */}
          <View style={styles.chipsContainer}>
            {INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <TouchableOpacity
                  key={interest}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggleInterest(interest)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Campus Activities section matching reference */}
          <View style={styles.activitiesSection}>
            <Text style={styles.activitiesLabel}>Campus Activities</Text>
            <Input
              placeholder="Add clubs, societies, fraternities..."
              value={campusActivity}
              onChangeText={setCampusActivity}
              helper="Separate multiple with commas (e.g. Debate Club, Basketball team)"
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
        </View>

        {/* Continue button */}
        <View style={styles.actionContainer}>
          <Button
            title="Continue"
            onPress={handleContinue}
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
  counter: {
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
  pageTitle: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '700',
  },
  pageSubtitle: {
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeading: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F8F8F9',
  },
  chipSelected: {
    backgroundColor: colors.pink,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.supportingSmall,
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  activitiesSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 18,
  },
  activitiesLabel: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 10,
  },
  actionContainer: {
    marginTop: 'auto',
  },
});


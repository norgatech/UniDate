import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, Plus, Check } from 'lucide-react-native';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing, radii } from '../src/theme/spacing';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { useAuthStore } from '../src/stores/authStore';
import { INTERESTS } from '../src/types';
import { profileService } from '../src/services/profileService';

export default function EditProfileScreen() {
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);

  const [displayName, setDisplayName] = useState(profile?.display_name || 'Queen');
  const [bio, setBio] = useState(profile?.bio || 'Love books, Coffee, and deep conversations...');
  const [level, setLevel] = useState(profile?.level || '300');
  const [photo, setPhoto] = useState(
    profile?.photos?.[0]?.url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profile?.interests || ['Music', 'Reading', 'Movies']
  );
  const [activities, setActivities] = useState(
    profile?.campus_activities?.join(', ') || 'Rotaract Club, Psychology Society'
  );

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0].uri) {
      setPhoto(result.assets[0].uri);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests((prev) => prev.filter((i) => i !== interest));
    } else {
      setSelectedInterests((prev) => [...prev, interest]);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let finalPhotoUrl = photo;
      if (photo && !photo.startsWith('http')) {
        const uploadRes = await profileService.uploadProfilePhoto(photo, true);
        if (uploadRes.url) {
          finalPhotoUrl = uploadRes.url;
        }
      }

      await profileService.updateProfile({
        display_name: displayName,
        bio,
        level,
        photos: [{ id: 'p1', url: finalPhotoUrl, is_primary: true, order: 0 }],
        interests: selectedInterests,
        campus_activities: activities.split(',').map((s) => s.trim()).filter(Boolean),
      });

      await useAuthStore.getState().refreshProfile();
      Alert.alert('Profile Updated', 'Your profile changes have been saved.');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveHeaderBtn}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Photo Edit */}
          <View style={styles.photoSection}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: photo }} style={styles.avatar} contentFit="cover" />
              <TouchableOpacity
                style={styles.cameraIconBtn}
                onPress={handlePickPhoto}
                activeOpacity={0.8}
              >
                <Camera size={18} color={colors.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.photoTip}>Tap camera to update primary photo</Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <Input
              label="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
            />

            <Input
              label="About Me (Bio)"
              value={bio}
              onChangeText={setBio}
              variant="textarea"
            />

            <Input
              label="Campus Clubs & Societies"
              value={activities}
              onChangeText={setActivities}
              helper="Comma-separated"
            />

            {/* Academic Level */}
            <Text style={styles.label}>Academic Level</Text>
            <View style={styles.levelRow}>
              {['100', '200', '300', '400', '500', '600'].map((lvl) => {
                const isSelected = level === lvl;
                return (
                  <TouchableOpacity
                    key={lvl}
                    style={[styles.levelChip, isSelected && styles.levelChipActive]}
                    onPress={() => setLevel(lvl)}
                  >
                    <Text style={[styles.levelChipText, isSelected && styles.levelChipTextActive]}>
                      {lvl}L
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Interests Selector */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Interests</Text>
            <View style={styles.chipsContainer}>
              {INTERESTS.slice(0, 15).map((interest) => {
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
          </View>

          <Button title="Save Changes" onPress={handleSave} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
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
    marginBottom: 20,
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
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  saveHeaderBtn: {
    ...typography.buttonSmall,
    color: colors.primary,
    fontWeight: '700',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIconBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  photoTip: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii['2xl'],
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 14,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  levelChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  levelChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  levelChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
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
    ...typography.captionSmall,
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});


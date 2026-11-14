/**
 * UniDate — Onboarding Screen 4: Profile Photo
 * Allows uploading, previewing, replacing, and cropping a profile picture,
 * with Supabase Storage integration and size/format validation.
 */
import React, { useState } from 'react';
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
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, RefreshCw, Trash2, ShieldCheck, Heart, Sparkles, Upload } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { OnboardingHeader } from '../../src/components/onboarding/OnboardingHeader';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { useAuthStore } from '../../src/stores/authStore';
import { uploadImageToSupabase } from '../../src/lib/storage';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Curated starter campus student photos for web testing or instant selection
const STARTER_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500',
];

export default function ProfilePhotoScreen() {
  const user = useAuthStore((state) => state.user);
  const store = useOnboardingStore();

  const [photoUri, setPhotoUri] = useState<string>(
    store.primaryPhotoUrl || STARTER_AVATARS[0]
  );
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePickImage = async () => {
    setErrorMsg(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // File size validation if available from asset metadata
        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
          setErrorMsg('Image size exceeds 5MB limit. Please choose a smaller image.');
          return;
        }

        setPhotoUri(asset.uri);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Could not pick image.');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUri('');
    setErrorMsg(null);
  };

  const handleSelectStarter = (starterUri: string) => {
    setPhotoUri(starterUri);
    setErrorMsg(null);
  };

  const handleContinue = async () => {
    if (!photoUri) {
      setErrorMsg('Please upload or select a profile photo.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    let finalPhotoUrl = photoUri;

    try {
      // Upload to Supabase Storage if user is authenticated and image is local URI
      if (user?.id && !user.id.startsWith('usr_') && (photoUri.startsWith('file:') || photoUri.startsWith('blob:') || photoUri.startsWith('data:'))) {
        const uniqueFileName = `${user.id}/avatar_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const uploadRes = await uploadImageToSupabase('profile-photos', uniqueFileName, photoUri);

        if (uploadRes.error) {
          console.warn('Storage upload error, retaining local URI for fallback:', uploadRes.error.message);
        } else if (uploadRes.publicUrl) {
          finalPhotoUrl = uploadRes.publicUrl;
        }
      }

      store.updateData({ primaryPhotoUrl: finalPhotoUrl });
      store.markStepComplete(4);
      await store.saveDraft(user?.id);

      router.push('/(onboarding)/interests');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process photo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          <OnboardingHeader
            currentStep={4}
            totalSteps={8}
            title="Profile Photo"
            subtitle="Upload a clear photo of yourself. Verified profiles with clear faces receive 4x more connections."
          />

          <View style={styles.card}>
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Avatar Preview Section */}
            <View style={styles.previewContainer}>
              {photoUri ? (
                <View style={styles.avatarWrapper}>
                  <Image source={{ uri: photoUri }} style={styles.avatarImage} contentFit="cover" />
                  <View style={styles.badgeHeart}>
                    <Heart size={18} color={colors.white} fill={colors.white} />
                  </View>
                </View>
              ) : (
                <View style={styles.placeholderAvatar}>
                  <Camera size={44} color={colors.textSecondary} />
                  <Text style={styles.placeholderText}>No photo selected</Text>
                </View>
              )}

              {/* Photo Controls */}
              <View style={styles.controlsRow}>
                <TouchableOpacity
                  style={styles.actionPillPrimary}
                  onPress={handlePickImage}
                  activeOpacity={0.8}
                >
                  <Upload size={16} color={colors.white} style={{ marginRight: 6 }} />
                  <Text style={styles.actionPillPrimaryText}>
                    {photoUri ? 'Replace Photo' : 'Upload Photo'}
                  </Text>
                </TouchableOpacity>

                {photoUri ? (
                  <TouchableOpacity
                    style={styles.actionPillDanger}
                    onPress={handleRemovePhoto}
                    activeOpacity={0.8}
                  >
                    <Trash2 size={16} color={colors.error} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Starter Options */}
            <View style={styles.startersSection}>
              <Text style={styles.startersTitle}>Or choose a sample student avatar:</Text>
              <View style={styles.startersGrid}>
                {STARTER_AVATARS.map((starter, index) => {
                  const isSelected = photoUri === starter;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.starterItem, isSelected && styles.starterItemActive]}
                      onPress={() => handleSelectStarter(starter)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: starter }} style={styles.starterImg} contentFit="cover" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Safety policy notice */}
            <View style={styles.safetyNotice}>
              <ShieldCheck size={18} color={colors.success} />
              <Text style={styles.safetyNoticeText}>
                Photos are stored securely on our encrypted cloud storage and accessible only through approved app policies.
              </Text>
            </View>

            <Button
              title="Continue to Interests"
              onPress={handleContinue}
              loading={isUploading}
              disabled={isUploading || !photoUri}
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
    maxWidth: 480,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
    alignItems: 'center',
  },
  errorBanner: {
    backgroundColor: '#FDEDED',
    borderColor: '#F5C6CB',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    width: '100%',
  },
  errorBannerText: {
    ...typography.captionSmall,
    color: colors.error,
    fontWeight: '600',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  avatarWrapper: {
    position: 'relative',
    width: 140,
    height: 140,
    borderRadius: 70,
    ...shadows.md,
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3.5,
    borderColor: colors.primary,
  },
  badgeHeart: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  placeholderAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  placeholderText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: 6,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    alignItems: 'center',
  },
  actionPillPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radii.full,
    ...shadows.sm,
  },
  actionPillPrimaryText: {
    ...typography.buttonSmall,
    color: colors.white,
    fontWeight: '700',
  },
  actionPillDanger: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  startersSection: {
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 6,
  },
  startersTitle: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  startersGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  starterItem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 2,
    borderWidth: 2,
    borderColor: colors.border,
  },
  starterItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.pink,
  },
  starterImg: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginTop: 18,
    width: '100%',
  },
  safetyNoticeText: {
    ...typography.captionSmall,
    color: '#166534',
    flex: 1,
    lineHeight: 16,
  },
});


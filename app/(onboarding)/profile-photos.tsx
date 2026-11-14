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
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Plus, X, Heart, Sparkles } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radii } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';

// Default starter photos from references for immediate visual fidelity
const DEFAULT_PREVIEWS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
];

export default function ProfilePhotosScreen() {
  const params = useLocalSearchParams();
  const [photos, setPhotos] = useState<string[]>(DEFAULT_PREVIEWS);

  const handleAddPhoto = async () => {
    if (photos.length >= 6) {
      Alert.alert('Maximum reached', 'You can upload up to 6 profile photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0].uri) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (photos.length < 1) {
      Alert.alert('Photo Required', 'Please upload at least 1 photo for your profile.');
      return;
    }
    router.push({
      pathname: '/(onboarding)/profile-about',
      params: {
        ...params,
        primaryPhoto: photos[0],
        photosJson: JSON.stringify(photos),
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
            <Text style={styles.counterText}>{photos.length}/6 Photos</Text>
          </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Add Your Photos</Text>
          <Text style={styles.subtitle}>Upload 4-6 photos to get 3x more campus matches</Text>
        </View>

        {/* Photo Grid based on reference screen */}
        <View style={styles.photoGrid}>
          {/* Main Photo (Larger) */}
          <View style={styles.mainPhotoWrapper}>
            {photos.length > 0 ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photos[0] }} style={styles.mainImage} contentFit="cover" />
                <View style={styles.heartSticker}>
                  <Heart size={20} color={colors.accent} fill={colors.accent} />
                </View>
                <View style={styles.mainPhotoBadge}>
                  <Text style={styles.mainPhotoBadgeText}>Main Photo</Text>
                </View>
                {photos.length > 1 && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemovePhoto(0)}
                  >
                    <X size={14} color={colors.white} />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.uploadSlot, styles.mainSlot]}
                onPress={handleAddPhoto}
              >
                <Plus size={32} color={colors.primary} />
                <Text style={styles.uploadSlotText}>Main Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Secondary Photos / Upload Slots */}
          <View style={styles.secondaryGrid}>
            {[1, 2, 3, 4, 5].map((idx) => {
              const photo = photos[idx];
              if (photo) {
                return (
                  <View key={idx} style={styles.secondaryPhotoSlot}>
                    <Image source={{ uri: photo }} style={styles.secondaryImage} contentFit="cover" />
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleRemovePhoto(idx)}
                    >
                      <X size={14} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.secondaryUploadSlot}
                  onPress={handleAddPhoto}
                  activeOpacity={0.8}
                >
                  <Plus size={24} color={colors.primary} />
                  <Text style={styles.slotPlusText}>Add</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Photo Tips Card matching reference */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Sparkles size={16} color="#A96713" />
            <Text style={styles.tipsTitle}>Photo Tips:</Text>
          </View>
          <Text style={styles.tipItem}>• Use clear, recent photos</Text>
          <Text style={styles.tipItem}>• Show your face clearly in good lighting</Text>
          <Text style={styles.tipItem}>• Group photos are great for secondary slots</Text>
          <Text style={styles.tipItem}>• No inappropriate or misleading pictures</Text>
        </View>

        {/* Continue Button */}
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
  counterText: {
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
  photoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  mainPhotoWrapper: {
    flex: 1.2,
    aspectRatio: 3 / 4,
  },
  photoContainer: {
    width: '100%',
    height: '100%',
    borderRadius: radii.xl,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  heartSticker: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.surface,
    padding: 6,
    borderRadius: radii.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  mainPhotoBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  mainPhotoBadgeText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '700',
  },
  secondaryGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  secondaryPhotoSlot: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  secondaryImage: {
    width: '100%',
    height: '100%',
  },
  secondaryUploadSlot: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D4A5A5',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadSlot: {
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D4A5A5',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainSlot: {
    width: '100%',
    height: '100%',
  },
  uploadSlotText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 6,
    fontWeight: '600',
  },
  slotPlusText: {
    ...typography.captionSmall,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsCard: {
    backgroundColor: '#FFFBEA',
    padding: 16,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 24,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tipsTitle: {
    ...typography.label,
    color: '#92400E',
    fontWeight: '700',
  },
  tipItem: {
    ...typography.caption,
    color: '#78350F',
    lineHeight: 18,
    marginTop: 2,
  },
  actionContainer: {
    marginTop: 'auto',
  },
});


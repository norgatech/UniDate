import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Heart, Sparkles, X } from 'lucide-react-native';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing, radii } from '../src/theme/spacing';
import { Button } from '../src/components/ui/Button';
import { useAuthStore } from '../src/stores/authStore';
import { useOnboardingStore } from '../src/stores/onboardingStore';

export default function MatchCelebrationScreen() {
  const params = useLocalSearchParams<{
    profileId?: string;
    profileName?: string;
    profilePhoto?: string;
  }>();

  const userProfile = useAuthStore((state) => state.profile);
  const onboardingPhoto = useOnboardingStore((state) => state.primaryPhotoUrl);

  const partnerName = params.profileName || 'Sarah';
  const partnerPhoto =
    params.profilePhoto ||
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400';

  // Distinct fallback user photo (female student demo avatar)
  const defaultUserPhoto =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';

  let myPhoto =
    userProfile?.photos?.[0]?.url ||
    onboardingPhoto ||
    defaultUserPhoto;

  // Guarantee that myPhoto and partnerPhoto are never identical
  if (myPhoto === partnerPhoto) {
    myPhoto =
      partnerPhoto === defaultUserPhoto
        ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'
        : defaultUserPhoto;
  }

  const handleSendMessage = () => {
    router.replace({
      pathname: '/chat/[id]',
      params: {
        id: params.profileId ? `conv-${params.profileId}` : 'conv-1',
        name: partnerName,
        photo: partnerPhoto,
      },
    });
  };

  const handleSendWave = () => {
    router.replace({
      pathname: '/chat/[id]',
      params: {
        id: params.profileId ? `conv-${params.profileId}` : 'conv-1',
        name: partnerName,
        photo: partnerPhoto,
        initialWave: 'true',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Close button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <X size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Title matching reference */}
        <View style={styles.header}>
          <Text style={styles.matchTitle}>It's a</Text>
          <Text style={styles.matchTitleAccent}>Match!</Text>
          <Text style={styles.matchSubtitle}>
            You and {partnerName} both liked each other
          </Text>
        </View>

        {/* Interlocking Heart graphic with circular avatars matching reference */}
        <View style={styles.heartGraphicSection}>
          <View style={styles.heartShapeContainer}>
            <Heart size={210} color={colors.primary} fill={colors.primary} />
            <View style={styles.avatarLeft}>
              <Image source={{ uri: myPhoto }} style={styles.avatarImg} contentFit="cover" />
            </View>
            <View style={styles.avatarRight}>
              <Image source={{ uri: partnerPhoto }} style={styles.avatarImg} contentFit="cover" />
            </View>
          </View>
        </View>

        {/* Action Buttons matching reference */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryBurgundyBtn}
            onPress={handleSendMessage}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBurgundyBtnText}>Send Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryWhiteBtn}
            onPress={handleSendWave}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryWhiteBtnText}>Send a Wave</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.keepSwipingBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.keepSwipingText}>Keep Discovering</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  matchTitle: {
    ...typography.h1,
    fontSize: 34,
    lineHeight: 40,
    color: colors.primary,
    fontWeight: '800',
  },
  matchTitleAccent: {
    ...typography.h1,
    fontSize: 40,
    lineHeight: 48,
    color: colors.primary,
    fontWeight: '900',
  },
  matchSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  heartGraphicSection: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 20,
  },
  heartShapeContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarLeft: {
    position: 'absolute',
    left: 20,
    top: 50,
    width: 74,
    height: 74,
    borderRadius: 37,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.white,
    zIndex: 2,
  },
  avatarRight: {
    position: 'absolute',
    right: 20,
    top: 50,
    width: 74,
    height: 74,
    borderRadius: 37,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.white,
    zIndex: 2,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  buttonsContainer: {
    width: '100%',
    gap: 14,
  },
  primaryBurgundyBtn: {
    backgroundColor: colors.primary,
    minHeight: 52,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBurgundyBtnText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
  },
  secondaryWhiteBtn: {
    backgroundColor: colors.surface,
    minHeight: 52,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryWhiteBtnText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '700',
  },
  keepSwipingBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  keepSwipingText: {
    ...typography.supporting,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});


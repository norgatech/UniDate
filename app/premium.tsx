import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Crown, Star, CheckCircle, Sparkles } from 'lucide-react-native';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing, radii, shadows } from '../src/theme/spacing';

export default function PremiumScreen() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'UniDate Gold Active! 🌟',
        'Thank you! Your premium privileges are unlocked. Enjoy unlimited likes, seeing who liked you, and 5 daily super likes!',
        [{ text: 'Awesome', onPress: () => router.back() }]
      );
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <X size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Crown & Star Icon matching reference */}
          <View style={styles.heroSection}>
            <View style={styles.crownBadge}>
              <Crown size={38} color="#D97706" />
              <Star size={24} color="#F59E0B" fill="#F59E0B" style={styles.starFloating} />
            </View>
            <Text style={styles.heroTitle}>Upgrade to Premium</Text>
            <Text style={styles.heroSubtitle}>
              Unlock all features and elevate your campus social discovery experience
            </Text>
          </View>

          {/* Features List matching reference */}
          <View style={styles.featuresCardList}>
            {/* Feature 1 */}
            <View style={styles.featureCard}>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Unlimited likes</Text>
                <Text style={styles.featureDesc}>Like as many profiles as you want without daily limits</Text>
              </View>
              <CheckCircle size={22} color={colors.primary} />
            </View>

            {/* Feature 2 */}
            <View style={styles.featureCard}>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>See Who Liked You</Text>
                <Text style={styles.featureDesc}>No more guessing — see everyone who liked your profile instantly</Text>
              </View>
              <CheckCircle size={22} color={colors.primary} />
            </View>

            {/* Feature 3 */}
            <View style={styles.featureCard}>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>5 Super Likes Daily</Text>
                <Text style={styles.featureDesc}>Stand out to the people you are really interested in</Text>
              </View>
              <CheckCircle size={22} color={colors.primary} />
            </View>
          </View>

          {/* Pricing CTA Button matching reference */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleSubscribe}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaPriceText}>#2500/ Month</Text>
            <Text style={styles.ctaSubtext}>Special launch offer • Cancel anytime</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            Safety tools, reporting, and mutual chat remain 100% free for all verified students. Recurring billing automatically renews monthly until cancelled in settings.
          </Text>
        </ScrollView>
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
    paddingTop: 12,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  crownBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
    ...shadows.sm,
  },
  starFloating: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  featuresCardList: {
    gap: 12,
    marginVertical: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  featureTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  featureTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaPriceText: {
    ...typography.button,
    fontSize: 18,
    color: colors.white,
    fontWeight: '800',
  },
  ctaSubtext: {
    ...typography.captionSmall,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  disclaimerText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
});


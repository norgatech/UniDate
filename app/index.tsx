/**
 * UniDate — Splash Screen / Entry Point
 * Animated brand splash with logo and tagline
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { Heart } from 'lucide-react-native';
import { useAuthStore } from '../src/stores/authStore';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;

  const navigateNext = () => {
    const { isAuthenticated, hasCompletedOnboarding, profile } = useAuthStore.getState();
    if (isAuthenticated) {
      if (hasCompletedOnboarding || profile?.is_profile_complete) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(onboarding)/personal-info');
      }
    } else {
      router.replace('/onboarding');
    }
  };

  useEffect(() => {
    const isWeb = Platform.OS === 'web';
    // Animate logo in
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: !isWeb,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: !isWeb,
        }),
      ]),
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: !isWeb,
      }),
    ]).start();

    // Navigate automatically after short delay
    const timer = setTimeout(() => {
      navigateNext();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <TouchableOpacity
      style={styles.touchableContainer}
      activeOpacity={1}
      onPress={navigateNext}
    >
      <View style={styles.container}>
        {/* Decorative blurred hearts */}
        <View style={styles.decorTopRight}>
          <Heart size={120} color={colors.accent} fill={colors.accent} style={{ opacity: 0.15 }} />
        </View>
        <View style={styles.decorBottomLeft}>
          <Heart size={80} color={colors.primary} fill={colors.primary} style={{ opacity: 0.1 }} />
        </View>
        <View style={styles.decorMidRight}>
          <Heart size={40} color={colors.pink} fill={colors.pink} style={{ opacity: 0.3 }} />
        </View>

        {/* Main Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require('../assets/logo.png')}
            style={styles.logoImage}
            contentFit="contain"
          />
          <Text style={styles.brandName}>Uni</Text>
          <Text style={styles.brandNameAccent}>DATE</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={[styles.taglineContainer, { opacity: taglineFade }]}>
          <Text style={styles.tagline}>Meet. Connect. Belong.</Text>
        </Animated.View>

        {/* Tap indicator */}
        <View style={styles.tapPrompt}>
          <Text style={styles.tapPromptText}>Tap anywhere to start</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchableContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  decorTopRight: {
    position: 'absolute',
    top: -20,
    right: -30,
  },
  decorBottomLeft: {
    position: 'absolute',
    bottom: 80,
    left: -20,
  },
  decorMidRight: {
    position: 'absolute',
    top: '30%',
    right: 30,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  brandName: {
    ...typography.h1,
    fontSize: 40,
    lineHeight: 46,
    color: colors.primary,
    letterSpacing: 1,
  },
  brandNameAccent: {
    ...typography.h1,
    fontSize: 46,
    lineHeight: 52,
    color: colors.primary,
    fontWeight: '900',
    letterSpacing: 4,
  },
  taglineContainer: {
    marginTop: 14,
  },
  tagline: {
    ...typography.supporting,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  tapPrompt: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: 'rgba(151, 13, 25, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tapPromptText: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '600',
  },
});

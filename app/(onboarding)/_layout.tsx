import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function OnboardingGroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      {/* 9-Step Onboarding Architecture */}
      <Stack.Screen name="personal-info" />
      <Stack.Screen name="university" />
      <Stack.Screen name="academic" />
      <Stack.Screen name="photo" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="bio" />
      <Stack.Screen name="verification" />
      <Stack.Screen name="preview" />
      <Stack.Screen name="complete" />

      {/* Backward-Compatibility & Sub-Screen Aliases */}
      <Stack.Screen name="eligibility" />
      <Stack.Screen name="profile-photos" />
      <Stack.Screen name="profile-about" />
      <Stack.Screen name="profile-interests" />
      <Stack.Screen name="profile-preferences" />
      <Stack.Screen name="profile-preview" />
      <Stack.Screen name="verification-upload" />
      <Stack.Screen name="verification-status" />
    </Stack>
  );
}

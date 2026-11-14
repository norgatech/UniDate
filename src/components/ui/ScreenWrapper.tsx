/**
 * UniDate — Screen Wrapper Component
 * Provides consistent screen layout with safe area handling
 */
import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  backgroundColor?: string;
  padded?: boolean;
  safeArea?: boolean;
  keyboardAvoiding?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = true,
  backgroundColor = colors.background,
  padded = true,
  safeArea = true,
  keyboardAvoiding = false,
  style,
  contentContainerStyle,
}) => {
  const Wrapper = safeArea ? SafeAreaView : View;
  const paddedStyle = padded
    ? { paddingHorizontal: layout.screenPaddingHorizontal }
    : undefined;

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, paddedStyle, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, paddedStyle, contentContainerStyle, style]}>
      {children}
    </View>
  );

  const wrapped = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {content}
    </KeyboardAvoidingView>
  ) : content;

  return (
    <Wrapper style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      {wrapped}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});


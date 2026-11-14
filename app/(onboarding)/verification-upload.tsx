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
import {
  ArrowLeft,
  Upload,
  Camera,
  CheckCircle,
  ShieldCheck,
  Lock,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radii } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { uploadImageToSupabase } from '../../src/lib/storage';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/stores/authStore';

export default function VerificationUploadScreen() {
  const params = useLocalSearchParams<{
    uniName?: string;
    fullName?: string;
    matricNumber?: string;
    faculty?: string;
    department?: string;
    level?: string;
  }>();

  const [studentIdImage, setStudentIdImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickDocument = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setStudentIdImage(result.assets[0].uri);
    }
  };

  const handleTakeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera Permission', 'Camera access is needed to capture a verification selfie.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setSelfieImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const user = useAuthStore.getState().user;

    let uploadedDocUrl = studentIdImage;
    let uploadedSelfieUrl = selfieImage;

    if (isSupabaseConfigured() && user?.id && !user.id.startsWith('usr_')) {
      try {
        if (studentIdImage) {
          const docRes = await uploadImageToSupabase(
            'student-verifications',
            `${user.id}/student_id_${Date.now()}.jpg`,
            studentIdImage
          );
          if (docRes.path) uploadedDocUrl = docRes.path;
        }

        if (selfieImage) {
          const selfieRes = await uploadImageToSupabase(
            'student-verifications',
            `${user.id}/selfie_${Date.now()}.jpg`,
            selfieImage
          );
          if (selfieRes.path) uploadedSelfieUrl = selfieRes.path;
        }

        // Insert into verification_submissions table in Supabase
        await supabase.from('verification_submissions').insert({
          user_id: user.id,
          full_name: params.fullName || 'Student',
          matric_number: params.matricNumber || '',
          faculty: params.faculty || '',
          department: params.department || '',
          academic_level: params.level || '',
          student_id_document_url: uploadedDocUrl,
          selfie_url: uploadedSelfieUrl,
          status: 'pending',
        });
      } catch (err) {
        console.warn('Supabase verification submission error:', err);
      }
    }

    setIsSubmitting(false);
    router.push({
      pathname: '/(onboarding)/verification-status',
      params: {
        status: 'pending',
        fullName: params.fullName || 'Student',
        matricNumber: params.matricNumber || '190404012',
        uniName: params.uniName || 'University of Ghana',
        faculty: params.faculty || 'Science',
        department: params.department || 'Computer Science',
        level: params.level || '300',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {/* Navigation row */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.secureTag}>
            <Lock size={12} color={colors.primary} />
            <Text style={styles.secureTagText}>Private & Encrypted</Text>
          </View>
        </View>

        {/* Heading & Progress Bar */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Student Verification</Text>
          <Text style={styles.stepSubtitle}>Step 2 of 3: Verification Upload</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '66%' }]} />
          </View>
        </View>

        {/* Upload Container 1: Student ID */}
        <View style={styles.dashedBox}>
          {studentIdImage ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: studentIdImage }} style={styles.imagePreview} contentFit="cover" />
              <View style={styles.verifiedCheckBadge}>
                <CheckCircle size={20} color={colors.success} fill={colors.white} />
              </View>
              <TouchableOpacity style={styles.reselectButton} onPress={handlePickDocument}>
                <Text style={styles.reselectText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.iconCirclePurple}>
                <Upload size={32} color={colors.white} />
              </View>
              <Text style={styles.uploadTitle}>Upload Student ID</Text>
              <Text style={styles.uploadDesc}>
                Take a clear photo of your student ID card or portal admission slip
              </Text>
              <TouchableOpacity
                style={styles.burgundyPillButton}
                onPress={handlePickDocument}
                activeOpacity={0.8}
              >
                <Text style={styles.burgundyPillButtonText}>Choose File</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Upload Container 2: Selfie / Liveness */}
        <View style={styles.dashedBox}>
          {selfieImage ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selfieImage }} style={styles.imagePreviewSquare} contentFit="cover" />
              <View style={styles.verifiedCheckBadge}>
                <CheckCircle size={20} color={colors.success} fill={colors.white} />
              </View>
              <TouchableOpacity style={styles.reselectButton} onPress={handleTakeSelfie}>
                <Text style={styles.reselectText}>Retake Selfie</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.iconCircleBlue}>
                <Camera size={32} color={colors.white} />
              </View>
              <Text style={styles.uploadTitle}>Take a Selfie</Text>
              <Text style={styles.uploadDesc}>
                Quick face photo to verify you match your student ID card
              </Text>
              <TouchableOpacity
                style={styles.burgundyPillButton}
                onPress={handleTakeSelfie}
                activeOpacity={0.8}
              >
                <Text style={styles.burgundyPillButtonText}>Take a selfie</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Privacy & Security Notice as requested in specifications */}
        <View style={styles.privacyNoticeCard}>
          <ShieldCheck size={20} color={colors.primary} style={{ marginTop: 2 }} />
          <View style={styles.privacyNoticeContent}>
            <Text style={styles.privacyNoticeTitle}>Your verification documents are 100% private</Text>
            <Text style={styles.privacyNoticeDesc}>
              Verification documents are never shown on your dating profile or made public. They are stored in an encrypted private vault strictly for collegiate enrollment review.
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.actionContainer}>
          <Button
            title="Submit for Verification"
            onPress={handleSubmit}
            loading={isSubmitting}
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
  secureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.pink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  secureTagText: {
    ...typography.captionSmall,
    color: colors.primaryDeep,
    fontWeight: '700',
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  stepSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
  dashedBox: {
    borderWidth: 1.5,
    borderColor: '#D4A5A5',
    borderStyle: 'dashed',
    borderRadius: radii['2xl'],
    backgroundColor: colors.surface,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    width: '100%',
  },
  iconCirclePurple: {
    width: 64,
    height: 64,
    borderRadius: radii.lg,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconCircleBlue: {
    width: 64,
    height: 64,
    borderRadius: radii.lg,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: 4,
  },
  uploadDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  burgundyPillButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: radii.full,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  burgundyPillButtonText: {
    ...typography.buttonSmall,
    color: colors.white,
    fontWeight: '600',
  },
  previewContainer: {
    alignItems: 'center',
    width: '100%',
  },
  imagePreview: {
    width: '100%',
    height: 140,
    borderRadius: radii.lg,
  },
  imagePreviewSquare: {
    width: 140,
    height: 140,
    borderRadius: radii.lg,
  },
  verifiedCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  reselectButton: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: colors.pink,
    borderRadius: radii.full,
  },
  reselectText: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '700',
  },
  privacyNoticeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF7F7',
    padding: 16,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.pink,
    marginVertical: 8,
    gap: 12,
  },
  privacyNoticeContent: {
    flex: 1,
  },
  privacyNoticeTitle: {
    ...typography.label,
    color: colors.primaryDeep,
    fontWeight: '700',
    marginBottom: 4,
  },
  privacyNoticeDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actionContainer: {
    marginTop: 16,
  },
});


/**
 * UniDate — Onboarding Screen 7: Student Verification
 * Dedicated student verification submission with private ID upload,
 * status tracking (pending, verified, rejected, resubmission_required),
 * and zero-trust verification enforcement (users never mark themselves verified).
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {
  ShieldCheck,
  Upload,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Camera,
  Trash2,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { OnboardingHeader } from '../../src/components/onboarding/OnboardingHeader';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { useAuthStore } from '../../src/stores/authStore';
import { uploadImageToSupabase } from '../../src/lib/storage';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';
import type { VerificationStatus } from '../../src/types';

export default function StudentVerificationScreen() {
  const user = useAuthStore((state) => state.user);
  const store = useOnboardingStore();

  const [matricNumber, setMatricNumber] = useState(store.matricNumber || '');
  const [docUri, setDocUri] = useState<string | null>(store.studentIdDocumentUrl || null);
  const [selfieUri, setSelfieUri] = useState<string | null>(store.selfieUrl || null);
  const [status, setStatus] = useState<VerificationStatus>(store.verificationStatus || 'not_submitted');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check if existing submission exists in Supabase
  useEffect(() => {
    async function checkExistingSubmission() {
      if (!isSupabaseConfigured() || !user?.id || user.id.startsWith('usr_')) return;
      try {
        const { data } = await supabase
          .from('verification_submissions')
          .select('status, matric_number, student_id_document_url, selfie_url, review_notes')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setStatus(data.status);
          if (data.matric_number) setMatricNumber(data.matric_number);
          if (data.student_id_document_url) setDocUri(data.student_id_document_url);
          if (data.selfie_url) setSelfieUri(data.selfie_url);
        }
      } catch (e) {
        console.warn('Error checking verification submission:', e);
      }
    }

    checkExistingSubmission();
  }, [user?.id]);

  const handlePickDocument = async () => {
    setErrorMsg(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocUri(result.assets[0].uri);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Could not pick document.');
    }
  };

  const handlePickSelfie = async () => {
    setErrorMsg(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelfieUri(result.assets[0].uri);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Could not pick selfie image.');
    }
  };

  const handleSubmitVerification = async () => {
    if (!matricNumber.trim()) {
      setErrorMsg('Please enter your Student ID or Matriculation number.');
      return;
    }
    if (!docUri) {
      setErrorMsg('Please upload a photo of your Student ID card or admission letter.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    let storedDocPath = docUri;
    let storedSelfiePath = selfieUri;

    try {
      const uid = user?.id || 'usr_draft';

      // Upload ID document to PRIVATE student-verifications bucket
      if (isSupabaseConfigured() && uid && !uid.startsWith('usr_')) {
        if (docUri.startsWith('file:') || docUri.startsWith('blob:') || docUri.startsWith('data:')) {
          const docFileName = `${uid}/id_doc_${Date.now()}.jpg`;
          const uploadRes = await uploadImageToSupabase('student-verifications', docFileName, docUri);
          if (uploadRes.path) {
            storedDocPath = uploadRes.path;
          }
        }

        if (selfieUri && (selfieUri.startsWith('file:') || selfieUri.startsWith('blob:') || selfieUri.startsWith('data:'))) {
          const selfieFileName = `${uid}/selfie_${Date.now()}.jpg`;
          const selfieRes = await uploadImageToSupabase('student-verifications', selfieFileName, selfieUri);
          if (selfieRes.path) {
            storedSelfiePath = selfieRes.path;
          }
        }

        // Insert submission record with 'pending' status — client CANNOT set 'verified'
        const { error: subErr } = await supabase.from('verification_submissions').insert({
          user_id: uid,
          full_name: store.fullName || store.displayName,
          matric_number: matricNumber.trim(),
          faculty: store.facultyName || 'General',
          department: store.departmentName || 'General',
          academic_level: store.level || '100',
          student_id_document_url: storedDocPath,
          selfie_url: storedSelfiePath,
          status: 'pending',
        });

        if (subErr) {
          console.warn('Verification insert warning:', subErr.message);
        }
      }

      // Update store with pending verification status
      store.updateData({
        matricNumber: matricNumber.trim(),
        studentIdDocumentUrl: storedDocPath,
        selfieUrl: storedSelfiePath || '',
        verificationStatus: 'pending',
      });
      setStatus('pending');
      store.markStepComplete(7);
      await store.saveDraft(user?.id);

      router.push('/(onboarding)/preview');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while uploading verification credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipForNow = async () => {
    store.updateData({
      matricNumber: matricNumber.trim(),
      verificationStatus: status === 'verified' ? 'verified' : 'not_submitted',
    });
    store.markStepComplete(7);
    await store.saveDraft(user?.id);

    router.push('/(onboarding)/preview');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentWrapper}>
            <OnboardingHeader
              currentStep={7}
              totalSteps={8}
              title="Student Verification"
              subtitle="Submit your institutional credentials to earn the verified campus student badge."
            />

            <View style={styles.card}>
              {/* Status Banner */}
              {status === 'verified' && (
                <View style={[styles.statusBox, styles.statusBoxVerified]}>
                  <CheckCircle2 size={24} color={colors.success} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.statusTitle, { color: colors.success }]}>
                      Verified Student Account
                    </Text>
                    <Text style={styles.statusSubtitle}>
                      Your student identity has been confirmed by our verification team.
                    </Text>
                  </View>
                </View>
              )}

              {status === 'pending' && (
                <View style={[styles.statusBox, styles.statusBoxPending]}>
                  <Clock size={24} color={colors.warning} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.statusTitle, { color: colors.warning }]}>
                      Verification Under Review
                    </Text>
                    <Text style={styles.statusSubtitle}>
                      Documents submitted securely. Review typically completes in under 15 minutes.
                    </Text>
                  </View>
                </View>
              )}

              {status === 'rejected' && (
                <View style={[styles.statusBox, styles.statusBoxRejected]}>
                  <AlertTriangle size={24} color={colors.error} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.statusTitle, { color: colors.error }]}>
                      Resubmission Required
                    </Text>
                    <Text style={styles.statusSubtitle}>
                      Your previous document was unreadable or mismatched. Please upload a clear photo of your student ID.
                    </Text>
                  </View>
                </View>
              )}

              {errorMsg ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* Matriculation / Student ID Input */}
              <Input
                label="Student ID / Matriculation Number"
                placeholder="e.g. 10982345 or UG/CS/2023/042"
                value={matricNumber}
                onChangeText={(v) => {
                  setMatricNumber(v);
                  if (errorMsg) setErrorMsg(null);
                }}
                autoCapitalize="characters"
                helper="Used solely to confirm active university registration"
                leftIcon={<FileText size={18} color={colors.textSecondary} />}
              />

              {/* ID Document Upload Box */}
              <Text style={styles.fieldLabel}>Student ID Card / Admission Proof</Text>
              {docUri ? (
                <View style={styles.docPreviewCard}>
                  <Image source={{ uri: docUri }} style={styles.docImage} contentFit="cover" />
                  <TouchableOpacity
                    style={styles.removeDocBtn}
                    onPress={() => setDocUri(null)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadDottedBox}
                  onPress={handlePickDocument}
                  activeOpacity={0.75}
                >
                  <View style={styles.uploadIconCircle}>
                    <Upload size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.uploadBoxTitle}>Upload Student ID</Text>
                  <Text style={styles.uploadBoxSubtitle}>
                    Take a photo or choose from library (PNG, JPG up to 5MB)
                  </Text>
                </TouchableOpacity>
              )}

              {/* Optional Verification Selfie */}
              <Text style={[styles.fieldLabel, { marginTop: 18 }]}>
                Verification Selfie (Optional)
              </Text>
              {selfieUri ? (
                <View style={styles.docPreviewCard}>
                  <Image source={{ uri: selfieUri }} style={styles.docImage} contentFit="cover" />
                  <TouchableOpacity
                    style={styles.removeDocBtn}
                    onPress={() => setSelfieUri(null)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.uploadDottedBox, { paddingVertical: 14 }]}
                  onPress={handlePickSelfie}
                  activeOpacity={0.75}
                >
                  <Camera size={20} color={colors.textSecondary} />
                  <Text style={[styles.uploadBoxTitle, { fontSize: 13, marginTop: 4 }]}>
                    Add Selfie for Fast-Track Review
                  </Text>
                </TouchableOpacity>
              )}

              {/* Privacy Shield Notice */}
              <View style={styles.privacyNotice}>
                <Lock size={16} color="#4B5563" />
                <Text style={styles.privacyNoticeText}>
                  Your ID documents are stored in an encrypted, private vault. Other students never see your credentials.
                </Text>
              </View>

              {/* Submit Buttons */}
              <Button
                title={status === 'pending' ? 'Update & Proceed' : 'Submit Credentials'}
                onPress={handleSubmitVerification}
                loading={isSubmitting}
                disabled={isSubmitting}
                showArrow
                style={{ marginTop: 22 }}
              />

              <TouchableOpacity
                style={styles.skipBtn}
                onPress={handleSkipForNow}
                activeOpacity={0.7}
              >
                <Text style={styles.skipBtnText}>Verify Later in Settings →</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusBoxVerified: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  statusBoxPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
  },
  statusBoxRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  statusTitle: {
    ...typography.label,
    fontWeight: '700',
    fontSize: 14,
  },
  statusSubtitle: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  errorBanner: {
    backgroundColor: '#FDEDED',
    borderColor: '#F5C6CB',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    ...typography.captionSmall,
    color: colors.error,
    fontWeight: '600',
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
  },
  uploadDottedBox: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radii.xl,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadBoxTitle: {
    ...typography.label,
    color: colors.primaryDeep,
    fontWeight: '700',
  },
  uploadBoxSubtitle: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  docPreviewCard: {
    width: '100%',
    height: 180,
    borderRadius: radii.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
  },
  docImage: {
    width: '100%',
    height: '100%',
  },
  removeDocBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: radii.lg,
    marginTop: 18,
  },
  privacyNoticeText: {
    ...typography.captionSmall,
    color: '#4B5563',
    flex: 1,
    lineHeight: 16,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  skipBtnText: {
    ...typography.supporting,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

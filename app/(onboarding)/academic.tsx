/**
 * UniDate — Onboarding Screen 3: Academic Information
 * Dynamically loads faculties based on selected university,
 * and departments based on selected faculty from Supabase database.
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
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GraduationCap, BookOpen, Layers, Check, School } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { OnboardingHeader } from '../../src/components/onboarding/OnboardingHeader';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { useAuthStore } from '../../src/stores/authStore';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';
import { MOCK_UNIVERSITIES } from '../../src/data/mockData';
import { ACADEMIC_LEVELS } from '../../src/types';

interface FacultyItem {
  id: string;
  name: string;
}

interface DepartmentItem {
  id: string;
  name: string;
}

export default function AcademicInfoScreen() {
  const user = useAuthStore((state) => state.user);
  const store = useOnboardingStore();

  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const [selectedFaculty, setSelectedFaculty] = useState<FacultyItem | null>(null);
  const [selectedDept, setSelectedDept] = useState<DepartmentItem | null>(null);
  const [academicLevel, setAcademicLevel] = useState<string>(store.level || '200');
  const [courseProgramme, setCourseProgramme] = useState<string>(store.courseProgramme || '');

  const [errors, setErrors] = useState<{
    faculty?: string;
    department?: string;
    level?: string;
  }>({});

  // 1. Load faculties for selected university
  useEffect(() => {
    let isMounted = true;
    async function loadFaculties() {
      setLoadingFaculties(true);
      try {
        if (isSupabaseConfigured() && store.universityId) {
          const { data, error } = await supabase
            .from('faculties')
            .select('id, name')
            .eq('university_id', store.universityId)
            .order('name');

          if (!error && data && data.length > 0 && isMounted) {
            setFaculties(data);
            if (store.facultyName) {
              const prev = data.find((f: any) => f.name === store.facultyName);
              if (prev) setSelectedFaculty(prev);
            }
            setLoadingFaculties(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Faculties load exception:', e);
      }

      // Fallback from mock data
      if (isMounted) {
        const uni = MOCK_UNIVERSITIES.find((u) => u.id === store.universityId) || MOCK_UNIVERSITIES[0];
        const facs = uni?.faculties?.map((f) => ({ id: f.id, name: f.name })) || [];
        setFaculties(facs);
        if (facs.length > 0) {
          const prev = facs.find((f) => f.name === store.facultyName) || facs[0];
          setSelectedFaculty(prev);
        }
        setLoadingFaculties(false);
      }
    }

    loadFaculties();
    return () => {
      isMounted = false;
    };
  }, [store.universityId]);

  // 2. Load departments when selectedFaculty changes
  useEffect(() => {
    let isMounted = true;
    if (!selectedFaculty) return;

    async function loadDepartments() {
      setLoadingDepartments(true);
      try {
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('departments')
            .select('id, name')
            .eq('faculty_id', selectedFaculty!.id)
            .order('name');

          if (!error && data && data.length > 0 && isMounted) {
            setDepartments(data);
            if (store.departmentName) {
              const prev = data.find((d: any) => d.name === store.departmentName);
              if (prev) setSelectedDept(prev);
            }
            setLoadingDepartments(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Departments load exception:', e);
      }

      // Fallback from mock data
      if (isMounted) {
        const uni = MOCK_UNIVERSITIES.find((u) => u.id === store.universityId) || MOCK_UNIVERSITIES[0];
        const fac = uni?.faculties?.find((f) => f.id === selectedFaculty!.id || f.name === selectedFaculty!.name);
        const depts = fac?.departments?.map((d) => ({ id: d.id, name: d.name })) || [];
        setDepartments(depts);
        if (depts.length > 0) {
          const prev = depts.find((d) => d.name === store.departmentName) || depts[0];
          setSelectedDept(prev);
        }
        setLoadingDepartments(false);
      }
    }

    loadDepartments();
    return () => {
      isMounted = false;
    };
  }, [selectedFaculty?.id]);

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!selectedFaculty) errs.faculty = 'Please select your faculty';
    if (!selectedDept) errs.department = 'Please select your academic department';
    if (!academicLevel) errs.level = 'Please select your academic year level';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    store.updateData({
      facultyId: selectedFaculty!.id,
      facultyName: selectedFaculty!.name,
      departmentId: selectedDept!.id,
      departmentName: selectedDept!.name,
      level: academicLevel,
      courseProgramme: courseProgramme.trim() || selectedDept!.name,
    });
    store.markStepComplete(3);
    await store.saveDraft(user?.id);

    router.push('/(onboarding)/photo');
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
              currentStep={3}
              totalSteps={8}
              title="Academic Information"
              subtitle={`Details for ${store.universityName || 'your university'}.`}
            />

            <View style={styles.card}>
              {/* Selected University Banner */}
              <View style={styles.uniBanner}>
                <School size={16} color={colors.primary} />
                <Text style={styles.uniBannerText} numberOfLines={1}>
                  Campus: <Text style={{ fontWeight: '700' }}>{store.universityName || 'Selected University'}</Text>
                </Text>
              </View>

              {/* 1. Faculty Selection */}
              <Text style={styles.sectionHeading}>Faculty / College</Text>
              {loadingFaculties ? (
                <View style={styles.inlineLoader}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.inlineLoaderText}>Loading faculties…</Text>
                </View>
              ) : (
                <View style={styles.chipsContainer}>
                  {faculties.map((f) => {
                    const isSelected = selectedFaculty?.id === f.id;
                    return (
                      <TouchableOpacity
                        key={f.id}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => {
                          setSelectedFaculty(f);
                          setSelectedDept(null);
                          if (errors.faculty) setErrors((p) => ({ ...p, faculty: undefined }));
                        }}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                          {f.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              {errors.faculty && <Text style={styles.errorText}>{errors.faculty}</Text>}

              {/* 2. Department Selection */}
              <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Department / Major</Text>
              {loadingDepartments ? (
                <View style={styles.inlineLoader}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.inlineLoaderText}>Loading departments…</Text>
                </View>
              ) : departments.length > 0 ? (
                <View style={styles.chipsContainer}>
                  {departments.map((d) => {
                    const isSelected = selectedDept?.id === d.id;
                    return (
                      <TouchableOpacity
                        key={d.id}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => {
                          setSelectedDept(d);
                          if (errors.department) setErrors((p) => ({ ...p, department: undefined }));
                        }}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                          {d.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.emptyPrompt}>Select a faculty above to view departments</Text>
              )}
              {errors.department && <Text style={styles.errorText}>{errors.department}</Text>}

              {/* 3. Academic Level */}
              <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Academic Level</Text>
              <View style={styles.levelRow}>
                {['100', '200', '300', '400', '500', '600', 'Postgrad'].map((lvl) => {
                  const isSelected = academicLevel === lvl;
                  return (
                    <TouchableOpacity
                      key={lvl}
                      style={[styles.levelChip, isSelected && styles.levelChipActive]}
                      onPress={() => setAcademicLevel(lvl)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.levelChipText, isSelected && styles.levelChipTextActive]}>
                        {lvl === 'Postgrad' ? 'PG' : `${lvl}L`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 4. Course / Programme (optional) */}
              <Input
                label="Course / Programme (Optional)"
                placeholder="e.g. BSc Computer Science"
                value={courseProgramme}
                onChangeText={setCourseProgramme}
                leftIcon={<BookOpen size={18} color={colors.textSecondary} />}
                containerStyle={{ marginTop: 14 }}
              />

              <Button
                title="Continue to Profile Photo"
                onPress={handleContinue}
                showArrow
                style={{ marginTop: 20 }}
              />
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
  uniBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.pink,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    marginBottom: 16,
  },
  uniBannerText: {
    ...typography.captionSmall,
    color: colors.primaryDeep,
    flex: 1,
  },
  sectionHeading: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#FAFAFA',
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.pink,
  },
  chipText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.primaryDeep,
    fontWeight: '700',
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  levelChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#FAFAFA',
    minWidth: 54,
    alignItems: 'center',
  },
  levelChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  levelChipText: {
    ...typography.captionSmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  levelChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  inlineLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  inlineLoaderText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
  },
  emptyPrompt: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  errorText: {
    ...typography.captionSmall,
    color: colors.error,
    marginTop: 4,
  },
});


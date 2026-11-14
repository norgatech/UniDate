import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ShieldCheck,
  Eye,
  Lock,
  Ban,
  AlertTriangle,
  ChevronRight,
  HeartHandshake,
} from 'lucide-react-native';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { useAuthStore } from '../src/stores/authStore';
import { profileService } from '../src/services/profileService';
import { safetyService } from '../src/services/safetyService';
import { BlockedUser } from '../src/types';

export default function PrivacySafetyScreen() {
  const profile = useAuthStore((state) => state.profile);
  const [showInDiscovery, setShowInDiscovery] = useState(profile?.is_visible !== false);
  const [readReceipts, setReadReceipts] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  useEffect(() => {
    const loadBlocked = async () => {
      try {
        const list = await safetyService.getBlockedUsers();
        setBlockedUsers(list);
      } catch {
        // ignore
      }
    };
    loadBlocked();
  }, []);

  const handleToggleDiscovery = async (val: boolean) => {
    setShowInDiscovery(val);
    try {
      await profileService.updateProfile({ is_visible: val });
    } catch {
      // ignore
    }
  };

  const handleViewBlockedAccounts = () => {
    if (blockedUsers.length === 0) {
      Alert.alert('Blocked Users', 'You have no blocked accounts.');
      return;
    }

    const names = blockedUsers.map((b) => b.blocked_profile?.display_name || 'Student').join(', ');
    Alert.alert('Blocked Accounts', `You have blocked: ${names}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Safety</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Security Badge Banner */}
        <View style={styles.banner}>
          <ShieldCheck size={28} color={colors.success} />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Verified Safe Campus Community</Text>
            <Text style={styles.bannerDesc}>
              UniDate uses end-to-end access rules and mutual-only matching to keep student interactions safe and authentic.
            </Text>
          </View>
        </View>

        {/* Discovery Visibility */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Discovery Controls</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Show Me on UniDate</Text>
              <Text style={styles.settingSubtitle}>
                Turn off to take a break. You won't appear in the discovery deck.
              </Text>
            </View>
            <Switch
              value={showInDiscovery}
              onValueChange={handleToggleDiscovery}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Send Read Receipts</Text>
              <Text style={styles.settingSubtitle}>
                Let matches see when you've read their messages.
              </Text>
            </View>
            <Switch
              value={readReceipts}
              onValueChange={setReadReceipts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Student Document Privacy Guarantee */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Student Data Vault</Text>

          <View style={styles.guaranteeRow}>
            <Lock size={20} color={colors.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.guaranteeTitle}>Strictly Private Student Credentials</Text>
              <Text style={styles.guaranteeBody}>
                Your student ID cards, matriculation numbers, and verification selfies are encrypted in our private storage vault with Supabase Row Level Security. They are never shown on your dating card or accessible to other members.
              </Text>
            </View>
          </View>

          <View style={styles.guaranteeRow}>
            <Eye size={20} color={colors.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.guaranteeTitle}>No Precise Live Location</Text>
              <Text style={styles.guaranteeBody}>
                We will never display your live GPS coordinates or exact real-time location. Discovery is based strictly on your university campus and department.
              </Text>
            </View>
          </View>
        </View>

        {/* Safety Tools & Blocked Accounts */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Safety Controls</Text>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={handleViewBlockedAccounts}
          >
            <View style={styles.linkLeft}>
              <Ban size={20} color={colors.textSecondary} />
              <Text style={styles.linkTitle}>Blocked Accounts ({blockedUsers.length})</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkRow, { borderBottomWidth: 0 }]}
            onPress={() =>
              Alert.alert(
                'Campus Dating Safety Tips',
                '1. Meet in public places on campus (e.g. Student Union, Library cafe).\n2. Tell a roommate or friend about your plans.\n3. Never share your passwords or banking details.\n4. Trust your instincts and report any inappropriate behavior.'
              )
            }
          >
            <View style={styles.linkLeft}>
              <HeartHandshake size={20} color={colors.primary} />
              <Text style={styles.linkTitle}>Campus Dating Safety Tips</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
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
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    gap: 12,
    marginBottom: 20,
    ...shadows.sm,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    ...typography.label,
    color: '#2E7D32',
    fontWeight: '700',
    marginBottom: 2,
  },
  bannerDesc: {
    ...typography.caption,
    color: '#388E3C',
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii['2xl'],
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    ...shadows.sm,
  },
  cardHeading: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    ...typography.body,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  settingSubtitle: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  guaranteeRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  guaranteeTitle: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  guaranteeBody: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkTitle: {
    ...typography.body,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});


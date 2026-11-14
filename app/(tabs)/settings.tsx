import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  HelpCircle,
  FileText,
  LogOut,
  Trash2,
  ChevronRight,
  Shield,
  ShieldCheck,
  X,
  AlertTriangle,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { AppHeader } from '../../src/components/navigation/AppHeader';
import { useAuthStore } from '../../src/stores/authStore';

export default function TabSettingsScreen() {
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [eventAlerts, setEventAlerts] = useState(true);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<null | 'logout' | 'delete'>(null);
  const [isBusy, setIsBusy] = useState(false);

  // Info modal state (for community rules / terms / help — no Alert.alert on web)
  const [infoModal, setInfoModal] = useState<{ title: string; body: string } | null>(null);

  const signOut = useAuthStore((state) => state.signOut);

  const handleLogout = () => setConfirmModal('logout');
  const handleDeleteAccount = () => setConfirmModal('delete');

  const handleConfirm = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await signOut();
      setConfirmModal(null);
      router.replace('/(auth)/welcome');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader title="Settings" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Notifications Group */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Notifications</Text>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.rowTitle}>New Matches</Text>
              <Text style={styles.rowSubtitle}>Get notified when you mutually connect</Text>
            </View>
            <Switch
              value={matchNotifications}
              onValueChange={setMatchNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.rowTitle}>Direct Messages</Text>
              <Text style={styles.rowSubtitle}>Notifications for new chats</Text>
            </View>
            <Switch
              value={messageNotifications}
              onValueChange={setMessageNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View>
              <Text style={styles.rowTitle}>Campus Event Reminders</Text>
              <Text style={styles.rowSubtitle}>RSVP and upcoming mixers</Text>
            </View>
            <Switch
              value={eventAlerts}
              onValueChange={setEventAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Safety and Verification */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Privacy & Safety</Text>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/privacy-safety')}
            activeOpacity={0.7}
          >
            <View style={styles.linkLeft}>
              <ShieldCheck size={18} color={colors.success} />
              <Text style={styles.linkTitle}>Privacy & Safety Center</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkRow, { borderBottomWidth: 0 }]}
            onPress={() =>
              setInfoModal({ title: 'Community Guidelines', body: '1. Adult students only (18+).\n2. Genuine campus identities.\n3. Consent and respect at all times.\n4. Zero tolerance for harassment or hate speech.' })
            }
            activeOpacity={0.7}
          >
            <View style={styles.linkLeft}>
              <Shield size={18} color={colors.primary} />
              <Text style={styles.linkTitle}>Community Guidelines</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Support & Legal */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Support & Legal</Text>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() =>
              setInfoModal({ title: 'Terms of Service', body: 'UniDate is operated for adult tertiary university students. By continuing you agree to verified identity rules and privacy standards.' })
            }
            activeOpacity={0.7}
          >
            <View style={styles.linkLeft}>
              <FileText size={18} color={colors.textSecondary} />
              <Text style={styles.linkTitle}>Terms of Service</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkRow, { borderBottomWidth: 0 }]}
            onPress={() =>
              setInfoModal({ title: 'Help & Support', body: 'Need help with verification or have safety concerns?\n\nEmail us at: support@unidate.app' })
            }
            activeOpacity={0.7}
          >
            <View style={styles.linkLeft}>
              <HelpCircle size={18} color={colors.textSecondary} />
              <Text style={styles.linkTitle}>Contact Campus Support</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Account</Text>

          <TouchableOpacity style={styles.linkRow} onPress={handleLogout}>
            <View style={styles.linkLeft}>
              <LogOut size={18} color={colors.textPrimary} />
              <Text style={styles.linkTitle}>Log Out</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkRow, { borderBottomWidth: 0 }]}
            onPress={handleDeleteAccount}
          >
            <View style={styles.linkLeft}>
              <Trash2 size={18} color={colors.error} />
              <Text style={[styles.linkTitle, { color: colors.error }]}>Delete Account</Text>
            </View>
            <ChevronRight size={18} color={colors.error} />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionFooter}>UniDate v1.0.0 • Verified Campus Edition</Text>
      </ScrollView>

      {/* ── Info Modal (community rules / terms / help) ── */}
      <Modal
        visible={infoModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{infoModal?.title}</Text>
            <Text style={[styles.modalBody, { textAlign: 'left' }]}>{infoModal?.body}</Text>
            <TouchableOpacity
              style={[styles.modalConfirmBtn, { width: '100%' }]}
              onPress={() => setInfoModal(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalConfirmText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Confirmation Modal (web-safe, no Alert.alert) ── */}
      <Modal
        visible={confirmModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Icon */}
            <View style={[
              styles.modalIconCircle,
              confirmModal === 'delete' ? styles.modalIconCircleRed : styles.modalIconCircleGray,
            ]}>
              {confirmModal === 'delete'
                ? <AlertTriangle size={28} color={colors.error} />
                : <LogOut size={28} color={colors.textPrimary} />
              }
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>
              {confirmModal === 'delete' ? 'Delete Account?' : 'Log Out?'}
            </Text>

            {/* Body */}
            <Text style={styles.modalBody}>
              {confirmModal === 'delete'
                ? 'This will permanently erase your profile, matches, and verified status. This cannot be undone.'
                : 'Are you sure you want to log out of UniDate?'
              }
            </Text>

            {/* Buttons */}
            <View style={styles.modalBtnsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setConfirmModal(null)}
                activeOpacity={0.75}
                disabled={isBusy}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  confirmModal === 'delete' && styles.modalConfirmBtnRed,
                  isBusy && { opacity: 0.6 },
                ]}
                onPress={handleConfirm}
                activeOpacity={0.8}
                disabled={isBusy}
              >
                <Text style={styles.modalConfirmText}>
                  {isBusy
                    ? 'Please wait…'
                    : confirmModal === 'delete'
                      ? 'Delete Permanently'
                      : 'Log Out'
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowTitle: {
    ...typography.body,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  rowSubtitle: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: 2,
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
  versionFooter: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },

  // ── Confirmation Modal ──────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii['2xl'],
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...shadows.md,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalIconCircleGray: {
    backgroundColor: '#F3F4F6',
  },
  modalIconCircleRed: {
    backgroundColor: '#FEE2E2',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBody: {
    ...typography.supporting,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalBtnsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  modalCancelText: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textPrimary,
  },
  modalConfirmBtnRed: {
    backgroundColor: colors.error,
  },
  modalConfirmText: {
    ...typography.label,
    color: colors.white,
    fontWeight: '700',
  },
});


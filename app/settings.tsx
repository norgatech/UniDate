import React, { useState } from 'react';
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
  Bell,
  Lock,
  HelpCircle,
  FileText,
  LogOut,
  Trash2,
  ChevronRight,
  Shield,
} from 'lucide-react-native';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { useAuthStore } from '../src/stores/authStore';

export default function SettingsScreen() {
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [eventAlerts, setEventAlerts] = useState(true);

  const signOut = useAuthStore((state) => state.signOut);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of UniDate?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account Permanently',
      'This will permanently erase your profile, matches, conversations, and verified status. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () => {
            signOut();
            Alert.alert('Account Deleted', 'Your student account has been removed.');
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
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
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 44 }} />
        </View>

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

        {/* Support & Legal */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Support & Legal</Text>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() =>
              Alert.alert('Community Rules', '1. Adult students only (18+).\n2. Genuine campus identities.\n3. Consent and respect at all times.\n4. Zero tolerance for harassment or hate speech.')
            }
          >
            <View style={styles.linkLeft}>
              <Shield size={18} color={colors.primary} />
              <Text style={styles.linkTitle}>Community Guidelines</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() =>
              Alert.alert('Terms of Service', 'UniDate is operated for adult tertiary university students. By continuing you agree to verified identity rules and privacy standards.')
            }
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
              Alert.alert('Help & Support', 'Need help with verification or have safety concerns? Email support@unidate.app')
            }
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
});


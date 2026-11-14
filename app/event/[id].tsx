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
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Share2,
  Check,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radii, shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import { MOCK_EVENTS } from '../../src/data/mockData';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = MOCK_EVENTS.find((e) => e.id === id) || MOCK_EVENTS[0];
  const [isRsvped, setIsRsvped] = useState(event.is_rsvped);
  const [rsvpCount, setRsvpCount] = useState(event.rsvp_count);

  const toggleRSVP = () => {
    if (isRsvped) {
      setIsRsvped(false);
      setRsvpCount((prev) => prev - 1);
    } else {
      setIsRsvped(true);
      setRsvpCount((prev) => prev + 1);
      Alert.alert('RSVP Confirmed! 🎉', `You are registered for ${event.title}. We'll send you a reminder.`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Navigation Top Bar */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => Alert.alert('Share Event', 'Link copied to clipboard!')}
            activeOpacity={0.7}
          >
            <Share2 size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Event Header Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.dateFloatingBadge}>
            <Text style={styles.dateDay}>14</Text>
            <Text style={styles.dateMonth}>FEB</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>Campus Social</Text>
          </View>
        </View>

        {/* Event Title & Community verification tag */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.verifiedTag}>
            <ShieldCheck size={14} color={colors.success} />
            <Text style={styles.verifiedTagText}>University Affiliated Event</Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Calendar size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>Friday, 14 February 2025</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Clock size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{event.time}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <MapPin size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Venue</Text>
              <Text style={styles.detailValue}>{event.venue}</Text>
            </View>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <View style={styles.detailIconBox}>
              <Users size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Attendees</Text>
              <Text style={styles.detailValue}>{rsvpCount} students confirmed</Text>
            </View>
          </View>
        </View>

        {/* About Event */}
        <View style={styles.aboutCard}>
          <Text style={styles.sectionHeading}>About the Event</Text>
          <Text style={styles.descriptionText}>
            {event.description}
          </Text>
          <Text style={styles.rulesNotice}>
            * Open exclusively to verified 18+ university students. Please bring your student ID card or have your active UniDate profile ready at entry.
          </Text>
        </View>

        {/* Organizer info */}
        <View style={styles.organizerRow}>
          <Text style={styles.organizerLabel}>Organized by: </Text>
          <Text style={styles.organizerName}>{event.organizer}</Text>
        </View>

        {/* RSVP Action */}
        <View style={styles.actionContainer}>
          <Button
            title={isRsvped ? 'Cancel RSVP' : 'Confirm RSVP'}
            onPress={toggleRSVP}
            variant={isRsvped ? 'secondary' : 'primary'}
            showArrow={!isRsvped}
          />
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
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerContainer: {
    height: 160,
    borderRadius: radii['2xl'],
    backgroundColor: colors.primary,
    padding: 16,
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: 20,
    overflow: 'hidden',
  },
  dateFloatingBadge: {
    width: 60,
    height: 66,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '800',
  },
  dateMonth: {
    ...typography.captionSmall,
    color: colors.primaryDeep,
    fontWeight: '700',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  categoryText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '700',
  },
  titleSection: {
    marginBottom: 16,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  verifiedTagText: {
    ...typography.captionSmall,
    color: colors.success,
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: radii['2xl'],
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    ...shadows.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  detailLabel: {
    ...typography.captionSmall,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.body,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  aboutCard: {
    backgroundColor: colors.surface,
    borderRadius: radii['2xl'],
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 8,
  },
  descriptionText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  rulesNotice: {
    ...typography.captionSmall,
    color: colors.primary,
    marginTop: 14,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  organizerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  organizerName: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  actionContainer: {
    marginTop: 'auto',
  },
});


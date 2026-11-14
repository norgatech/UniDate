import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, Users, Check } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radii, shadows } from '../../src/theme/spacing';
import { MOCK_EVENTS } from '../../src/data/mockData';
import { CampusEvent } from '../../src/types';
import { AppHeader } from '../../src/components/navigation/AppHeader';

export default function CampusEventsScreen() {
  const [events, setEvents] = useState<CampusEvent[]>(MOCK_EVENTS);

  const toggleRSVP = (eventId: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          const isNowRsvped = !ev.is_rsvped;
          return {
            ...ev,
            is_rsvped: isNowRsvped,
            rsvp_count: isNowRsvped ? ev.rsvp_count + 1 : ev.rsvp_count - 1,
          };
        }
        return ev;
      })
    );
  };

  const handleOpenDetail = (eventId: string) => {
    router.push({
      pathname: '/event/[id]',
      params: { id: eventId },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader title="Events" />

      <View style={styles.container}>
        {/* Subtitle */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>Discover speed dating, mixers, and campus social activities</Text>
        </View>

        {/* Events List */}
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const eventDate = new Date(item.date);
            const day = eventDate.getDate() || 14;
            const month = 'FEB';

            return (
              <TouchableOpacity
                style={styles.eventCard}
                onPress={() => handleOpenDetail(item.id)}
                activeOpacity={0.8}
              >
                {/* Date Badge Column matching reference */}
                <View style={styles.dateBadge}>
                  <Text style={styles.dateDay}>{day}</Text>
                  <Text style={styles.dateMonth}>{month}</Text>
                </View>

                {/* Event Information */}
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{item.title}</Text>

                  <View style={styles.metaRow}>
                    <Clock size={13} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{item.time}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <MapPin size={13} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{item.venue}</Text>
                  </View>

                  {/* RSVP Button matching reference style */}
                  <TouchableOpacity
                    style={[styles.rsvpBtn, item.is_rsvped && styles.rsvpBtnActive]}
                    onPress={() => toggleRSVP(item.id)}
                    activeOpacity={0.7}
                  >
                    {item.is_rsvped && <Check size={14} color={colors.primary} style={{ marginRight: 4 }} />}
                    <Text style={[styles.rsvpBtnText, item.is_rsvped && styles.rsvpBtnTextActive]}>
                      {item.is_rsvped ? 'Attending' : 'RSVP'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 24,
    gap: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii['2xl'],
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.sm,
  },
  dateBadge: {
    width: 64,
    height: 72,
    backgroundColor: colors.pink,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dateDay: {
    ...typography.h1,
    fontSize: 26,
    lineHeight: 30,
    color: colors.primary,
    fontWeight: '800',
  },
  dateMonth: {
    ...typography.captionSmall,
    color: colors.primaryDeep,
    fontWeight: '700',
    letterSpacing: 1,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rsvpBtn: {
    backgroundColor: colors.pink,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rsvpBtnActive: {
    backgroundColor: '#FFE2E4',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  rsvpBtnText: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '700',
  },
  rsvpBtnTextActive: {
    color: colors.primary,
  },
});


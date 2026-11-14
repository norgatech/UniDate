import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Search } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { AppHeader } from '../../src/components/navigation/AppHeader';
import { EmptyState } from '../../src/components/ui/StateViews';
import { MOCK_CONVERSATIONS, MOCK_MATCHES } from '../../src/data/mockData';
import { Conversation, Match } from '../../src/types';
import { chatService } from '../../src/services/chatService';
import { matchingService } from '../../src/services/matchingService';

export default function MessagesScreen() {
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [convs, liveMatches] = await Promise.all([
        chatService.getConversations(),
        matchingService.getMatches(),
      ]);

      if (convs && convs.length > 0) {
        setConversations(convs);
      } else {
        // Fallback to sample demo conversations
        setConversations(MOCK_CONVERSATIONS);
      }

      if (liveMatches && liveMatches.length > 0) {
        setMatches(liveMatches);
      } else {
        setMatches(MOCK_MATCHES);
      }
    } catch {
      setConversations(MOCK_CONVERSATIONS);
      setMatches(MOCK_MATCHES);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const filteredConversations = conversations.filter((c) =>
    c.other_user.display_name.toLowerCase().includes(search.toLowerCase()) ||
    c.last_message?.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenChat = (item: Conversation | Match) => {
    if ('other_user' in item) {
      router.push({
        pathname: '/chat/[id]',
        params: {
          id: item.id,
          name: item.other_user.display_name,
          photo: item.other_user.photo_url,
        },
      });
    } else {
      router.push({
        pathname: '/chat/[id]',
        params: {
          id: item.id,
          name: item.other_profile?.display_name,
          photo: item.other_profile?.photos[0]?.url,
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader title="Messages" />

      <View style={styles.container}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* New Matches Horizontal Strip */}
        <View style={styles.matchesStripSection}>
          <Text style={styles.stripLabel}>New Matches</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.matchesScrollContent}
          >
            {matches.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.matchAvatarItem}
                onPress={() => handleOpenChat(m)}
                activeOpacity={0.8}
              >
                <View style={styles.avatarBorder}>
                  <Image
                    source={{ uri: m.other_profile?.photos[0]?.url }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                  <View style={styles.onlineBadge} />
                </View>
                <Text style={styles.matchAvatarName} numberOfLines={1}>
                  {m.other_profile?.display_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Conversations List */}
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 12, color: colors.textSecondary }}>
                  Loading conversations...
                </Text>
              </View>
            ) : (
              <EmptyState
                icon="message"
                title="No messages yet"
                message="When you mutually match with students, your conversations will appear here."
                actionLabel="Discover Students"
                onAction={() => router.push('/(tabs)')}
              />
            )
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.conversationItem}
              onPress={() => handleOpenChat(item)}
              activeOpacity={0.7}
            >
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: item.other_user.photo_url }}
                  style={styles.convAvatar}
                  contentFit="cover"
                />
                {item.other_user.is_online && <View style={styles.onlineDot} />}
              </View>

              <View style={styles.convDetails}>
                <View style={styles.convHeaderRow}>
                  <Text style={styles.convName}>{item.other_user.display_name}</Text>
                  <Text style={styles.convTime}>2m ago</Text>
                </View>
                <Text
                  style={[
                    styles.convSnippet,
                    item.unread_count > 0 && styles.convSnippetUnread,
                  ]}
                  numberOfLines={1}
                >
                  {item.last_message?.content || 'Sent a match wave! 👋'}
                </Text>
              </View>

              {item.unread_count > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread_count}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  matchesStripSection: {
    marginBottom: 18,
  },
  stripLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: 8,
  },
  matchesScrollContent: {
    gap: 14,
    paddingVertical: 4,
  },
  matchAvatarItem: {
    alignItems: 'center',
    width: 64,
  },
  avatarBorder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 2,
    position: 'relative',
    backgroundColor: colors.surface,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  matchAvatarName: {
    ...typography.captionSmall,
    color: colors.textPrimary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    ...shadows.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  convAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  convDetails: {
    flex: 1,
  },
  convHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  convName: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  convTime: {
    ...typography.captionSmall,
    color: colors.textSecondary,
  },
  convSnippet: {
    ...typography.supportingSmall,
    color: colors.textSecondary,
  },
  convSnippetUnread: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '700',
  },
});

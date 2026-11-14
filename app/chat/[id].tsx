import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  MoreVertical,
  Send,
  Sparkles,
  ShieldAlert,
  Ban,
  UserX,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, radii, shadows } from '../../src/theme/spacing';
import { Message } from '../../src/types';
import { chatService } from '../../src/services/chatService';
import { safetyService } from '../../src/services/safetyService';
import { useAuthStore } from '../../src/stores/authStore';

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    conversation_id: 'conv-1',
    sender_id: 'other_user',
    content: 'Hey! Thanks for matching with me',
    message_type: 'text',
    is_read: true,
    created_at: '2024-02-14T18:00:00Z',
  },
  {
    id: 'm2',
    conversation_id: 'conv-1',
    sender_id: 'current_user',
    content: "Hi Sarah! How's your day going?",
    message_type: 'text',
    is_read: true,
    created_at: '2024-02-14T18:02:00Z',
  },
  {
    id: 'm3',
    conversation_id: 'conv-1',
    sender_id: 'other_user',
    content: 'Pretty good! Just finished my Psychology lecture. Are you attending the campus mixer this Friday?',
    message_type: 'text',
    is_read: true,
    created_at: '2024-02-14T18:05:00Z',
  },
];

export default function ChatDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    initialWave?: string;
    name?: string;
    photo?: string;
    targetUserId?: string;
  }>();

  const conversationId = params.id || 'conv-1';
  const currentUser = useAuthStore((state) => state.user);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const otherUserName = params.name || 'Student Match';
  const otherUserPhoto =
    params.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';

  // Load message history & subscribe to live updates
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initChat = async () => {
      setIsLoading(true);
      try {
        const history = await chatService.getMessages(conversationId);
        if (history && history.length > 0) {
          setMessages(history);
        } else {
          // If mock or demo conversation
          setMessages(INITIAL_MESSAGES);
        }
        await chatService.markAsRead(conversationId);
      } catch {
        setMessages(INITIAL_MESSAGES);
      } finally {
        setIsLoading(false);
      }

      // Supabase Realtime channel subscription
      unsubscribe = chatService.subscribeToConversation(conversationId, (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        chatService.markAsRead(conversationId);
      });
    };

    initChat();

    // Send initial wave if navigated with initialWave
    if (params.initialWave === 'true') {
      handleSendWave();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversationId]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');

    // Optimistic message
    const tempId = 'm_' + Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUser?.id || 'current_user',
      content: textToSend,
      message_type: 'text',
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await chatService.sendMessage(conversationId, textToSend, 'text');
      if (res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? res.message! : m))
        );
      }
    } catch {
      // In demo mode without backend conversation, simulate response
      setTimeout(() => {
        const replyMsg: Message = {
          id: 'm_' + (Date.now() + 1),
          conversation_id: conversationId,
          sender_id: 'other_user',
          content: "Awesome! Let's definitely grab coffee together at the student center! ☕",
          message_type: 'text',
          is_read: true,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, replyMsg]);
      }, 1200);
    }
  };

  const handleSendWave = async () => {
    const waveMsg: Message = {
      id: 'm_' + Date.now(),
      conversation_id: conversationId,
      sender_id: currentUser?.id || 'current_user',
      content: '👋 Sent a Campus Wave!',
      message_type: 'wave',
      is_read: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, waveMsg]);

    try {
      await chatService.sendMessage(conversationId, '👋 Sent a Campus Wave!', 'wave');
    } catch {
      // ignore
    }
  };

  const handleReport = () => {
    setMenuVisible(false);
    router.push({
      pathname: '/report',
      params: {
        reportedUserId: params.targetUserId || 'demo-user',
        reportedUserName: otherUserName,
      },
    });
  };

  const handleBlock = () => {
    setMenuVisible(false);
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${otherUserName}? They will not be able to see your profile or message you.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            if (params.targetUserId) {
              await safetyService.blockUser(params.targetUserId);
            }
            Alert.alert('User Blocked', `${otherUserName} has been blocked.`);
            router.back();
          },
        },
      ]
    );
  };

  const handleUnmatch = () => {
    setMenuVisible(false);
    Alert.alert(
      'Unmatch',
      `Are you sure you want to unmatch with ${otherUserName}? The conversation will be removed for both of you.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unmatch',
          style: 'destructive',
          onPress: () => {
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header matching reference */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.userInfoRow}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: otherUserPhoto }} style={styles.avatar} contentFit="cover" />
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={styles.userName}>{otherUserName}</Text>
              <Text style={styles.userStatus}>Online</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.7}
          >
            <MoreVertical size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Message Thread */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isMe = item.sender_id === 'current_user';
            return (
              <View
                style={[
                  styles.messageRow,
                  isMe ? styles.messageRowRight : styles.messageRowLeft,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isMe ? styles.bubbleMe : styles.bubbleThem,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isMe ? styles.messageTextMe : styles.messageTextThem,
                    ]}
                  >
                    {item.content}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* Bottom Input Bar */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.waveIconButton}
            onPress={handleSendWave}
            activeOpacity={0.7}
          >
            <Sparkles size={20} color={colors.primary} />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Send size={18} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Moderation / Safety Action Modal */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.actionMenuSheet}>
              <Text style={styles.menuHeaderTitle}>{otherUserName}</Text>

              <TouchableOpacity style={styles.actionMenuItem} onPress={handleReport}>
                <ShieldAlert size={20} color={colors.warning} />
                <Text style={styles.actionMenuText}>Report User</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionMenuItem} onPress={handleBlock}>
                <Ban size={20} color={colors.error} />
                <Text style={[styles.actionMenuText, { color: colors.error }]}>Block User</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionMenuItem, { borderBottomWidth: 0 }]}
                onPress={handleUnmatch}
              >
                <UserX size={20} color={colors.textSecondary} />
                <Text style={styles.actionMenuText}>Unmatch</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 12,
  },
  userInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
  userName: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  userStatus: {
    ...typography.captionSmall,
    color: colors.success,
    fontWeight: '600',
  },
  menuButton: {
    padding: 8,
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  bubbleThem: {
    backgroundColor: colors.pink, // Blush pink matching reference
    borderBottomLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomRightRadius: 4,
  },
  messageText: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 21,
  },
  messageTextThem: {
    color: colors.textPrimary,
  },
  messageTextMe: {
    color: colors.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  waveIconButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 42,
    maxHeight: 100,
    ...typography.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  actionMenuSheet: {
    backgroundColor: colors.surface,
    borderRadius: radii['2xl'],
    padding: 20,
    width: '100%',
    maxWidth: 320,
    ...shadows.md,
  },
  menuHeaderTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionMenuText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});


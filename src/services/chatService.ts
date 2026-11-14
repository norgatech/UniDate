/**
 * UniDate — Real-time Messaging Service
 * Full Supabase Realtime integration, message history, conversation listings, and read receipts.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Conversation, Message } from '../types';

export const chatService = {
  /**
   * Fetch all active conversations for the current user.
   */
  async getConversations(): Promise<Conversation[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Query conversations via matches
      const { data: convData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          match_id,
          created_at,
          updated_at,
          matches!inner (
            id,
            user1_id,
            user2_id,
            is_active
          )
        `)
        .order('updated_at', { ascending: false });

      if (error || !convData) {
        console.warn('Error fetching conversations:', error?.message);
        return [];
      }

      // Filter to conversations involving the current user and active matches
      const userConvs = convData.filter((c: any) => {
        const m = Array.isArray(c.matches) ? c.matches[0] : c.matches;
        return m && m.is_active && (m.user1_id === user.id || m.user2_id === user.id);
      });

      if (userConvs.length === 0) return [];

      // Fetch counterpart profile details and latest messages
      const results: Conversation[] = [];

      for (const conv of userConvs) {
        const m: any = Array.isArray(conv.matches) ? conv.matches[0] : conv.matches;
        if (!m) continue;
        const otherUserId = m.user1_id === user.id ? m.user2_id : m.user1_id;

        // Fetch other user's profile
        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('id, display_name, photos')
          .eq('id', otherUserId)
          .maybeSingle();

        // Fetch last message
        const { data: lastMsgData } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Fetch unread count
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', user.id);

        const primaryPhoto = Array.isArray(otherProfile?.photos)
          ? otherProfile.photos[0]?.url
          : undefined;

        results.push({
          id: conv.id,
          match_id: conv.match_id,
          other_user: {
            id: otherUserId,
            display_name: otherProfile?.display_name || 'Campus Student',
            photo_url: primaryPhoto,
            is_online: false,
          },
          last_message: lastMsgData
            ? {
                id: lastMsgData.id,
                conversation_id: lastMsgData.conversation_id,
                sender_id: lastMsgData.sender_id,
                content: lastMsgData.content,
                message_type: lastMsgData.message_type || 'text',
                is_read: Boolean(lastMsgData.is_read),
                created_at: lastMsgData.created_at,
              }
            : undefined,
          unread_count: unreadCount || 0,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
        });
      }

      return results;
    } catch (err) {
      console.warn('Exception in getConversations:', err);
      return [];
    }
  },

  /**
   * Fetch message history for a specific conversation.
   */
  async getMessages(conversationId: string, limit = 50): Promise<Message[]> {
    if (!isSupabaseConfigured() || !conversationId) return [];

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error || !data) {
        console.warn('Error fetching messages:', error?.message);
        return [];
      }

      return data.map((m: any) => ({
        id: m.id,
        conversation_id: m.conversation_id,
        sender_id: m.sender_id,
        content: m.content,
        message_type: m.message_type || 'text',
        is_read: Boolean(m.is_read),
        created_at: m.created_at,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Send a message in a conversation.
   */
  async sendMessage(
    conversationId: string,
    content: string,
    messageType: 'text' | 'wave' | 'image' = 'text'
  ): Promise<{ message: Message | null; error?: string }> {
    if (!isSupabaseConfigured()) return { message: null, error: 'Supabase not configured' };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { message: null, error: 'User not authenticated' };

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: messageType,
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        return { message: null, error: error.message };
      }

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      const newMsg: Message = {
        id: data.id,
        conversation_id: data.conversation_id,
        sender_id: data.sender_id,
        content: data.content,
        message_type: data.message_type || 'text',
        is_read: Boolean(data.is_read),
        created_at: data.created_at,
      };

      return { message: newMsg };
    } catch (err: any) {
      return { message: null, error: err.message || 'Failed to send message' };
    }
  },

  /**
   * Mark all unread incoming messages in a conversation as read.
   */
  async markAsRead(conversationId: string): Promise<void> {
    if (!isSupabaseConfigured() || !conversationId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    } catch {
      // ignore
    }
  },

  /**
   * Subscribe to real-time incoming messages for a conversation.
   * Returns an unsubscribe function for cleanup.
   */
  subscribeToConversation(
    conversationId: string,
    onNewMessage: (message: Message) => void
  ): () => void {
    if (!isSupabaseConfigured() || !conversationId) {
      return () => {};
    }

    const channelName = `realtime:messages:${conversationId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as any;
          if (m) {
            onNewMessage({
              id: m.id,
              conversation_id: m.conversation_id,
              sender_id: m.sender_id,
              content: m.content,
              message_type: m.message_type || 'text',
              is_read: Boolean(m.is_read),
              created_at: m.created_at,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};

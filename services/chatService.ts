import { supabase } from './supabaseClient';
import { Message } from '../types';

export interface DatabaseUser {
  id: string;
  username: string;
  theme: string;
  api_key: string | null;
  system_instruction: string;
  created_at: string;
  last_active: string;
}

export interface DatabaseMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  username: string;
  user_id: string | null;
  timestamp: number;
  is_streaming: boolean;
  created_at: string;
}

export const getOrCreateUser = async (username: string) => {
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (existingUser) {
    return existingUser as DatabaseUser;
  }

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      username,
      theme: 'emerald',
      system_instruction: 'You are a helpful AI assistant.'
    })
    .select()
    .single();

  if (error) throw error;
  return newUser as DatabaseUser;
};

export const getUserByUsername = async (username: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error) throw error;
  return data as DatabaseUser | null;
};

export const updateUserSettings = async (userId: string, updates: Partial<DatabaseUser>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as DatabaseUser;
};

export const getAllMessages = async () => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as DatabaseMessage[];
};

export const addMessage = async (message: Omit<Message, 'id'> & { userId?: string }) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      text: message.text,
      sender: message.sender,
      username: message.username,
      user_id: message.userId || null,
      timestamp: message.timestamp,
      is_streaming: message.isStreaming || false
    })
    .select()
    .single();

  if (error) throw error;
  return data as DatabaseMessage;
};

export const updateMessage = async (messageId: string, updates: Partial<DatabaseMessage>) => {
  const { data, error } = await supabase
    .from('messages')
    .update(updates)
    .eq('id', messageId)
    .select()
    .single();

  if (error) throw error;
  return data as DatabaseMessage;
};

export const deleteAllMessages = async () => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) throw error;
};

export const subscribeToMessages = (callback: (message: DatabaseMessage) => void) => {
  const subscription = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages'
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as DatabaseMessage);
        }
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const subscribeToMessageUpdates = (messageId: string, callback: (message: DatabaseMessage) => void) => {
  const subscription = supabase
    .channel(`message-${messageId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `id=eq.${messageId}`
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as DatabaseMessage);
        }
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

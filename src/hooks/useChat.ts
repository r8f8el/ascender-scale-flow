
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'client' | 'admin';
  chat_room_id: string;
  created_at: string;
}

interface ChatRoom {
  id: string;
  client_id: string;
  client_name: string;
  created_at: string;
  last_message_at: string;
}

export const useChat = (isAdmin = false) => {
  const { user, client } = useAuth();
  const { toast } = useToast();
  
  console.log('🔄 useChat hook initialized - user:', user?.id, 'client:', client?.id, 'isAdmin:', isAdmin);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Carregar salas de chat
  const loadChatRooms = useCallback(async () => {
    if (!user) {
      console.log('⚠️ loadChatRooms: No user, skipping');
      return;
    }

    try {
      console.log('🔄 Loading chat rooms for user:', user.id);
      setLoading(true);
      
      let query = supabase.from('chat_rooms').select('*');
      
      if (!isAdmin) {
        query = query.eq('client_id', user.id);
      }
      
      const { data, error } = await query.order('last_message_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error loading chat rooms:', error);
        throw error;
      }
      
      console.log('✅ Chat rooms loaded:', data?.length);
      setRooms(data || []);
    } catch (error) {
      console.error('❌ Exception in loadChatRooms:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  // Carregar mensagens de uma sala
  const loadMessages = useCallback(async (roomId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Type assertion to ensure correct typing
      const typedMessages = (data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'client' | 'admin'
      }));
      
      setMessages(typedMessages);
      setCurrentRoom(roomId);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens do chat",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Criar ou encontrar sala de chat para cliente
  const createOrFindRoom = useCallback(async () => {
    if (!user || !client || isAdmin) {
      console.log('⚠️ createOrFindRoom: Missing requirements - user:', !!user, 'client:', !!client, 'isAdmin:', isAdmin);
      return null;
    }

    try {
      console.log('🔄 Creating/finding room for user:', user.id);
      // Verificar se já existe uma sala para este cliente
      const { data: existingRoom, error: findError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('client_id', user.id)
        .maybeSingle(); // Changed to maybeSingle to avoid errors when no room exists

      if (findError) {
        console.error('❌ Error finding existing room:', findError);
        throw findError;
      }

      if (existingRoom) {
        console.log('✅ Found existing room:', existingRoom.id);
        setCurrentRoom(existingRoom.id);
        return existingRoom.id;
      }

      console.log('🔄 Creating new room for client:', client.name);
      // Criar nova sala
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
          client_id: user.id,
          client_name: client.name || user.email?.split('@')[0] || 'Cliente'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating room:', createError);
        throw createError;
      }
      
      console.log('✅ New room created:', newRoom.id);
      await loadChatRooms();
      setCurrentRoom(newRoom.id);
      return newRoom.id;
    } catch (error) {
      console.error('❌ Exception in createOrFindRoom:', error);
      return null;
    }
  }, [user, client, isAdmin, loadChatRooms]);

  // Enviar mensagem
  const sendMessage = useCallback(async (content: string, roomId?: string) => {
    if (!user || !content.trim()) return false;

    try {
      setSending(true);
      
      let targetRoomId = roomId || currentRoom;
      
      // Se não há sala atual e não é admin, criar uma
      if (!targetRoomId && !isAdmin) {
        targetRoomId = await createOrFindRoom();
        if (!targetRoomId) throw new Error('Não foi possível criar sala de chat');
      }

      if (!targetRoomId) {
        throw new Error('Nenhuma sala selecionada');
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          content: content.trim(),
          sender_id: user.id,
          sender_name: isAdmin ? 'Suporte' : (client?.name || user.email?.split('@')[0] || 'Cliente'),
          sender_type: isAdmin ? 'admin' : 'client',
          chat_room_id: targetRoomId
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive"
      });
      return false;
    } finally {
      setSending(false);
    }
  }, [user, client, currentRoom, isAdmin, createOrFindRoom, toast]);

  // Configurar realtime
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chat-updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' }, 
        (payload) => {
          const newMessage = payload.new as any;
          if (newMessage.chat_room_id === currentRoom) {
            setMessages(prev => [...prev, {
              ...newMessage,
              sender_type: newMessage.sender_type as 'client' | 'admin'
            }]);
          }
          loadChatRooms(); // Atualizar lista de salas
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_rooms' },
        () => {
          loadChatRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentRoom, loadChatRooms]);

  // Carregar salas inicialmente
  useEffect(() => {
    if (user) {
      loadChatRooms();
    }
  }, [user, loadChatRooms]);

  return {
    messages,
    rooms,
    currentRoom,
    loading,
    sending,
    loadMessages,
    sendMessage,
    createOrFindRoom,
    setCurrentRoom
  };
};
